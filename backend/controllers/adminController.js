import AdminModel from "../models/adminModel.js";
import ProviderModel from "../models/providerModel.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

//newAdmin Registration
export const adminRegistration = async (req, res) => {
  const { name, email, password, confirmPassword, phone, address, tc } =
    req.body;

  try {
    const adminExists = await AdminModel.findOne({ email: email });
    if (adminExists) {
      return res.status(406).json({
        status: "failed",
        message: "Admin email already exists",
      });
    }

    if (
      name &&
      email &&
      password &&
      confirmPassword &&
      phone &&
      address &&
      tc
    ) {
      if (password === confirmPassword) {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newAdmin = new AdminModel({
          name,
          email,
          password: hashedPassword,
          phone,
          address,
          tc,
        });

        await newAdmin.save();
        const savedAdmin = await AdminModel.findOne({ email: email });

        // Generate JWT token
        const token = jwt.sign(
          { adminID: savedAdmin._id },
          process.env.JWT_SECRET_KEY,
          { expiresIn: "5d" }
        );

        return res.status(201).json({
          status: "success",
          message: "Admin registration successful",
          token: token,
        });
      } else {
        return res.status(403).json({
          status: "failed",
          message: "Passwords do not match",
        });
      }
    } else {
      return res.status(402).json({
        status: "failed",
        message: "Please fill all required fields",
      });
    }
  } catch (error) {
    return res.status(500).json({
      status: "failed",
      message: "Admin registration failed",
    });
  }
};

//Admin Login
export const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if email and password are provided
    if (!email || !password) {
      return res.status(400).json({
        status: "failed",
        message: "Email and password are required",
      });
    }

    // Find admin by email
    const admin = await AdminModel.findOne({ email: email });

    // If admin not found
    if (!admin) {
      return res.status(404).json({
        status: "failed",
        message: "Admin not found",
      });
    }

    // Check if password is valid
    const isValidPassword = await bcrypt.compare(password, admin.password);

    if (!isValidPassword) {
      return res.status(401).json({
        status: "failed",
        message: "Incorrect password",
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        adminID: admin._id,
        adminName: admin.name,
        adminEmail: admin.email,
      },
      process.env.JWT_SECRET_KEY,
      { expiresIn: "5d" }
    );

    // Send success response with token and admin details
    return res.status(200).json({
      status: "success",
      message: "Admin login successful",
      token: token,
      admin: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
      },
    });
  } catch (error) {
    console.error("Login error:", error);

    // Handle internal server errors
    return res.status(500).json({
      status: "failed",
      message: "Internal server error",
    });
  }
};

//Admin changePassword
export const changeAdminPassword = async (req, res) => {
  const { password, password_confirmation } = req.body;

  if (password && password_confirmation) {
    if (password !== password_confirmation) {
      res.status(401).send({
        status: "failed",
        message: "Password & Confirm Password doesn't match",
      });
    } else {
      const salt = await bcrypt.genSalt(10);

      const newHashedPassword = await bcrypt.hash(password, salt);

      await AdminModel.findByIdAndUpdate(req.admin._id, {
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

//info of looked admin
export const loggedAdmin = async (req, res) => {
  res.status(200).send({ admin: req.admin });
};

//email send to admin to reset password
export const sendAdminPasswordRestEmail = async (req, res) => {
  const { email } = req.body;
  if (email) {
    const admin = await AdminModel.findOne({ email: email });
    // console.log(admin);
    if (admin) {
      const secret = admin._id + process.env.JWT_SECRET_KEY;
      const token = jwt.sign(
        {
          adminID: admin._id,
          //   email: user.email,
          //   secret: secret,
        },
        secret,
        {
          expiresIn: "15m",
        }
      );
      const link = `http://localhost:3000/api/admin/reset/${admin._id}/${token}`;
      // console.log(link);
      res.status(200).send({
        status: "success",
        message: "Reset password link sent to your email",
      });
    } else {
      res.status(407).send({
        status: "failed",
        message: "Admin emailID not found",
      });
    }
  } else {
    res.status(200).send({
      status: "failed",
      message: "Please provide emailID",
    });
  }
};

//admin password reset
export const adminPasswordReset = async (req, res) => {
  const { password, password_confirmation } = req.body;
  const { id, token } = req.params;
  const admin = await AdminModel.findById(id);
  const new_secret = admin._id + process.env.JWT_SECRET_KEY;
  try {
    jwt.verify(token, new_secret);
    if (password && password_confirmation) {
      if (password !== password_confirmation) {
        res.status(401).send({
          status: "failed",
          message: "Password & Confirm Password doesn't match",
        });
      } else {
        const salt = await bcrypt.genSalt(10);
        //   console.log("salt - ", salt);
        const newHashedPassword = await bcrypt.hash(password, salt);
        //   console.log("password - ", password);
        //   console.log("salt - ", salt);
        //   console.log("newHashedPassword", newHashedPassword);
        await AdminModel.findByIdAndUpdate(admin._id, {
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
    console.error("Error fetching orders:", error);
    res.status(500).json({
      status: "failed",
      message: "Internal server error",
    });
  }
};

export const adminProfile = async (req, res) => {
  try {
    const admin = await AdminModel.findById(req.params.id);
    if (!admin) {
      return res.status(404).json({
        status: "failed",
        message: "Profile not found",
      });
    }
    res.status(200).json(admin);
  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: "Server error",
      error: error.message,
    });
  }
};
