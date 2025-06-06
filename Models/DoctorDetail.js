// models/DoctorDetail.js
const mongoose = require("mongoose");
const { Schema } = mongoose;
const DoctorDetailSchema = new mongoose.Schema({
  name: { type: String, required: true },
  schedule: [{ type: Schema.Types.ObjectId, ref: "Schedule" }],
  description: { type: String },
  category_id: [
    { type: Schema.Types.ObjectId, ref: "Category", required: true },
  ],
  healthcenter_id: [{ type: Schema.Types.ObjectId, ref: "HealthCenter" }],
  doctorRating: { type: Number, min: 0, max: 5, default: 0 },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("DoctorDetail", DoctorDetailSchema);
