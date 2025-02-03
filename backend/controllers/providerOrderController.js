import OrderModel from "../models/orderModel.js";
import ProviderModel from "../models/providerModel.js";
import UserModel from "../models/userModel.js";
import AdminModel from "../models/adminModel.js";

export const getOrder = async (req, res) => {
  try {
    const { providerId } = req.body; // Get providerId from the request body
    // Find the provider by providerId and populate the user details in orders
    const provider = await ProviderModel.findById(providerId).populate({
      path: "orders.userId", // Populate the userId reference field
      select: "name email", // Select only specific fields from the User model
    });

    // Check if provider exists
    if (!provider) {
      return res.status(404).json({ message: "Provider not found" });
    }

    // Respond with the provider's orders
    res.status(200).json({ orders: provider.orders });
  } catch (error) {
    console.error("Error fetching provider orders:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const updateStatus = async (req, res) => {
  try {
    const { orderId, userId, providerEmail, scheduleTime, newStatus, cartId } =
      req.body;

    // Step 1: Find and update the provider's order by orderId
    const provider = await ProviderModel.findOneAndUpdate(
      {
        "orders.cartId": cartId,
      },
      { $set: { "orders.$.status": newStatus } }, // Update the order status in provider
      { new: true }
    );
    // console.log(provider);
    if (!provider) {
      return res.status(404).json({ message: "Order not found in provider" });
    }

    // Step 2: Find and update the user's order by userId and orderId
    const user = await UserModel.findOneAndUpdate(
      {
        _id: userId,
        "orders.cartId": cartId,
      }, // Match the userId and orderId in the user's orders array
      { $set: { "orders.$.status": newStatus } }, // Update the order status in user's orders array
      { new: true }
    );
    if (!user) {
      return res
        .status(404)
        .json({ message: "Order not found in user's orders" });
    }
    // res.status(200).json({ message: "Order status updated successfully" });

    const order = await OrderModel.findOneAndUpdate(
      {
        "orders.cartId": cartId,
      },
      { $set: { "orders.$.status": newStatus } }, // Update the order status in user's orders array
      { new: true }
    );

    if (!order) {
      return res
        .status(404)
        .json({ message: "Order not found in order dataBase" });
    }

    const admin = await AdminModel.findOneAndUpdate(
      {
        "orders.cartId": cartId,
      },
      { $set: { "orders.$.status": newStatus } }, // Update the order status
      { new: true }
    );

    if (!admin) {
      // Early return if no admin order is found
      return res
        .status(404)
        .json({ message: "Order not found in admin database" });
    }

    // Step 2: If admin order is found and updated successfully, send the success response
    return res
      .status(200)
      .json({ message: "Order status updated successfully" });
  } catch (error) {
    console.error("Error updating order status:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const cancelOrder = async (req, res) => {
  try {
    const { orderId, userId, scheduleTime, providerEmail, cartId } = req.body;

    const provider = await ProviderModel.findOneAndUpdate(
      { "orders._id": orderId, "orders.cartId": cartId },
      { $set: { "orders.$.status": "cancelled" } }, // Update the order status in provider
      { new: true }
    );
    if (!provider) {
      return res.status(404).json({ message: "Order not found in provider" });
    }
    // Step 2: Find and update the user's order by userId and orderId
    const user = await UserModel.findOneAndUpdate(
      { "orders.cartId": cartId }, // Match the userId and orderId in the user's orders array
      { $set: { "orders.$.status": "cancelled" } }, // Update the order status in user's orders array
      { new: true }
    );
    if (!user) {
      return res
        .status(404)
        .json({ message: "Order not found in user's orders" });
    }
    // res.status(200).json({ message: "Order cancelled successfully" });
    const order = await OrderModel.findOneAndUpdate(
      {
        "orders.cartId": cartId,
      }, // Match the userId and orderId in the user's orders array
      { $set: { "orders.$.status": "cancelled" } }, // Update the order status in user's orders array
      { new: true }
    );
    if (!order) {
      return res
        .status(404)
        .json({ message: "Order not found in order dataBase" });
    }
    // res.status(200).json({ message: "Order cancelled successfully" });
    const admin = await AdminModel.findOneAndUpdate(
      {
        "orders.cartId": cartId,
      }, // Match providerEmail and scheduleTime in the admin's orders
      { $set: { "orders.$.status": "cancelled" } }, // Update the order status
      { new: true }
    );
    if (!admin) {
      // Early return if no admin order is found
      return res
        .status(404)
        .json({ message: "Order not found in admin database" });
    }
    // Step 2: If admin order is found and updated successfully, send the success response
    return res.status(200).json({ message: "Order cancelled successfully" });
  } catch (error) {
    console.error("Error cancelling order:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
