import mongoose from "mongoose";

const MomActionSchema = new mongoose.Schema(
  {
    mainPoint: String,
    subPoint: String,

    fpr: String,
    spr: String,
    external: String,

    fprEmail: String,
    fprPersonalEmail: String,

    sprEmail: String,
    sprPersonalEmail: String,

    planStartDate: String,
    actualStartDate: String,

    planEndDate: String,
    actualEndDate: String,

    status: {
      type: String,
      enum: [
        "Open",
        "In Process",
        "Pending",
        "Closed",
      ],
      default: "Open",
    },

    remark: String,

    uploadedBy: String,
    uploadedByEmail: String,

    uploadedDate: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.MomAction ||
  mongoose.model(
    "MomAction",
    MomActionSchema
  );