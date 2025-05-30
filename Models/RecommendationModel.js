const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const recommendationSchema = new Schema({
  user_id: { type: Schema.Types.ObjectId, ref: "UserDetail", required: true },
  doctor_id: { type: Schema.Types.ObjectId, ref: "DoctorDetail" },
  healthcenter_id: { type: Schema.Types.ObjectId, ref: "HealthCenter" },
  interaction_type: { type: String, enum: ["view", "book"], required: true },
  rating: { type: Number, min: 1, max: 5 },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Recommendation", recommendationSchema);
