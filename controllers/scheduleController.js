const Schedule = require("../Models/Schedule");
const DoctorDetail = require("../Models/DoctorDetail");
const AppointmentDetail = require("../Models/AppointmentDetail");
1;

exports.getSchedules = async (req, res) => {
  try {
    const { doctor_id } = req.params;
    const query = doctor_id ? { doctor_id } : {};
    const schedules = await Schedule.find(query).populate("doctor_id", "name");
    res.json(schedules);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.createSchedule = async (req, res) => {
  try {
    const { doctor_id, date, time_slots } = req.body;
    const doctor = await DoctorDetail.findById(doctor_id);
    if (!doctor) return res.status(404).json({ error: "Doctor not found" });
    const schedule = new Schedule({ doctor_id, date, time_slots });
    await schedule.save();
    doctor.schedule.push(schedule._id);
    await doctor.save();
    res
      .status(201)
      .json({ message: "Schedule created successfully", schedule });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.updateSchedule = async (req, res) => {
  try {
    const { id } = req.params;
    const { date, time_slots } = req.body;
    const schedule = await Schedule.findByIdAndUpdate(
      id,
      { date, time_slots, updatedAt: Date.now() },
      { new: true }
    ).populate("doctor_id", "name");
    if (!schedule) return res.status(404).json({ error: "Schedule not found" });
    res.json({ message: "Schedule updated successfully", schedule });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.deleteSchedule = async (req, res) => {
  try {
    const { id } = req.params;
    const appointment = await AppointmentDetail.findOne({
      "selected_date.schedule_id": id,
    });
    if (appointment)
      return res
        .status(400)
        .json({ error: "Schedule is in use by an appointment" });
    const schedule = await Schedule.findByIdAndDelete(id);
    if (!schedule) return res.status(404).json({ error: "Schedule not found" });
    await DoctorDetail.updateOne({ schedule: id }, { $pull: { schedule: id } });
    res.json({ message: "Schedule deleted successfully" });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
