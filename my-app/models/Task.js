import mongoose from "mongoose";

const TaskSchema = new mongoose.Schema(

  {

    account: String,

    mainPoint: String,

    subPoint: String,

    fpr: String,

    spr: String,

    plannedStartDate: String,

    plannedEndDate: String,

    actualStartDate: String,

    actualEndDate: String,

    status: String,

    remark: String,

    createdBy: String,

  },

  {

    timestamps: true,

  }

);

export default mongoose.models.Task ||

  mongoose.model("Task", TaskSchema);