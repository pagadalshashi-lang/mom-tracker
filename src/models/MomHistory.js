import mongoose from "mongoose";

const MomHistorySchema =
  new mongoose.Schema(
    {
      momId: String,

      updatedBy: String,
      updatedByEmail: String,

      oldStatus: String,
      newStatus: String,

      oldRemark: String,
      newRemark: String,
    },
    {
      timestamps: true,
    }
  );

export default
  mongoose.models.MomHistory ||
  mongoose.model(
    "MomHistory",
    MomHistorySchema
  );