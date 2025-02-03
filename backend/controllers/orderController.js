import mongoose from "mongoose";
import OrderModel from "../models/orderModel.js";
import UserModel from "../models/userModel.js";
import ProviderModel from "../models/providerModel.js";
import AdminModel from "../models/adminModel.js";

export const getOrder = async (req, res) => {
  try {
    const { userId } = req.body;

    // Find the user by userId and populate the orders
    const user = await UserModel.findById(userId).populate({
      path: "orders.provider._id", // Specify the path to populate
      model: "Provider", // Explicitly specify the model to use
    });

    // Check if user exists
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Respond with the user's orders, even if it's an empty array
    res.status(200).json({ orders: user.orders || [] });
  } catch (error) {
    console.error("Error fetching user orders:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const addOrder = async (req, res) => {
  const { userId, orders, totalPrice, userLocation } = req.body;

  try {
    if (
      !userId ||
      !orders ||
      orders.length === 0 ||
      !userLocation ||
      !totalPrice
    ) {
      return res.status(400).json({ message: "Invalid input data" });
    }
    // Fetch the user
    const user = await UserModel.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    // Create new orders with the userId field
    const newOrders = orders.map((order) => ({
      ...order,
      userId,
      providerEmail: order.provider.email,
      providerLocation: {
        lat: order.providerLocation.latitude, // Extracted from the incoming order payload
        lng: order.providerLocation.longitude,
      },
      orderPlacedAt: new Date(), // Automatically set current timestamp
    }));
    user.orders.push(...newOrders);
    await user.save();

    // Fetch the single admin (since there's only one)
    const admin = await AdminModel.findOne();
    if (!admin) {
      return res.status(404).json({ message: "Admin not found" });
    }
    // Initialize an array for the provider orders
    const providerOrders = [];
    // Loop through the orders to process each one
    for (const order of orders) {
      const providerId = order.provider._id;
      // Fetch the provider
      const provider = await ProviderModel.findById(providerId);
      if (!provider) {
        return res
          .status(404)
          .json({ message: `Provider with ID ${providerId} not found` });
      }
      // Create the order object for each provider
      const newOrder = {
        userId, // User placing the order
        userName: user.name,
        userPhone: user.phone,
        userEmail: user.email,
        userLocation: {
          lat: userLocation.lat,
          lon: userLocation.lng,
        },
        scheduleTime: order.scheduleTime,
        status: "placed",
        price: totalPrice,
        orderPlacedAt: new Date(),
        cartId: order.cartId, // Include cartId here
        provider: {
          _id: provider._id,
          name: provider.name,
          email: provider.email,
          phone: provider.phone,
          address: provider.address,
          price: provider.price,
          image: provider.image,
          description: provider.description,
        },
        providerEmail: provider.email,
      };
      // Push the new order to the providerOrders array
      providerOrders.push(newOrder);
      // Optionally, update provider's orders array if needed
      provider.orders.push(newOrder);
      await provider.save();
    }

    // Now, create the main Order document
    const newOrderDocument = new OrderModel({
      userId, // User placing the order
      orders: providerOrders, // Array of orders with their providers
      totalPrice,
      paymentStatus: "Unpaid",
      cartId: orders[0].cartId, // Default payment status
    });
    await newOrderDocument.save();

    const adminOrders = [];
    for (const order of orders) {
      const provider = await ProviderModel.findById(order.provider._id);
      if (!provider) {
        return res
          .status(404)
          .json({ message: `Provider not found for ID ${order.provider._id}` });
      } // Create admin order
      const adminOrder = {
        orderId: new mongoose.Types.ObjectId(), // Generate a unique ID for the order
        user: {
          userId: user._id,
          name: user.name,
          phone: user.phone,
          location: { lat: userLocation.lat, lon: userLocation.lng },
        },
        provider: {
          providerId: provider._id,
          name: provider.name,
          phone: provider.phone,
          location: {
            lat: provider.location.latitude,
            lon: provider.location.longitude,
          },
        },
        timeOrderPlaced: new Date(),
        scheduleTime: order.scheduleTime,
        status: "placed",
        price: totalPrice, // Assuming provider's price is per order
        providerEmail: provider.email,
        userId: user._id,
        cartId: order.cartId, // Add cartId to the admin order
      };
      adminOrders.push(adminOrder);
    }

    // Save admin orders to the admin document
    admin.orders.push(...adminOrders);
    await admin.save();

    res.status(201).json({
      message: "Order(s) placed successfully",
      order: newOrderDocument,
    });
  } catch (error) {
    console.error("Error placing order:", error);
    res.status(500).json({ message: "Internal server error", error });
  }
};

export const feedbackForm = async (req, res) => {
  const { userId, orderId, rating, providerEmail, comment, scheduleTime } =
    req.body;

  try {
    if (rating < 1 || rating > 5) {
      return res
        .status(400)
        .json({ message: "Rating should be between 1 and 5 stars" });
    }
    const user = await UserModel.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const userOrder = user.orders.id(orderId);
    if (!userOrder) {
      return res.status(404).json({ message: "Order not found" });
    }
    if (userOrder.status !== "completed") {
      return res.status(400).json({
        message: "Feedback can only be provided for completed orders",
      });
    }
    const existingReview = userOrder.reviews.find(
      (review) =>
        review.userId.toString() === userId &&
        new Date(review.scheduleTime).getTime() ===
          new Date(scheduleTime).getTime()
    );
    if (existingReview) {
      // Update the existing review
      existingReview.star = rating;
      existingReview.comment = comment || "";
    } else {
      const newReview = {
        userId: user._id,
        star: rating,
        comment: comment || "",
        scheduleTime: new Date(scheduleTime),
      };
      userOrder.reviews.push(newReview);
    }
    await user.save();

    const provider = await ProviderModel.findOne({
      "orders.userId": userId,
      "orders.scheduleTime": new Date(scheduleTime),
    });
    if (!provider) {
      return res.status(404).json({ message: "Provider or order not found" });
    }
    const providerOrder = provider.orders.find(
      (order) =>
        order.userId.toString() === userId &&
        new Date(order.scheduleTime).getTime() ===
          new Date(scheduleTime).getTime()
    );
    if (!providerOrder) {
      return res.status(404).json({ message: "Order not found" });
    }
    if (providerOrder.status !== "completed") {
      return res.status(400).json({
        message: "Feedback can only be provided for completed orders",
      });
    }
    const existingProviderReview = providerOrder.reviews.find(
      (review) =>
        review.userId.toString() === userId &&
        new Date(review.scheduleTime).getTime() ===
          new Date(scheduleTime).getTime()
    );
    if (existingProviderReview) {
      existingProviderReview.star = rating;
      existingProviderReview.comment = comment || "";
    } else {
      const newReview = {
        userId: userId,
        star: rating,
        comment: comment || "",
        scheduleTime: new Date(scheduleTime),
      };
      providerOrder.reviews.push(newReview);
    }
    await provider.save();
    // Calculate the new average rating and count for the provider
    const allReviews = provider.orders.flatMap((order) => order.reviews);
    const totalReviews = allReviews.length;
    const totalStars = allReviews.reduce((acc, review) => acc + review.star, 0);

    provider.totalRating.average =
      totalReviews > 0 ? totalStars / totalReviews : 0;
    provider.totalRating.count = totalReviews;

    await provider.save();

    const order = await OrderModel.findOne({
      userId: userId,
      "orders.scheduleTime": new Date(scheduleTime),
      "orders.providerEmail": providerEmail,
    });
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }
    const orderOrder = order.orders.find(
      (o) =>
        o.providerEmail === providerEmail &&
        new Date(o.scheduleTime).getTime() === new Date(scheduleTime).getTime()
    );
    if (!orderOrder) {
      return res.status(404).json({ message: "Order not found in Orders" });
    }
    if (orderOrder.status !== "completed") {
      return res.status(400).json({
        message: "Feedback can only be provided for completed orders",
      });
    }
    const existingOrderReview = orderOrder.reviews.find(
      (review) =>
        review.userId.toString() === userId &&
        new Date(review.scheduleTime).getTime() ===
          new Date(scheduleTime).getTime()
    );

    if (existingOrderReview) {
      // Update the existing review
      existingOrderReview.star = rating;
      existingOrderReview.comment = comment || "";
    } else {
      const newReview = {
        userId: userId,
        star: rating,
        comment: comment || "",
        scheduleTime: new Date(scheduleTime),
      };
      orderOrder.reviews.push(newReview);
    }
    await order.save();

    const admin = await AdminModel.findOne({
      "orders.user.userId": userId,
      "orders.scheduleTime": new Date(scheduleTime),
      "orders.providerEmail": providerEmail,
    });
    if (!admin) {
      return res.status(404).json({ message: "Admin order not found" });
    }
    const adminOrder = admin.orders.find(
      (o) =>
        o.user.userId.toString() === userId &&
        o.providerEmail === providerEmail &&
        new Date(o.scheduleTime).getTime() === new Date(scheduleTime).getTime()
    );
    if (adminOrder) {
      const existingAdminReview = adminOrder.reviews.find(
        (review) =>
          review.userId.toString() === userId &&
          new Date(review.scheduleTime).getTime() ===
            new Date(scheduleTime).getTime()
      );
      if (existingAdminReview) {
        existingAdminReview.star = rating;
        existingAdminReview.comment = comment || "";
      } else {
        const newReview = {
          userId: userId,
          star: rating,
          comment: comment || "",
          scheduleTime: new Date(scheduleTime),
        };
        adminOrder.reviews.push(newReview);
      }
      await admin.save();
    }
    res.status(200).json({ message: "Feedback submitted successfully!" });
  } catch (error) {
    console.error("Error submitting feedback:", error);
    res
      .status(500)
      .json({ message: "Failed to submit feedback", error: error.message });
  }
};

export const cancelOrder = async (req, res) => {
  try {
    const { userId, orderId, providerEmail, scheduleTime } = req.body;
    // Step 1: Update the user's order status to "cancelled"
    const user = await UserModel.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const userOrder = user.orders.id(orderId);
    if (!userOrder) {
      return res
        .status(404)
        .json({ message: "Order not found in user's orders" });
    }
    userOrder.status = "cancelled";
    await user.save();

    // Step 2: Update the provider's order status to "cancelled"
    const provider = await ProviderModel.findOneAndUpdate(
      { email: providerEmail, "orders.scheduleTime": scheduleTime },
      { $set: { "orders.$.status": "cancelled" } },
      { new: true }
    );
    if (!provider) {
      return res
        .status(404)
        .json({ message: "Order not found in provider's orders" });
    }

    // Step 3: Update the admin's order status to "cancelled"
    const admin = await AdminModel.findOneAndUpdate(
      {
        "orders.providerEmail": providerEmail,
        "orders.scheduleTime": scheduleTime,
      },
      { $set: { "orders.$.status": "cancelled" } },
      { new: true }
    );
    if (!admin) {
      return res
        .status(404)
        .json({ message: "Order not found in admin's orders" });
    }
    const order = await OrderModel.findOneAndUpdate(
      {
        userId: userId,
        "orders.providerEmail": providerEmail,
        "orders.scheduleTime": scheduleTime,
      },
      { $set: { "orders.$.status": "cancelled" } },
      { new: true }
    );

    if (!order) {
      return res
        .status(404)
        .json({ message: "Order not found in orders collection" });
    }

    res.status(200).json({ message: "Order cancelled in all systems" });
  } catch (error) {
    console.error("Error canceling order:", error);
    res
      .status(500)
      .json({ message: "Failed to cancel order", error: error.message });
  }
};
