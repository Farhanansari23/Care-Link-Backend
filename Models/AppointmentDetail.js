// models/AppointmentDetail.js
const mongoose = require("mongoose");
const { Schema } = mongoose;
const AppointmentDetailSchema = new mongoose.Schema({
  doctor_id: {
    type: Schema.Types.ObjectId,
    ref: "DoctorDetail",
    required: true,
  },
  healthCare_id: {
    type: Schema.Types.ObjectId,
    ref: "HealthCenter",
    required: true,
  },
  patient_id: {
    type: Schema.Types.ObjectId,
    ref: "UserDetail",
    required: true,
  },
  selected_date: {
    schedule_id: {
      type: Schema.Types.ObjectId,
      ref: "Schedule",
      required: true,
    },
    time_slot: {
      startTime: { type: String, required: true },
      endTime: { type: String, required: true },
    },
  },
  status: {
    type: String,
    enum: ["booked", "completed", "canceled"],
    default: "booked",
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});
module.exports = mongoose.model("AppointmentDetail", AppointmentDetailSchema);
