const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const dotenv = require("dotenv");
const UserDetail = require("./Models/User");
const connectDB = require("./config/dbConnect");

dotenv.config();

// Admin user data
const adminUser = {
  name: "Admin User",
  email: "admin@example.com",
  phone_no: "+1234567890",
  pwd: "admin123", // Will be hashed
  address: "123 Admin Street, City, Country",
  user_type: "admin",
  is_active: true,
};

const seedAdmin = async () => {
  try {
    // Connect to MongoDB
    await connectDB();

    // Check if admin already exists
    const existingAdmin = await UserDetail.findOne({ email: adminUser.email });
    if (existingAdmin) {
      console.log("Admin user already exists:", existingAdmin.email);
      return;
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(adminUser.pwd, salt);
    adminUser.pwd = hashedPassword;

    // Create admin user
    const newAdmin = new UserDetail(adminUser);
    await newAdmin.save();

    console.log("Admin user created successfully:", newAdmin.email);
  } catch (error) {
    console.error("Error seeding admin user:", error.message);
  } finally {
    // Close MongoDB connection
    mongoose.connection.close();
  }
};

// Run the seeding script
seedAdmin();
