import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    employeeCode: String,
    name: String,
    email: String,
    password: String,
  },
  { timestamps: true }
);

export default mongoose.models.User ||
  mongoose.model("User", UserSchema);