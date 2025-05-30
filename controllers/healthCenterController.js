const Healthcenter = require("../Models/Healthcenter");
const DoctorDetail = require("../Models/DoctorDetail");

exports.getHealthcenters = async (req, res) => {
  try {
    const { id } = req.params;
    if (id) {
      const healthcenter = await Healthcenter.findById(id).populate(
        "user_id",
        "name email"
      );
      if (!healthcenter)
        return res.status(404).json({ error: "Healthcenter not found" });
      return res.json(healthcenter);
    }
    const healthcenters = await Healthcenter.find().populate(
      "user_id",
      "name email"
    );
    res.json(healthcenters);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.createHealthcenter = async (req, res) => {
  try {
    const { name, location, user_id, contact_detail, healCaredetail } =
      req.body;
    const healthcenter = new Healthcenter({
      name,
      location,
      user_id,
      contact_detail,
      healCaredetail,
    });
    await healthcenter.save();
    res
      .status(201)
      .json({ message: "Healthcenter created successfully", healthcenter });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.updateHealthcenter = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, location, user_id, contact_detail, healCaredetail } =
      req.body;
    const healthcenter = await Healthcenter.findByIdAndUpdate(
      id,
      {
        name,
        location,
        user_id,
        contact_detail,
        healCaredetail,
        updatedAt: Date.now(),
      },
      { new: true }
    ).populate("user_id", "name email");
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
