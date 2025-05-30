// models/User.js
const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, unique: true, required: true },
  pwd: { type: String, required: true },
  user_type: { type: String, enum: ["patient", "admin"], default: "patient" },
  is_active: { type: Boolean, default: true },
  phone_no: { type: String, unique: true, required: true },
  address: { type: String },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});
module.exports = mongoose.model("UserDetail", UserSchema);
