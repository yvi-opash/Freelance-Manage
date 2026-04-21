import User from "../model/user.model";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";



export const registerUser = async (data: any) => {
  const exist = await User.findOne({email: data.email});
  if (exist) {
    throw new Error("User already exists");
  }

  const hased = await bcrypt.hash(data.password, 10);

  const user = await User.create({
    name: data.name,
    email: data.email,
    password: hased,
  })

  return user;
} 

export const loginUser = async (email: string, password: string) => {
  const user = await User.findOne({email});
  if(!user) throw new Error("User not found");

  const match = await bcrypt.compare(password, user.password);
  if(!match) throw new Error("Invalid password");

  const token = jwt.sign({id: user._id}, process.env.JWT_SECRET || "", {expiresIn: "1d"});
  return {  token, user};
};

export const generateResetToken = async (email: string) => {
  const user = await User.findOne({email});
  if(!user) throw new Error("User not found");

  const token = crypto.randomBytes(20).toString("hex");

  user.resetToken = token;
  await user.save();

  console.log("reset token:", token);
  
  return token;
};


export const resetPassword = async (token:string, newPassword: string) => {
  const user = await User.findOne({resetToken: token});
  if(!user) throw new Error("Invalid token");

  user.password = await bcrypt.hash(newPassword, 10);
  user.resetToken = undefined;
  await user.save();
}