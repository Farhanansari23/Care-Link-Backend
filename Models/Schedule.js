// models/Schedule.js
const mongoose = require("mongoose");
const { Schema } = mongoose;
const ScheduleSchema = new mongoose.Schema({
  doctor_id: {
    type: Schema.Types.ObjectId,
    ref: "DoctorDetail",
    required: true,
  },
  date: { type: Date, required: true },
  time_slots: [
    {
      startTime: { type: String, required: true },
      endTime: { type: String, required: true },
      isAvailable: { type: Boolean, default: true },
    },
  ],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});
module.exports = mongoose.model("Schedule", ScheduleSchema);
