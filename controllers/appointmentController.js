const AppointmentDetail = require("../Models/AppointmentDetail");
const Schedule = require("../Models/Schedule");

exports.getAppointments = async (req, res) => {
  try {
    const { id } = req.params;
    const query = id ? { _id: id } : {};
    if (req.user.user_type === "patient") {
      query.patient_id = req.user.id;
    }
    const appointments = await AppointmentDetail.find(query)
      .populate("doctor_id", "name")
      .populate("healthCare_id", "name location")
      .populate("patient_id", "name")
      .populate("selected_date.schedule_id", "date time_slots");
    res.json(appointments);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.createAppointment = async (req, res) => {
  try {
    const { doctor_id, healthCare_id, schedule_id, time_slot } = req.body;
    const schedule = await Schedule.findById(schedule_id);
    if (!schedule) return res.status(404).json({ error: "Schedule not found" });
    const slot = schedule.time_slots.find(
      (s) =>
        s.startTime === time_slot.startTime && s.endTime === time_slot.endTime
    );
    if (!slot || !slot.isAvailable) {
      return res.status(400).json({ error: "Time slot unavailable" });
    }
    slot.isAvailable = false;
    await schedule.save();
    const appointment = new AppointmentDetail({
      doctor_id,
      healthCare_id,
      patient_id: req.user.id,
      selected_date: { schedule_id, time_slot },
      status: "booked",
    });
    await appointment.save();
    res
      .status(201)
      .json({ message: "Appointment booked successfully", appointment });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.updateAppointment = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, selected_date } = req.body;
    const appointment = await AppointmentDetail.findById(id);
    if (!appointment)
      return res.status(404).json({ error: "Appointment not found" });
    if (
      appointment.patient_id.toString() !== req.user.id &&
      req.user.user_type !== "admin"
    ) {
      return res.status(403).json({ error: "Unauthorized" });
    }
    if (selected_date) {
      const schedule = await Schedule.findById(selected_date.schedule_id);
      if (!schedule)
        return res.status(404).json({ error: "Schedule not found" });
      const slot = schedule.time_slots.find(
        (s) =>
          s.startTime === selected_date.time_slot.startTime &&
          s.endTime === selected_date.time_slot.endTime
      );
      if (!slot || !slot.isAvailable) {
        return res.status(400).json({ error: "Time slot unavailable" });
      }
      const oldSchedule = await Schedule.findById(
        appointment.selected_date.schedule_id
      );
      const oldSlot = oldSchedule.time_slots.find(
        (s) => s.startTime === appointment.selected_date.time_slot.startTime
      );
      if (oldSlot) oldSlot.isAvailable = true;
      await oldSchedule.save();
      slot.isAvailable = false;
      await schedule.save();
    }
    appointment.set({ status, selected_date, updatedAt: Date.now() });
    await appointment.save();
    res.json({ message: "Appointment updated successfully", appointment });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.deleteAppointment = async (req, res) => {
  try {
    const { id } = req.params;
    const appointment = await AppointmentDetail.findById(id);
    if (!appointment)
      return res.status(404).json({ error: "Appointment not found" });
    if (
      appointment.patient_id.toString() !== req.user.id &&
      req.user.user_type !== "admin"
    ) {
      return res.status(403).json({ error: "Unauthorized" });
    }
    const schedule = await Schedule.findById(
      appointment.selected_date.schedule_id
    );
    const slot = schedule.time_slots.find(
      (s) => s.startTime === appointment.selected_date.time_slot.startTime
    );
    if (slot) slot.isAvailable = true;
    await schedule.save();
    await AppointmentDetail.findByIdAndDelete(id);
    res.json({ message: "Appointment deleted successfully" });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
