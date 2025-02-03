import ProviderModel from "../models/providerModel.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export const providerRegistration = async (req, res) => {
  const {
    name,
    email,
    password,
    confirmPassword,
    phone,
    latitude,
    longitude,
    address,
    price,
    description,
    image,
    tc,
  } = req.body;

  try {
    const provider = await ProviderModel.findOne({ email: email });
    if (provider) {
      return res.status(406).send({
        status: "failed",
        message: "Provider Email already exists",
      });
    }

    if (
      name &&
      email &&
      password &&
      confirmPassword &&
      phone &&
      latitude &&
      longitude &&
      address &&
      price &&
      description &&
      image &&
      tc
    ) {
      if (password === confirmPassword) {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newProvider = new ProviderModel({
          name,
          email,
          password: hashedPassword,
          phone,
          location: {
            latitude,
            longitude,
          },
          address,
          price,
          description,
          image,
          tc,
        });

        await newProvider.save();
        const savedProvider = await ProviderModel.findOne({ email: email });

        // Generate JWT token
        const token = jwt.sign(
          {
            providerID: savedProvider._id,
          },
          process.env.JWT_SECRET_KEY,
          {
            expiresIn: "5d",
          }
        );

        return res.status(201).send({
          status: "success",
          message: "Provider Registration successful",
          token: token,
        });
      } else {
        return res.status(403).send({
          status: "failed",
          message: "Passwords do not match",
        });
      }
    } else {
      return res.status(402).send({
        status: "failed",
        message: "Please fill all required fields",
      });
    }
  } catch (error) {
    return res.status(405).send({
      status: "failed",
      message: "Provider Registration failed",
    });
  }
};

//Provider Login
export const providerLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if email and password are provided
    if (!email || !password) {
      return res.status(400).json({
        status: "failed",
        message: "Email and password are required",
      });
    }

    // Find provider by email
    const provider = await ProviderModel.findOne({ email: email });

    // If provider not found
    if (!provider) {
      return res.status(404).json({
        status: "failed",
        message: "Provider not found",
      });
    }

    // Check if password is valid
    const isValidPassword = await bcrypt.compare(password, provider.password);

    if (!isValidPassword) {
      return res.status(401).json({
        status: "failed",
        message: "Incorrect password",
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        providerID: provider._id,
        providerName: provider.name,
        providerEmail: provider.email,
      },
      process.env.JWT_SECRET_KEY,
      { expiresIn: "5d" }
    );

    // Send success response with token and provider details
    return res.status(200).json({
      status: "success",
      message: "Provider login successful",
      token: token,
      provider: {
        id: provider._id,
        name: provider.name,
        email: provider.email,
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

//Provider changePassword
export const changeProviderPassword = async (req, res) => {
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

      await ProviderModel.findByIdAndUpdate(req.provider._id, {
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

//info of looked provider
export const loggedProvider = async (req, res) => {
  res.status(200).send({ provider: req.provider });
};

//email send to provider to reset password
export const sendProviderPasswordRestEmail = async (req, res) => {
  const { email } = req.body;
  if (email) {
    const provider = await ProviderModel.findOne({ email: email });
    // console.log(provider);
    if (provider) {
      const secret = provider._id + process.env.JWT_SECRET_KEY;
      const token = jwt.sign(
        {
          userID: provider._id,
          //   email: user.email,
          //   secret: secret,
        },
        secret,
        {
          expiresIn: "15m",
        }
      );
      const link = `http://localhost:3000/api/provider/reset/${provider._id}/${token}`;
      // console.log(link);
      res.status(200).send({
        status: "success",
        message: "Reset password link sent to your email",
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

//provider password reset
export const providerPasswordReset = async (req, res) => {
  const { password, password_confirmation } = req.body;
  const { id, token } = req.params;
  const provider = await UserModel.findById(id);
  const new_secret = provider._id + process.env.JWT_SECRET_KEY;
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

        const newHashedPassword = await bcrypt.hash(password, salt);

        await ProviderModel.findByIdAndUpdate(provider._id, {
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

export const getProviderAddress = async (req, res) => {
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
