import PaymentModel from "../models/paymentModel.js";
import ProviderModel from "../models/providerModel.js";
import AdminModel from "../models/adminModel.js";
import UserModel from "../models/userModel.js";
import OrderModel from "../models/orderModel.js";
import axios from "axios";
// Add to Cart Controller
export const confirmPayment = async (req, res) => {
  const {
    providerName,
    providerEmail,
    status,
    userId,
    scheduleTime,
    price,
    orderId,
  } = req.body;
  // console.log(orderId);
  try {
    // Validate required fields
    if (
      !providerName ||
      !providerEmail ||
      !userId ||
      !scheduleTime ||
      !price ||
      !orderId
    ) {
      return res.status(400).json({
        message: "All fields are required.",
      });
    }

    // Create new payment record
    const newPayment = new PaymentModel({
      providerName,
      providerEmail,
      status,
      userId,
      scheduleTime,
      price,
      paymentStatus: "Unpaid", // Default payment status
      orderId: orderId,
    });

    // Save payment record to database
    const savedPayment = await newPayment.save();

    // Respond with success message and saved payment details
    res.status(201).json({
      message: "Payment record created successfully.",
      payment: savedPayment,
    });
  } catch (error) {
    console.error("Error creating payment record:", error);
    res.status(500).json({
      message: "Internal server error. Could not create payment record.",
      error: error.message,
    });
  }
};

export const fetchPaymentDetails = async (req, res) => {
  try {
    const { userId, scheduleTime, price } = req.params;
    // console.log(userId, scheduleTime, price);

    // Query the database to find the matching payment record
    const payment = await PaymentModel.findOne({
      userId,
      scheduleTime: new Date(scheduleTime), // Convert scheduleTime to Date for matching
      price: Number(price), // Ensure price is a number for comparison
    });

    if (!payment) {
      return res.status(404).json({ message: "Payment record not found." });
    }

    // Return the payment details
    res.status(200).json(payment);
  } catch (error) {
    console.error("Error fetching payment details:", error);
    res.status(500).json({
      message: "Internal server error. Could not fetch payment details.",
      error: error.message,
    });
  }
};

export const generateAccessToken = async () => {
  try {
    // Request to get the access token from PayPal
    const response = await axios({
      url: `${process.env.PAYPAL_BASE_URL}/v1/oauth2/token`,
      method: "post",
      data: "grant_type=client_credentials",
      auth: {
        username: process.env.PAYPAL_CLIENT_ID,
        password: process.env.PAYPAL_SECRET,
      },
    });

    // Log the response data (access token)
    // console.log(response.data);
    // console.log("Access Token Response:", response.data);
    // Send back the access token in the response
    return response.data.access_token;
  } catch (error) {
    console.error("Error generating PayPal access token:", error);
    return res.status(500).json({
      message: "Failed to generate access token from PayPal.",
      error: error.message,
    });
  }
};

export const createOrder = async (req, res) => {
  const { orderId, price } = req.params;
  const { userId, providerEmail, scheduleTime } = req.body;
  try {
    // Get the access token from PayPal
    const accessToken = await generateAccessToken();

    // Make the request to PayPal to create an order
    const response = await axios({
      url: `${process.env.PAYPAL_BASE_URL}/v2/checkout/orders`,
      method: "post",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      data: {
        intent: "CAPTURE",
        purchase_units: [
          {
            reference_id: orderId,
            userId: userId,
            providerEmail: providerEmail,
            scheduleTime: scheduleTime,
            items: [
              {
                name: "Service App",
                description: "Online payment to service app",
                quantity: 1,
                unit_amount: {
                  currency_code: "USD",
                  value: price, // Use the price from the request params
                },
              },
            ],
            amount: {
              currency_code: "USD",
              value: price, // Use the price from the request params
              breakdown: {
                item_total: {
                  currency_code: "USD",
                  value: price, // Use the price from the request params
                },
              },
            },
          },
        ],
        application_context: {
          return_url: `${process.env.BASE_URL}/order/completeOrder?orderId=${orderId}&userId=${userId}&providerEmail=${providerEmail}&scheduleTime=${scheduleTime}`,
          cancel_url: `${process.env.BASE_URL}/order/cancelOrder`,
          shipping_preference: "NO_SHIPPING",
          user_action: "PAY_NOW",
          brand_name: "Service-App",
        },
      },
    });

    // Extract the approval URL from the response
    const approvalUrl = response.data.links.find(
      (link) => link.rel === "approve"
    ).href;

    // console.log("Approval URL:", approvalUrl);

    // Send the approval URL back to the client
    return res.status(200).json({ approvalUrl });
  } catch (error) {
    console.error(
      "Error creating PayPal order:",
      error.response?.data || error.message
    );
    return res.status(500).json({
      message: "Failed to create PayPal order",
      error: error.message,
    });
  }
};

