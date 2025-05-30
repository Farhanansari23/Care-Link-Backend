const AppointmentDetail = require("../Models/AppointmentDetail");
const DoctorDetail = require("../Models/DoctorDetail");
const Healthcenter = require("../Models/Healthcenter");

exports.searchHealthcareOrDoctor = async (req, res) => {
  try {
    const { query, category_id, location } = req.query;
    const searchCriteria = {};
    if (query) {
      searchCriteria.$or = [{ name: { $regex: query, $options: "i" } }];
    }
    if (category_id) {
      searchCriteria.category_id = category_id;
    }
    if (location) {
      searchCriteria.location = { $regex: location, $options: "i" };
    }

    const doctors = await DoctorDetail.find(searchCriteria)
      .populate("category_id", "name")
      .populate("healthcenter_id", "name location");
    const healthcenters = await Healthcenter.find(searchCriteria).populate(
      "user_id",
      "name"
    );

    res.json({ doctors, healthcenters });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.getRecommendations = async (req, res) => {
  try {
    const userId = req.user.id;
    const appointments = await AppointmentDetail.find({
      patient_id: userId,
    }).populate("doctor_id", "name category_id healthcenter_id doctorRating");

    const doctorIds = [
      ...new Set(appointments.map((a) => a.doctor_id._id.toString())),
    ];
    const recommendedDoctors = await DoctorDetail.find({
      _id: { $nin: doctorIds },
      doctorRating: { $gte: 4 },
    })
      .populate("category_id", "name")
      .populate("healthcenter_id", "name location")
      .limit(5);

    res.json({ recommendedDoctors });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
