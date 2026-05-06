import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(

  {

    name: String,

    fullName: String,

    email: String,

    password: String,

    role: {

      type: String,

      default: "Employee",

    },

  },

  {

    timestamps: true,

  }

);

export default mongoose.models.User ||
  mongoose.model("User", UserSchema);