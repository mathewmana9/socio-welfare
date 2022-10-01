require("dotenv").config();
const router = require("express").Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

//register handle
router.post("/register", async (req, res) => {
  const salt = await bcrypt.genSalt(10);
  const hashedPswd = await bcrypt.hash(req.body.password, salt);
  try {
    const user = new User({
      name: req.body.name,
      email: req.body.email,
      password: hashedPswd,
    });

    const result = await user.save();

    const { password, ...data } = await result.toJSON();

    res.send(data);
  } catch (error) {}
});

// login handle
router.post("/login", async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
      return res.status(404).send({ message: "The user does not exist!" });
    }

    if (!(await bcrypt.compare(req.body.password, user.password))) {
      return res.status(400).send({ message: "invalid credentials" });
    }

    const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "10min",
    });

    res.cookie("jwt", token, {
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000, //1 day
    });

    res.status(201).send({ message: "success" });
  } catch (err) {
    console.error(err);
  }
});

// Users
router.get("/user", async (res, req) => {
  const cookie = req.cookies["jwt"];

  const result = jwt.verify(cookie, process.env.JWT_SECRET);

  if (!result) {
    return res.status(401).send({ message: "not authenticated" });
  }

  const user = await User.findOne({ _id: result._id });
  res.send(user);
});
module.exports = router;
