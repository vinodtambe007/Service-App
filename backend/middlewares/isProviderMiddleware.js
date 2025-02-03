import jwt from "jsonwebtoken";
import ProviderModel from "../models/providerModel.js";

let checkProviderAuth = async (req, res, next) => {
  let token;
  const { authorization } = req.headers;

  if (authorization && authorization.startsWith("Bearer")) {
    try {
      token = authorization.split(" ")[1];

      //verify token
      const { providerID } = jwt.verify(token, process.env.JWT_SECRET_KEY);

      //get provider from token
      req.provider = await ProviderModel.findById(providerID).select(
        "-password"
      );
      next();
    } catch (error) {
      res.status(401).send({
        success: false,
        message: "Unauthorized provider",
      });
    }
  }
  if (!token) {
    res.status(401).send({
      success: false,
      message: "Unauthorized provider, no token found",
    });
  }
};

export default checkProviderAuth;
