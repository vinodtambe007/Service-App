import jwt from "jsonwebtoken";
import AdminModel from "../models/adminModel.js";

let checkAdminAuth = async (req, res, next) => {
  let token;
  const { authorization } = req.headers;

  if (authorization && authorization.startsWith("Bearer")) {
    try {
      token = authorization.split(" ")[1];

      //verify token
      const { adminID } = jwt.verify(token, process.env.JWT_SECRET_KEY);

      //get admin from token
      req.admin = await AdminModel.findById(adminID).select("-password");
      next();
    } catch (error) {
      res.status(401).send({
        success: false,
        message: "Unauthorized admin",
      });
    }
  }
  if (!token) {
    res.status(401).send({
      success: false,
      message: "Unauthorized admin, no token found",
    });
  }
};

export default checkAdminAuth;
