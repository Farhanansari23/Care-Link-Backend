const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const userController = require("../controllers/userController");
const doctorController = require("../controllers/doctorController");
const categoryController = require("../controllers/categoryController");
const healthcenterController = require("../controllers/healthcenterController");
const scheduleController = require("../controllers/scheduleController");
const appointmentController = require("../controllers/appointmentController");
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");
const searchController = require("../controllers/searchController");

//search Routes
router.get(
  "/search",
  authMiddleware,
  searchController.searchHealthcareOrDoctor
);
router.get(
  "/recommendations",
  authMiddleware,
  roleMiddleware("patient"),
  searchController.getRecommendations
);
// Auth Routes
router.post("/auth/register", authController.register);
router.post("/auth/login", authController.login);

// User Routes
router.get(
  "/users",
  authMiddleware,
  userController.getUsers
);
router.get("/users/:id", authMiddleware, userController.getUsers);
router.post(
  "/users",
  authMiddleware,
  roleMiddleware("admin"),
  userController.createUser
);
router.put("/users/:id", authMiddleware, userController.updateUser);
router.delete(
  "/users/:id",
  authMiddleware,
  roleMiddleware("admin"),
  userController.deleteUser
);
router.get(
  "/users/:id/appointments",
  authMiddleware,
  roleMiddleware("patient"),
  userController.getUpcomingAppointments
);

// Category Routes
router.get("/categories", authMiddleware, categoryController.getCategories);
router.get("/categories/:id", authMiddleware, categoryController.getCategories);
router.post(
  "/categories",
  authMiddleware,
  roleMiddleware("admin"),
  categoryController.createCategory
);
router.put(
  "/categories/:id",
  authMiddleware,
  roleMiddleware("admin"),
  categoryController.updateCategory
);
router.delete(
  "/categories/:id",
  authMiddleware,
  roleMiddleware("admin"),
  categoryController.deleteCategory
);

// Healthcenter Routes
router.get(
  "/healthcenters",
  authMiddleware,
  healthcenterController.getHealthcenters
);
router.get(
  "/healthcenters/:id",
  authMiddleware,
  healthcenterController.getHealthcenters
);
router.post(
  "/healthcenters",
  authMiddleware,
  roleMiddleware("admin"),
  healthcenterController.createHealthcenter
);
router.put(
  "/healthcenters/:id",
  authMiddleware,
  roleMiddleware("admin"),
  healthcenterController.updateHealthcenter
);
router.delete(
  "/healthcenters/:id",
  authMiddleware,
  roleMiddleware("admin"),
  healthcenterController.deleteHealthcenter
);

// Doctor Routes
router.get("/doctors", authMiddleware, doctorController.getDoctors);
router.get("/doctors/:id", authMiddleware, doctorController.getDoctors);
router.post(
  "/doctors",
  authMiddleware,
  roleMiddleware("admin"),
  doctorController.createDoctor
);
router.put(
  "/doctors/:id",
  authMiddleware,
  roleMiddleware("admin"),
  doctorController.updateDoctor
);
router.delete(
  "/doctors/:id",
  authMiddleware,
  roleMiddleware("admin"),
  doctorController.deleteDoctor
);

// Schedule Routes
router.get("/schedules", authMiddleware, scheduleController.getSchedules);
router.get(
  "/schedules/doctor/:doctor_id",
  authMiddleware,
  scheduleController.getSchedules
);
router.post(
  "/schedules",
  authMiddleware,
  roleMiddleware("admin"),
  scheduleController.createSchedule
);
router.put(
  "/schedules/:id",
  authMiddleware,
  roleMiddleware("admin"),
  scheduleController.updateSchedule
);
router.delete(
  "/schedules/:id",
  authMiddleware,
  roleMiddleware("admin"),
  scheduleController.deleteSchedule
);

// Appointment Routes
router.get(
  "/appointments",
  authMiddleware,
  appointmentController.getAppointments
);
router.get(
  "/appointments/:id",
  authMiddleware,
  appointmentController.getAppointments
);
router.post(
  "/appointments",
  authMiddleware,
  roleMiddleware("patient"),
  appointmentController.createAppointment
);
router.put(
  "/appointments/:id",
  authMiddleware,
  roleMiddleware("patient"),
  appointmentController.updateAppointment
);
router.delete(
  "/appointments/:id",
  authMiddleware,
  roleMiddleware("patient"),
  appointmentController.deleteAppointment
);

module.exports = router;
