const Healthcenter = require("../Models/Healthcenter");
const DoctorDetail = require("../Models/DoctorDetail");
const mongoose = require("mongoose")

exports.getHealthcenters = async (req, res) => {
  try {
    const { id } = req.params;

    const populateDoctorFields = {
      path: "doctor_id",
      select: "name doctorRating description schedule category_id",
      populate: [
        {
          path: "schedule",
          select: "time_slots", // adjust based on your Schedule schema
        },
        {
          path: "category_id",
          select: "name", // adjust based on your Category schema
        },
      ],
    };

    if (id) {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ error: "Invalid healthcenter ID format" });
      }

      const healthcenter = await Healthcenter.findById(id).populate(populateDoctorFields);

      if (!healthcenter) {
        return res.status(404).json({ error: "Healthcenter not found" });
      }

      return res.status(200).json(healthcenter);
    }

    const healthcenters = await Healthcenter.find().populate(populateDoctorFields);
    return res.status(200).json(healthcenters);
  } catch (error) {
    console.error("Error fetching healthcenters:", error);
    return res.status(500).json({ error: "Server error" });
  }
};


exports.createHealthcenter = async (req, res) => {
  try {
    const { name, location, doctor_id, contact_detail, healCaredetail } =
      req.body;
    // Validate doctor_id array if provided
    if (doctor_id && !Array.isArray(doctor_id)) {
      return res.status(400).json({ error: "doctor_id must be an array" });
    }
    const healthcenter = new Healthcenter({
      name,
      location,
      doctor_id: doctor_id || [], // Default to empty array if not provided
      contact_detail,
      healCaredetail,
    });
    await healthcenter.save();
    const populatedHealthcenter = await Healthcenter.findById(
      healthcenter._id
    ).populate("doctor_id", "name email");
    res.status(201).json({
      message: "Healthcenter created successfully",
      healthcenter: populatedHealthcenter,
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.updateHealthcenter = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, location, doctor_id, contact_detail, healCaredetail } =
      req.body;
    // Validate doctor_id array if provided
    if (doctor_id && !Array.isArray(doctor_id)) {
      return res.status(400).json({ error: "doctor_id must be an array" });
    }
    const healthcenter = await Healthcenter.findByIdAndUpdate(
      id,
      {
        name,
        location,
        doctor_id: doctor_id || [], // Default to empty array if not provided
        contact_detail,
        healCaredetail,
        updatedAt: Date.now(),
      },
      { new: true }
    ).populate("doctor_id", "name email");
    if (!healthcenter)
      return res.status(404).json({ error: "Healthcenter not found" });
    res.json({ message: "Healthcenter updated successfully", healthcenter });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.deleteHealthcenter = async (req, res) => {
  try {
    const { id } = req.params;
    // Check if any doctor references this health center in their healthcenter_id array
    const doctor = await DoctorDetail.findOne({ healthcenter_id: id });
    if (doctor)
      return res
        .status(400)
        .json({ error: "Healthcenter is in use by a doctor" });
    const healthcenter = await Healthcenter.findByIdAndDelete(id);
    if (!healthcenter)
      return res.status(404).json({ error: "Healthcenter not found" });
    res.json({ message: "Healthcenter deleted successfully" });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