export const capturePayment = async (token) => {
  // console.log("capture orderId", token);
  try {
    // Get the access token from PayPal
    const accessToken = await generateAccessToken();

    // Make the request to PayPal to capture the payment
    const response = await axios({
      url: `${process.env.PAYPAL_BASE_URL}/v2/checkout/orders/${token}/capture`,
      method: "post",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + accessToken,
      },
    });

    // Return the captured payment details
    return response.data;
  } catch (error) {
    console.error(
      "Error capturing PayPal payment:",
      error.response?.data || error.message
    );
    return res.status(500).json({
      message: "Failed to capture PayPal payment",
      error: error.message,
    });
  }
};

export const cancelOrder = async (req, res) => {
  res.redirect("http://localhost:3000/user/order/getOrder");
};

export const completeOrder = async (req, res) => {
  const { token, orderId, userId, providerEmail, scheduleTime } = req.query; // The token is the PayPal order ID and orderId is your internal order ID

  if (!token || !orderId) {
    return res.status(400).send("Invalid request: Missing token or orderId");
  }
  try {
    // Capture the payment using the token (order ID)
    const captureResponse = await capturePayment(token);
    // Extract details from the capture response
    const { id: transactionId, status } = captureResponse;
    if (status === "COMPLETED") {
      console.log("Payment successful. Transaction ID:", transactionId);
      console.log("Payment status updated for order ID:", orderId);

      // Update the payment status in the database
      const updatedPayment = await PaymentModel.findOneAndUpdate(
        { orderId: orderId }, // Match the order by its ID
        { paymentStatus: "Paid", transactionId: transactionId }, // Update payment status to 'Paid'
        { new: true } // Return the updated document
      );
      // Find the provider by their email
      const provider = await ProviderModel.findOneAndUpdate(
        { "orders.cartId": orderId },
        {
          $set: {
            "orders.$.paymentStatus": "Paid",
            "orders.$.transactionId": transactionId,
          },
        },
        { new: true } // Return the updated document
      );
      if (!provider) {
        console.error("Provider not found for email:", providerEmail);
        return res.status(404).send("Provider not found.");
      }
      // console.log("Provider found:", provider);
      if (!updatedPayment) {
        console.error("Payment record not found for order ID:", orderId);
        return res.status(404).send("Order not found.");
      }

      const admin = await AdminModel.findOneAndUpdate(
        {
          "orders.cartId": orderId,
        },
        {
          $set: {
            "orders.$.paymentStatus": "Paid",
            "orders.$.transactionId": transactionId,
          },
        },
        { new: true }
      );
      if (!admin) {
        return res
          .status(404)
          .json({ message: "Order not found in admin database" });
      }

      const user = await UserModel.findOneAndUpdate(
        {
          "orders.cartId": orderId,
        },
        {
          $set: {
            "orders.$.paymentStatus": "Paid",
            "orders.$.transactionId": transactionId,
          },
        },
        { new: true }
      );
      if (!user) {
        return res
          .status(404)
          .json({ message: "Order not found in user's orders" });
      }

      const order = await OrderModel.findOneAndUpdate(
        {
          "orders.cartId": orderId,
        },
        {
          $set: {
            paymentStatus: "Paid",
            transactionId: transactionId,
          },
        },
        { new: true }
      );
      if (!order) {
        return res.status(404).json({ message: "Order not found in orders" });
      }

      // Redirect to the frontend success page with the transaction ID
      return res.redirect(
        `http://localhost:3000/order/paymentSuccess?transactionId=${transactionId}&orderId=${orderId}`
      );
    } else {
      console.error("Payment not completed. Status:", status);
      return res.status(400).send("Payment was not successful.");
    }
  } catch (error) {
    console.error(
      "Error capturing PayPal payment:",
      error.response?.data || error.message
    );
    return res.status(500).send("Error capturing PayPal payment.");
  }
};
