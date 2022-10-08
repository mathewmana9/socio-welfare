const express = require("express");
const router = express.Router();
const Form = require("../models/FormApp");
const {
  verifyAndAuthourize,
  verifyAndAdmin,
  verifyToken,
} = require("./verifyToken");

// Creating a new Application
router.post("/", verifyToken, async (req, res) => {
  const newForm = new Form(req.body);

  try {
    const savedForm = await newForm.save();

    res.status(200).json(savedForm);
  } catch (error) {
    res.status(500).json(error);
  }
});

// Updating FormApplication
router.put("/:id", verifyToken, async (req, res) => {
  try {
    const updatedForm = await Form.findByIdAndUpdate(
      req.params.id,
      {
        $set: req.body,
      },
      { new: true }
    );
    res.status(200).json(updatedForm);
  } catch (error) {
    res.status(500).json(error);
  }
});

// // Delete Application
router.delete("/:id", verifyToken, async (req, res) => {
  try {
    await Form.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Application has been deleted" });
  } catch (error) {
    res.status(500).json(error);
  }
});

// // Get Application
router.get("/find/:id", verifyToken, async (req, res) => {
  try {
    const result = await Form.findOne(req.params.id);
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json(error);
  }
});

// // Get All Application
router.get("/", verifyToken, async (req, res) => {
  const latestApps = req.query.new;
  const appCategory = req.query.category;
  try {
    let result;
    if (latestApps) {
      result = await Form.find().sort({ createdAt: -1 }).limit(2);
    } else if (appCategory) {
      result = await Form.find({ categories: { $in: [appCategory] } });
    } else {
      result = await Form.find();
    }

    res.status(200).json(result);
  } catch (error) {
    res.status(500).json(error);
  }
});

// Form Apps stats
router.get("/stats", verifyAndAdmin, async (req, res) => {
  const date = new Date();
  const lastYear = new Date(date.setFullYear(date.getFullYear() - 1));

  try {
    const response = await Form.aggregate([
      { $match: { createdAt: { $gte: lastYear } } },
      { $project: { month: { $month: "$createdAt" } } },
      { $group: { _id: "$month", total: { $sum: 1 } } },
    ]);

    res.status(200).json(response);
  } catch (error) {
    res.status(500).json(error);
  }
});

module.exports = router;
