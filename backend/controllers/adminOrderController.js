import OrderModel from "../models/orderModel.js";
import ProviderModel from "../models/providerModel.js";
import UserModel from "../models/userModel.js";
import AdminModel from "../models/adminModel.js";

export const getOrder = async (req, res) => {
  try {
    const { adminId } = req.body;

    const admin = await AdminModel.findById(adminId).populate({
      path: "orders.userId",
      select: "name phone",
    });
    // Check if provider exists
    if (!admin) {
      return res.status(404).json({ message: "admin not found" });
    }
    // Respond with the provider's orders
    res.status(200).json({ orders: admin.orders });
  } catch (error) {
    console.error("Error fetching admin orders:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const updateStatus = async (req, res) => {
  try {
    const { orderId, newStatus, userId, scheduleTime, providerEmail } =
      req.body;

    // console.log(orderId, newStatus, userId, scheduleTime, providerEmail);

    // Step 1: Find and update the provider's order by orderId
    const provider = await ProviderModel.findOneAndUpdate(
      {
        email: providerEmail,
        // "orders.userId": userId,
        "orders.scheduleTime": scheduleTime,
      },
      { $set: { "orders.$.status": newStatus } },
      { new: true }
    );
    if (!provider) {
      return res.status(404).json({ message: "Order not found in provider" });
    }

    // Step 2: Find and update the user's order by userId and orderId
    const user = await UserModel.findOneAndUpdate(
      {
        _id: userId,
        // "orders.userId": userId,
        "orders.scheduleTime": scheduleTime,
        "orders.providerEmail": providerEmail,
      },
      { $set: { "orders.$.status": newStatus } },
      { new: true }
    );
    if (!user) {
      return res
        .status(404)
        .json({ message: "Order not found in user's orders" });
    }

    // Step 3: Update the order in the OrderModel
    const order = await OrderModel.findOneAndUpdate(
      {
        userId: userId,
        "orders.scheduleTime": scheduleTime,
        "orders.providerEmail": providerEmail,
      },
      { $set: { "orders.$.status": newStatus } },
      { new: true }
    );
    if (!order) {
      return res
        .status(404)
        .json({ message: "Order not found in order database" });
    }

    // Step 4: Update the order in the AdminModel
    const admin = await AdminModel.findOneAndUpdate(
      {
        "orders.scheduleTime": scheduleTime,
        // "orders.providerEmail": providerEmail,
        // "orders.userId": userId,
      },
      { $set: { "orders.$.status": newStatus } },
      { new: true }
    );
    if (!admin) {
      return res
        .status(404)
        .json({ message: "Order not found in admin database" });
    }

    // If all updates are successful, send the success response once
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
    const { orderId, userId, scheduleTime, providerEmail } = req.body;
    // console.log("orderId", orderId);
    // console.log("userId", userId);
    // console.log("scheduleTime", scheduleTime);
    // console.log("providerEmail", providerEmail);
    // Step 1: Find and update the provider's order by orderId
    const provider = await ProviderModel.findOneAndUpdate(
      { "orders._id": orderId },
      { $set: { "orders.$.status": "cancelled" } }, // Update the order status in provider
      { new: true }
    );
    if (!provider) {
      return res.status(404).json({ message: "Order not found in provider" });
    }
    // Step 2: Find and update the user's order by userId and orderId
    const user = await UserModel.findOneAndUpdate(
      { _id: userId, "orders.userId": userId }, // Match the userId and orderId in the user's orders array
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
        userId: userId,
        "orders.providerEmail": providerEmail,
        "orders.scheduleTime": scheduleTime,
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
        "orders.providerEmail": providerEmail,
        "orders.scheduleTime": scheduleTime,
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
  // return res.status(200).json({ message: "Order cancelled in all systems" });
  // res.status(200).json({ message: "Order cancelled successfully" });
};

// export const getPayment = async (req, res) => {
//   console.log("payment plzz");
//   try {
//     const { newStatus, userId, scheduleTime, providerEmail } = req.body;
//     console.log("newStatus", newStatus);
//     console.log("userId", userId);
//     console.log("scheduleTime", scheduleTime);
//     console.log("providerEmail", providerEmail);
//   } catch {}
// };
