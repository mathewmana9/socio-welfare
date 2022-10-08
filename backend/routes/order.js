const express = require("express");
const router = express.Router();
const Order = require("../models/Order");
const { verifyAndAdmin, verifyToken } = require("./verifyToken");

// Creating a new Application
router.post("/", verifyToken, async (req, res) => {
  const newOrder = new Order(req.body);

  try {
    const savedOrder = await newOrder.save();

    res.status(200).json(savedOrder);
  } catch (error) {
    res.status(500).json(error);
  }
});

// Updating Order
router.put("/:id", verifyToken, async (req, res) => {
  try {
    const updatedOrder = await Order.findByIdAndUpdate(
      req.params.id,
      {
        $set: req.body,
      },
      { new: true }
    );
    res.status(200).json(updatedOrder);
  } catch (error) {
    res.status(500).json(error);
  }
});

// // Delete Order
router.delete("/:id", verifyToken, async (req, res) => {
  try {
    await Order.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Order has been deleted" });
  } catch (error) {
    res.status(500).json(error);
  }
});

// // Get Order
router.get("/find/:userId", verifyToken, async (req, res) => {
  try {
    const order = await Order.findOne(req.params.userId);
    res.status(200).json(order);
  } catch (error) {
    res.status(500).json(error);
  }
});

// // Get All Orders
router.get("/", verifyAndAdmin, async (req, res) => {
  const latestOrder = req.query.new;
  try {
    let result;
    if (latestOrder) {
      result = await Order.find().sort({ createdAt: -1 }).limit(2);
    } else {
      result = await Order.find();
    }

    res.status(200).json(result);
  } catch (error) {
    res.status(500).json(error);
  }
});

// Order stats
router.get("/stats", verifyAndAdmin, async (req, res) => {
  const date = new Date();
  const lastYear = new Date(date.setFullYear(date.getFullYear() - 1));

  try {
    const response = await Order.aggregate([
      { $match: { createdAt: { $gte: lastYear } } },
      { $project: { month: { $month: "$createdAt" } } },
      { $group: { _id: "$month", total: { $sum: 1 } } },
    ]);

    res.status(200).json(response);
  } catch (error) {
    res.status(500).json(error);
  }
});

// Income
router.get("/income", verifyAndAdmin, async (req, res) => {
  const date = new Date();
  const lastMonth = new Date(date.setMonth(date.getMonth() - 1));
  const prevMonth = new Date(new Date().setMonth(lastMonth.getMonth() - 1));

  try {
    const data = await Order.aggregate([
      {
        $match: { createdAt: { $gte: prevMonth } },
      },
      { $project: { month: { $month: "$createdAt" }, sales: "$amount" } },
      {
        $group: {
          _id: "$month",
          total: { $sum: "$sales" },
        },
      },
    ]);

    res.status(200).json(data);
  } catch (error) {
    res.status(500).json(error);
  }
});

module.exports = router;
