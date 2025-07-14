const userDetail = require("../Models/User");
const bcrypt = require("bcryptjs");
const AppointmentDetail = require("../Models/AppointmentDetail");
const mongoose = require("mongoose");

exports.getUsers = async (req, res) => {
  try {
    const { id } = req.params;
    if (id) {
      const user = await userDetail.findById(id);
      if (!user) return res.status(404).json({ error: "userDetail not found" });
      return res.json(user);
    }
    const users = await userDetail.find();
    res.json(users);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.createUser = async (req, res) => {
  try {
    const { name, email, pwd, phone_no, address, user_type } = req.body;
    const hashedPassword = await bcrypt.hash(pwd, 10);
    const user = new userDetail({
      name,
      email,
      pwd: hashedPassword,
      phone_no,
      address,
      user_type: user_type || "patient",
      is_active: true,
    });
    await user.save();
    res.status(201).json({ message: "userDetail created successfully", user });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, phone_no, user_type, address, is_active } = req.body;
    const user = await userDetail.findByIdAndUpdate(
      id,
      {
        name,
        email,
        phone_no,
        user_type,
        address,
        is_active,
        updatedAt: Date.now(),
      },
      { new: true }
    );
    if (!user) return res.status(404).json({ error: "userDetail not found" });
    res.json({ message: "userDetail updated successfully", user });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await userDetail.findByIdAndDelete(id);
    if (!user) return res.status(404).json({ error: "userDetail not found" });
    res.json({ message: "userDetail deleted successfully" });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};



exports.getUpcomingAppointments = async (req, res) => {
  try {
    const { id } = req.params; // patient id
    const today = new Date();
    today.setHours(0, 0, 0, 0); // start of today

    const appointments = await AppointmentDetail.aggregate([
      { $match: { patient_id: new mongoose.Types.ObjectId(id), status: "booked" } },
      {
        $lookup: {
          from: "schedules",
          localField: "selected_date.schedule_id",
          foreignField: "_id",
          as: "schedule",
        },
      },
      { $unwind: "$schedule" },
      { $match: { "schedule.date": { $gte: today } } },
      {
        $lookup: {
          from: "doctordetails",
          localField: "doctor_id",
          foreignField: "_id",
          as: "doctor",
        },
      },
      {
        $lookup: {
          from: "healthcenters",
          localField: "healthCare_id",
          foreignField: "_id",
          as: "healthCare",
        },
      },
      {
        $project: {
          status: 1,
          createdAt: 1,
          updatedAt: 1,
          selected_date: 1,
          patient_id: 1,
          "schedule.date": 1,
          "schedule.time_slots": 1,
          "doctor.name": 1,
          "healthCare.name": 1,
          "healthCare.location": 1,
        },
      },
    ]);

    res.json(appointments);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
