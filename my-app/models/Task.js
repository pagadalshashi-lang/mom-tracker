import mongoose from "mongoose";

const TaskSchema = new mongoose.Schema({

  pointer: String,

  subPointer: String,

  assignedTo: String,

  accountName: String,

  status: String,

  plannedStartDate: String,

  plannedEndDate: String,

  actualStartDate: String,

  actualEndDate: String,

  createdBy: String,

}, {

  timestamps: true,

});

export default mongoose.models.Task ||
  mongoose.model("Task", TaskSchema);