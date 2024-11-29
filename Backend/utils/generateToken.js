import jwt from "jsonwebtoken";
import dotenv from "dotenv";

const generateToken = (user) => {
  return jwt.sign({ userId: user._id }, process.env.SECRET_KEY);
};
export default generateToken;