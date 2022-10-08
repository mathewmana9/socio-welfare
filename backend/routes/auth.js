require("dotenv").config();
const router = require("express").Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

//register handle
router.post("/register", async (req, res) => {
  const salt = await bcrypt.genSalt(10);
  const hashedPswd = await bcrypt.hash(req.body.password, salt);

  const newUser = new User({
    name: req.body.name,
    email: req.body.email,
    password: hashedPswd,
  });
  // if (newUser) {
  //   res.status(400).json({ messsage: "The user with that email exists" });
  // }
  try {
    const result = await newUser.save();
    const { password, isAdmin, ...data } = await result.toJSON();

    res.status(201).json({ ...data, message: "User has created" });
  } catch (error) {
    res.status(500).json(error);
  }
});

// login handle
router.post("/login", async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
      return res.status(404).json({ message: "The user does not exist!" });
    }

    if (!(await bcrypt.compare(req.body.password, user.password))) {
      return res.status(400).json({ message: "invalid credentials" });
    }
    // const { password, ...otherDetails } = user._doc;
    const accessToken = jwt.sign(
      { _id: user._id, isAdmin: user.isAdmin },
      process.env.JWT_SECRET,
      {
        expiresIn: "10min",
      }
    );

    res.cookie("jwt", accessToken, {
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000, //1 day
    });

    res.status(201).json({ message: "success", accessToken });
  } catch (err) {
    console.error(err);
  }
});

// // Users
// router.get("/user", async (res, req) => {
//   const cookie = req.cookies["jwt"];

//   const result = jwt.verify(cookie, process.env.JWT_SECRET);

//   if (!result) {
//     return res.status(401).send({ message: "not authenticated" });
//   }

//   const user = await User.findOne({ _id: result._id });
//   res.send(user);
// });
module.exports = router;
