import UserModel from "../models/userModel.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import transporter from "../config/emailConfig.js";
import ProviderModel from "../models/providerModel.js";
import OrderModel from "../models/orderModel.js";
import CartModel from "../models/cartModel.js";
import axios from "axios";

//newUser Registration
export const userRegistration = async (req, res) => {
  const {
    name,
    email,
    password,
    confirmPassword,
    phone,
    latitude,
    longitude,
    address,
    tc,
  } = req.body;

  const user = await UserModel.findOne({ email: email });
  if (user) {
    res.status(406).send({
      status: "failed",
      message: "User Email already exists",
    });
  } else {
    if (
      name &&
      email &&
      password &&
      confirmPassword &&
      phone &&
      latitude &&
      longitude &&
      address &&
      tc
    ) {
      if (password === confirmPassword) {
        try {
          const salt = await bcrypt.genSalt(10);
          const hashedPassword = await bcrypt.hash(password, salt);

          const newUser = new UserModel({
            name,
            email,
            password: hashedPassword,
            phone,
            location: {
              latitude: latitude,
              longitude: longitude,
              address: address,
            },
            tc,
          });
          await newUser.save();
          const savedUser = await UserModel.findOne({ email: email });

          //generate JWT token
          const token = jwt.sign(
            {
              userID: savedUser._id,
            },
            process.env.JWT_SECRET_KEY,
            {
              expiresIn: "5d",
            }
          );
          res.status(201).send({
            status: "success",
            message: "User Registration successful",
            token: token,
          });
        } catch (error) {
          res.status(405).send({
            status: "failed",
            message: "User Registration failed",
          });
        }
      } else {
        res.status(403).send({
          status: "failed",
          message: "Passwords do not match",
        });
      }
    } else {
      res.status(402).send({
        status: "failed",
        message: "Please fill all required fields",
      });
    }
  }
};

//userLogin
export const userLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        status: "failed",
        message: "Email and password are required",
      });
    }

    const user = await UserModel.findOne({ email: email });

    if (!user) {
      return res.status(404).json({
        status: "failed",
        message: "User not found",
      });
    }

    const isValidPassword = await bcrypt.compare(password, user.password);

    if (!isValidPassword) {
      return res.status(401).json({
        status: "failed",
        message: "Incorrect password",
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        userID: user._id,
        userName: user.name,
        userEmail: user.email,
      },

      process.env.JWT_SECRET_KEY,
      { expiresIn: "5d" }
    );

    // Send success response with token
    return res.status(200).json({
      status: "success",
      message: "User login successful",
      token: token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("Login error:", error);

    return res.status(500).json({
      status: "failed",
      message: "Internal server error",
    });
  }
};

//changePassword
export const changeUserPassword = async (req, res) => {
  const { password, confirmPassword } = req.body;

  if (password && confirmPassword) {
    if (password !== confirmPassword) {
      res.status(401).send({
        status: "failed",
        message: "Password & Confirm Password doesn't match",
      });
    } else {
      const salt = await bcrypt.genSalt(10);

      const newHashedPassword = await bcrypt.hash(password, salt);

      await UserModel.findByIdAndUpdate(req.user._id, {
        $set: { password: newHashedPassword },
      });
      res.status(200).send({
        status: "success",
        message: "Password changed successfully",
      });
    }
  } else {
    res.status(400).send({
      status: "failed",
      message: "Please provide both new password and confirmation",
    });
  }
};

//show user profile
export const userProfile = async (req, res) => {
  try {
    const user = await UserModel.findById(req.params.id);
    if (!user) {
      return res.status(404).json({
        status: "failed",
        message: "Profile not found",
      });
    }
    res.status(200).json(user);
  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: "Server error",
      error: error.message,
    });
  }
};

//info of looked user
export const loggedUser = async (req, res) => {
  res.status(200).send({ user: req.user });
};

export const sendUserPasswordRestEmail = async (req, res) => {
  const { email } = req.body;
  if (email) {
    const user = await UserModel.findOne({ email: email });
    // console.log(user);
    if (user) {
      const secret = user._id + process.env.JWT_SECRET_KEY;
      const token = jwt.sign(
        {
          userID: user._id,
          //   email: user.email,
          //   secret: secret,
        },
        secret,
        {
          expiresIn: "15m",
        }
      );
      const link = `http://localhost:3000/api/user/reset/${user._id}/${token}`;
      console.log(link);
      // send email with link to reset password
      let info = await transporter.sendMail({
        from: process.env.EMAIL_FROM,
        to: user.email,
        subject: "Reset Password",
        html: `<a href=${link}>Click here to reset your password</a>`,
      });
      res.status(200).send({
        status: "success",
        message: "Reset password link sent to your email",
        info: info,
      });
    } else {
      res.status(407).send({
        status: "failed",
        message: "emailID not found",
      });
    }
  } else {
    res.status(200).send({
      status: "failed",
      message: "Please provide emailID",
    });
  }
};

export const userPasswordReset = async (req, res) => {
  const { password, confirmPassword } = req.body;
  const { id, token } = req.params;
  const user = await UserModel.findById(id);
  const new_secret = user._id + process.env.JWT_SECRET_KEY;
  try {
    jwt.verify(token, new_secret);
    if (password && confirmPassword) {
      if (password !== confirmPassword) {
        res.status(401).send({
          status: "failed",
          message: "Password & Confirm Password doesn't match",
        });
      } else {
        const salt = await bcrypt.genSalt(10);

        const newHashedPassword = await bcrypt.hash(password, salt);

        await UserModel.findByIdAndUpdate(user._id, {
          $set: { password: newHashedPassword },
        });
        res.status(200).send({
          status: "success",
          message: "Password reset successfully",
        });
      }
    } else {
      res.status(400).send({
        status: "failed",
        message: "Please provide both new password and confirmation",
      });
    }
  } catch {
    console.log(error);
    res.status(408).send({
      status: failed,
      message: "Invaild token",
    });
  }
};

