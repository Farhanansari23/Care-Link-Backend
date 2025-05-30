const DoctorDetail = require("../Models/DoctorDetail");
const Schedule = require("../Models/Schedule");

exports.createDoctor = async (req, res) => {
  try {
    const { name, description, category_id, healthcenter_id, doctorRating } =
      req.body;
    const doctor = new DoctorDetail({
      name,
      description,
      category_id,
      healthcenter_id,
      doctorRating,
    });
    await doctor.save();
    res.status(201).json({ message: "Doctor created successfully", doctor });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.getDoctors = async (req, res) => {
  try {
    const { id } = req.params;
    if (id) {
      const doctor = await DoctorDetail.findById(id)
        .populate("category_id", "name")
        .populate("healthcenter_id", "name location")
        .populate("schedule", "date time_slots");
      if (!doctor) return res.status(404).json({ error: "Doctor not found" });
      return res.json(doctor);
    }
    const doctors = await DoctorDetail.find()
      .populate("category_id", "name")
      .populate("healthcenter_id", "name location")
      .populate("schedule", "date time_slots");
    res.json(doctors);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.updateDoctor = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, category_id, healthcenter_id, doctorRating } =
      req.body;
    const doctor = await DoctorDetail.findByIdAndUpdate(
      id,
      {
        name,
        description,
        category_id,
        healthcenter_id,
        doctorRating,
        updatedAt: Date.now(),
      },
      { new: true }
    )
      .populate("category_id", "name")
      .populate("healthcenter_id", "name location");
    if (!doctor) return res.status(404).json({ error: "Doctor not found" });
    res.json({ message: "Doctor updated successfully", doctor });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.deleteDoctor = async (req, res) => {
  try {
    const { id } = req.params;
    const doctor = await DoctorDetail.findByIdAndDelete(id);
    if (!doctor) return res.status(404).json({ error: "Doctor not found" });
    await Schedule.deleteMany({ doctor_id: id });
    res.json({ message: "Doctor deleted successfully" });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
