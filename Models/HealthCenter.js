// models/HealthCenter.js
const mongoose = require("mongoose");
const { Schema } = mongoose;
const HealthCenterSchema = new mongoose.Schema({
  name: { type: String, required: true },
  location: { type: String, required: true },
  user_id: { type: Schema.Types.ObjectId, ref: "UserDetail", required: true },
  contact_detail: { type: String, required: true },
  healCaredetail: { type: String },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});
module.exports = mongoose.model("HealthCenter", HealthCenterSchema);
