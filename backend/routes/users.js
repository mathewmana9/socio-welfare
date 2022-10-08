const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const { verifyAndAuthourize, verifyAndAdmin } = require("./verifyToken");

// Updating user
router.put("/:id", verifyAndAuthourize, async (req, res) => {
  if (req.body.password) {
    const salt = await bcrypt.genSalt(10);
    const hashedPswd = await bcrypt.hash(req.body.password, salt);
  }
  try {
    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      {
        $set: req.body,
      },
      { new: true }
    );
    res.status(200).json(updatedUser);
  } catch (error) {
    res.status(500).json(error);
  }
});

// Delete user
router.delete("/:id", verifyAndAuthourize, async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "User has been deleted" });
  } catch (error) {
    res.status(500).json(error);
  }
});

// Get user
router.get("/find/:id", verifyAndAdmin, async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    const { password, ...otherDetails } = user._doc;
    res.status(200).json(otherDetails);
  } catch (error) {
    res.status(500).json(error);
  }
});
// Get All Users
router.get("/", verifyAndAdmin, async (req, res) => {
  const latestUsers = req.query.new;
  try {
    const users = latestUsers
      ? await User.find().sort({ _id: -1 }).limit(2)
      : await User.find();
    // const { password, ...otherDetails } = users._doc;
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json(error);
  }
});

router.get("/stats", verifyAndAdmin, async (req, res) => {
  const date = new Date();
  const lastYear = new Date(date.setFullYear(date.getFullYear() - 1));

  try {
    const response = await User.aggregate([
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
