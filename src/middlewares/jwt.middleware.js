import { JWT_SECRET } from "../config/constants.js";
import jwt from "jsonwebtoken";
import userModel from "../modules/user/user.model.js";

const jwtMiddleware = async (req, res, next) => {
    const token = req.headers.authorization?.split(" ")[1];
  
    if (!token) {
      return res.error("Unauthorized - Token missing", 401);
    }
  
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      const user = await userModel.findById(decoded.id).populate("roles");
      if(!user){
        return res.error("Unauthorized - User not found", 401);
      }
      req.user = user;
      next();
    } catch (err) {
      console.error("Token verification failed:", err);
      return res.error("Unauthorized - Invalid token", 401);
    }
};

export default jwtMiddleware;