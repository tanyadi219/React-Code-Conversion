const express = require("express");
const bcrypt = require("bcryptjs"); // npm install bcryptjs
const Model = require("../models/UserModel");
const jwt = require("jsonwebtoken");
const auth = require("../middleware/auth");
require("dotenv").config();

const router = express.Router();

// ADD USER (signup) — hash password before saving
router.post("/add", async (req, res) => {
  try {
    const { password, ...rest } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await new Model({ ...rest, password: hashedPassword }).save();
    res.status(201).json(result);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Error creating user", error: err.message });
  }
});

// GET ALL USERS
router.get("/getall", async (req, res) => {
  try {
    const result = await Model.find();
    res.status(200).json(result);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Error fetching users", error: err.message });
  }
});

// GET BY CITY
router.get("/getbycity/:city", async (req, res) => {
  try {
    const result = await Model.find({ city: req.params.city });
    res.status(200).json(result);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Error fetching users", error: err.message });
  }
});

// GET BY EMAIL
router.get("/getbyemail/:email", async (req, res) => {
  try {
    const result = await Model.find({ email: req.params.email });
    res.status(200).json(result);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Error fetching users", error: err.message });
  }
});

// GET BY ID
router.get("/getbyid/:id", async (req, res) => {
  try {
    const result = await Model.findById(req.params.id);
    if (!result) return res.status(404).json({ message: "User not found" });
    res.status(200).json(result);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Error fetching user", error: err.message });
  }
});

// UPDATE — protected, requires valid token
router.put("/update/:id", auth, async (req, res) => {
  try {
    const result = await Model.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!result) return res.status(404).json({ message: "User not found" });
    res.status(200).json(result);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Error updating user", error: err.message });
  }
});

// DELETE — protected, requires valid token
router.delete("/delete/:id", auth, async (req, res) => {
  try {
    const result = await Model.findByIdAndDelete(req.params.id);
    if (!result) return res.status(404).json({ message: "User not found" });
    res.status(200).json({ message: "User deleted", result });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Error deleting user", error: err.message });
  }
});

// LOGIN
router.post("/authenticate", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await Model.findOne({ email });

    if (!user) {
      return res.status(403).json({ message: "Invalid Credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(403).json({ message: "Invalid Credentials" });
    }

    const { _id, name } = user;
    jwt.sign({ _id, name }, process.env.JWT_SECRET, { expiresIn: "1h" }, (err, token) => {
      if (err) {
        console.log(err);
        return res.status(500).json({ message: "Error generating token" });
      }
      res.status(200).json({ token, user: { _id, name, email: user.email } });
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Error during authentication", error: err.message });
  }
});

module.exports = router;