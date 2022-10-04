const mongoose = require("mongoose");
const FormAppSchema = new mongoose.Schema(
  {
    firstname: {
      type: String,
      required: true,
    },
    lastname: {
      type: String,
      unique: true,
      required: true,
    },
    POB: {
      type: String,
      required: true,
    },
    DOB: {
      type: Date,
      required: true,
    },
    idNo: {
      type: Number,
      required: true,
      unique: true,
    },
    categories: { type: Array },
  },
  { timestamps: true }
);

const FormApp = mongoose.model("FormApp", FormAppSchema);
module.exports = FormApp;
