require("dotenv").config();
const express = require("express");
const app = express();
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const connect = require("./config/db");
// declaring routes
const authRoute = require("./routes/auth");

// db connection
connect();
// mongoose
//   .connect("mongodb://localhost:27017/sociowelfare", { useNewUrlParser: true })
//   .then(() => {
//     console.log("Database connected successfully");
//   })
//   .catch((err) => console.error(err));

// Port
const port = process.env.PORT || 5000;

// middlewares
app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    credentials: true,
    origin: ["localhost:3000", "localhost: 5000"],
  })
);

// using routes
app.use("/api", authRoute);

app.listen(port, () => {
  console.log(`Server started on port ${port}`);
});
