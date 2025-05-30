// controllers/patientController.js
const Appointment = require("../Models/AppointmentDetail");
exports.getUpcomingAppointments = async (req, res) => {
  const userId = req.user.id;
  const now = new Date();
  const appointments = await Appointment.find({
    patient_id: userId,
    selected_date: { $gte: now },
  })
    .populate("doctor_id")
    .populate("healthCare_id");
  res.json(appointments);
};
