import mongoose from "mongoose";

const MomHistorySchema = new mongoose.Schema(
  {
    momId: String,

    updatedBy: String,
    updatedByEmail: String,

    oldAccount: String,
    newAccount: String,

    oldStatus: String,
    newStatus: String,

    oldRemark: String,
    newRemark: String,

    oldPlanStartDate: String,
    newPlanStartDate: String,

    oldPlanEndDate: String,
    newPlanEndDate: String,

    oldActualEndDate: Date,
    newActualEndDate: Date,
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.MomHistory ||
  mongoose.model("MomHistory", MomHistorySchema);