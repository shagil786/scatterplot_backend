const mongoose = require("mongoose");

const dataPoint = new mongoose.Schema({
  id: {
    type: String,
    required: true,
  },
  label: {
    type: String,
    required: true,
  },
  xCord: {
    type: Number,
    required: true,
  },
  yCord: {
    type: Number,
    required: true,
  },
  backgroundColor: {
    type: String,
    required: false,
  },
});

module.exports = mongoose.model("Datapoint", dataPoint);
