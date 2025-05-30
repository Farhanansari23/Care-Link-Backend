const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../Models/User");


exports.register = async (req, res) => {
  try {
    const { name, email, pwd, phone_no, address, user_type } = req.body;
    const hashedPassword = await bcrypt.hash(pwd, 10);
    const user = new User({
      name,
      email,
      pwd: hashedPassword,
      phone_no,
      address,
      user_type: user_type || "patient",
      is_active: true,
    });
    await user.save();
    res.status(201).json({ message: "User registered successfully", user });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// exports.login = async (req, res) => {
  try {
    const { email, pwd } = req.body;
    console.log("email", email);
    const user = await User.findOne({ email });
    console.log("user", user);
    if (!user || !user.is_active) {
      return res
        .status(401)
        .json({ error: "Invalid credentials or inactive user" });
    }
    const isMatch = await bcrypt.compare(pwd, user.pwd);
    if (!isMatch) {
      return res.status(401).json({ error: "Invalid credentials" });
    }
    const token = jwt.sign(
      { id: user._id, user_type: user.user_type },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );
    res.json({ message: "Login successful", token, user });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
// };
exports.login = async (req, res) => {
  try {
    const { email, pwd } = req.body;
    
    // 1. Validate input
    if (!email || !pwd) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    // 2. Normalize email (lowercase and trim)
    const normalizedEmail = email.toLowerCase().trim();

    // 3. Find user with case-insensitive search
    const user = await User.findOne({ 
      email: { $regex: new RegExp(`^${normalizedEmail}$`, 'i') }
    });

    console.log("Searching for email:", normalizedEmail);
    console.log("Found user:", user);

    if (!user) {
      return res.status(401).json({ error: "No user found with this email" });
    }

    if (!user.is_active) {
      return res.status(403).json({ error: "Account is inactive" });
    }

    // 4. Compare passwords
    const isMatch = await bcrypt.compare(pwd, user.pwd);
    if (!isMatch) {
      return res.status(401).json({ error: "Invalid password" });
    }

    // 5. Generate token
    const token = jwt.sign(
      { id: user._id, user_type: user.user_type },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    // 6. Return success response (remove sensitive data)
    const userData = user.toObject();
    delete userData.pwd;
    
    res.json({ 
      message: "Login successful", 
      token, 
      user: userData 
    });

  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