//get all providers
export const getAllProviders = async (req, res) => {
  try {
    const providers = await ProviderModel.find({});
    res.status(200).json(providers);
  } catch (error) {
    console.error("Error fetching services:", error);
    res.status(500).json({
      status: "failed",
      message: "Internal server error",
    });
  }
};

export const getUserAddress = async (req, res) => {
  const { latitude, longitude } = req.params; // Get latitude and longitude from request parameters
  const apiKey = process.env.GOOGLE_MAPS_API_KEY; // Store your API key in an environment variable

  try {
    const response = await axios.get(
      `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${apiKey}`
    );

    if (response.data.status === "OK") {
      const addressComponents = response.data.results[0].address_components;
      const address = {
        street: addressComponents[0]?.long_name || "",
        city:
          addressComponents.find((component) =>
            component.types.includes("locality")
          )?.long_name || "",
        pincode:
          addressComponents.find((component) =>
            component.types.includes("postal_code")
          )?.long_name || "",
      };
      return res.json({ success: true, address });
    } else {
      return res
        .status(400)
        .json({ success: false, message: "Unable to fetch address" });
    }
  } catch (error) {
    console.error("Error fetching address:", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};

export const userOrders = async (req, res) => {
  const userId = req.params.id;

  try {
    // Fetch all orders related to the user from the Order model
    const orders = await OrderModel.find({ userId });

    if (!orders || orders.length === 0) {
      return res
        .status(404)
        .json({ message: "No orders found for this user." });
    }

    // Respond with the orders data
    res.status(200).json({
      userId,
      orders,
    });
  } catch (error) {
    console.error("Error fetching user orders:", error);
    res.status(500).json({ message: "Failed to fetch user orders." });
  }
};

export const providerDetails = async (req, res) => {
  const providerId = req.params.id; // Get provider ID from the URL parameters
  try {
    // Query the database for provider details
    const provider = await ProviderModel.findById(providerId);
    if (!provider) {
      return res
        .status(404)
        .json({ status: "failed", message: "No provider found with this ID." });
    }
    // Respond with the provider details
    res.status(200).json(provider);
  } catch (error) {
    console.error("Error fetching provider details:", error);
    res.status(500).json({
      status: "error",
      message: "Server error",
      error: error.message,
    });
  }
};

export const providerProfile = async (req, res) => {
  try {
    const provider = await ProviderModel.findById(req.params.id);
    if (!provider) {
      return res.status(404).json({
        status: "failed",
        message: "Profile not found",
      });
    }
    res.status(200).json(provider);
  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: "Server error",
      error: error.message,
    });
  }
};

export const placeOrder = async (req, res) => {
  try {
    const { userId, providerId, scheduledTime, totalPrice, orderDetails } =
      req.body;

    // Validate if the user and provider exist in the database
    const user = await UserModel.findById(userId);
    const provider = await ProviderModel.findById(providerId); // Check if providerId is passed

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    if (!provider) {
      return res.status(404).json({ message: "Provider not found" });
    }

    // Create a new order
    const newOrder = new OrderModel({
      userId,
      providerId, // Include providerId here
      scheduledTime,
      totalPrice,
      orderStatus: "placed",
      items: orderDetails,
    });

    // Save the new order and retrieve the generated orderId
    const savedOrder = await newOrder.save();

    // Add the new order to the user's list of orders
    user.orders.push({
      orderId: savedOrder._id,
      timeslot: scheduledTime,
      totalPrice,
    });
    await user.save();

    // Add the new order to the provider's list of orders
    provider.orders.push({
      orderId: savedOrder._id,
      timeslot: scheduledTime,
      totalPrice,
    });
    await provider.save();

    // Send a success response with the order details
    res.status(201).json({
      message: "Order placed successfully",
      order: {
        orderId: savedOrder._id,
        ...savedOrder._doc,
      },
    });
  } catch (error) {
    console.error("Error placing order:", error);
    res.status(500).json({ message: "Failed to place order" });
  }
};

export const addToCart = async (req, res) => {
  const userId = req.params.id; // Get the userId from the URL
  const { providerId } = req.body; // Get the providerId from the request body

  try {
    // Find the user's cart or create a new one if it doesn't exist
    let cart = await CartModel.findOne({ userId });

    if (!cart) {
      // If no cart exists, create a new cart for the user
      cart = new CartModel({
        userId,
        items: [{ providerId }],
      });
    } else {
      // If cart exists, check if provider is already in the cart
      const providerExists = cart.items.find(
        (item) => item.providerId.toString() === providerId
      );

      if (providerExists) {
        return res
          .status(400)
          .json({ message: "Provider is already in the cart" });
      }

      // Add provider to cart
      cart.items.push({ providerId });
    }

    // Save the cart
    await cart.save();

    res.status(201).json({ message: "Provider added to cart", cart });
  } catch (error) {
    console.error("Error adding provider to cart:", error);
    res.status(500).json({ message: "Failed to add provider to cart" });
  }
};
