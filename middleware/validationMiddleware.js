const { body, param, validationResult } = require("express-validator");

const validateUser = [
  body("name").notEmpty().withMessage("Name is required"),
  body("email").isEmail().withMessage("Invalid email"),
  body("phone_no").isMobilePhone().withMessage("Invalid phone number"),
  body("pwd")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters"),
  body("user_type")
    .optional()
    .isIn(["patient", "admin"])
    .withMessage("Invalid user type"),
];

const validateCategory = [
  body("name").notEmpty().withMessage("Category name is required"),
];

const validateHealthcenter = [
  body("name").notEmpty().withMessage("Name is required"),
  body("location").notEmpty().withMessage("Location is required"),
  body("user_id").isMongoId().withMessage("Invalid user ID"),
  body("contact_detail").notEmpty().withMessage("Contact detail is required"),
];

const validateDoctor = [
  body("name").notEmpty().withMessage("Name is required"),
  body("category_id")
    .isArray({ min: 1 })
    .withMessage("At least one category ID is required"),
  body("category_id.*").isMongoId().withMessage("Invalid category ID"),
  body("healthcenter_id")
    .isArray({ min: 1 })
    .withMessage("At least one healthcenter ID is required"),
  body("healthcenter_id.*").isMongoId().withMessage("Invalid healthcenter ID"),
  body("doctorRating")
    .optional()
    .isFloat({ min: 0, max: 5 })
    .withMessage("Rating must be between 0 and 5"),
];

const validateSchedule = [
  body("doctor_id").isMongoId().withMessage("Invalid doctor ID"),
  body("date").isISO8601().withMessage("Invalid date"),
  body("time_slots")
    .isArray({ min: 1 })
    .withMessage("At least one time slot is required"),
  body("time_slots.*.startTime")
    .notEmpty()
    .withMessage("Start time is required"),
  body("time_slots.*.endTime").notEmpty().withMessage("End time is required"),
];

const validateAppointment = [
  body("doctor_id").isMongoId().withMessage("Invalid doctor ID"),
  body("healthCare_id").isMongoId().withMessage("Invalid healthcenter ID"),
  body("selected_date.schedule_id")
    .isMongoId()
    .withMessage("Invalid schedule ID"),
  body("selected_date.time_slot.startTime")
    .notEmpty()
    .withMessage("Start time is required"),
  body("selected_date.time_slot.endTime")
    .notEmpty()
    .withMessage("End time is required"),
];

const validateId = [param("id").isMongoId().withMessage("Invalid ID")];

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

module.exports = {
  validateUser,
  validateCategory,
  validateHealthcenter,
  validateDoctor,
  validateSchedule,
  validateAppointment,
  validateId,
  handleValidationErrors,
};
