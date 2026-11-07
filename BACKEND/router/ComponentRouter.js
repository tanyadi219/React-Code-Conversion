const express = require("express");
const Model = require("../models/ComponentModel");

const router = express.Router();

// SAVE COMPONENT
router.post("/add", async (req, res) => {
  try {
    console.log("Component received:", req.body);
    const result = await new Model(req.body).save();
    res.status(201).json(result); // 201 = resource created
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Error saving component", error: err.message });
  }
});

// GET ALL COMPONENTS
router.get("/getall", async (req, res) => {
  try {
    const result = await Model.find();
    res.status(200).json(result);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Error fetching components", error: err.message });
  }
});

// GET COMPONENT BY ID
router.get("/getbyid/:id", async (req, res) => {
  try {
    const result = await Model.findById(req.params.id);
    if (!result) {
      return res.status(404).json({ message: "Component not found" });
    }
    res.status(200).json(result);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Error fetching component", error: err.message });
  }
});

// UPDATE COMPONENT
router.put("/update/:id", async (req, res) => {
  try {
    const result = await Model.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!result) {
      return res.status(404).json({ message: "Component not found" });
    }
    res.status(200).json(result);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Error updating component", error: err.message });
  }
});

// DELETE COMPONENT
router.delete("/delete/:id", async (req, res) => {
  try {
    const result = await Model.findByIdAndDelete(req.params.id);
    if (!result) {
      return res.status(404).json({ message: "Component not found" });
    }
    res.status(200).json({ message: "Component deleted", result });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Error deleting component", error: err.message });
  }
});

module.exports = router;