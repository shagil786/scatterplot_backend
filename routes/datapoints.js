const express = require("express");
const router = express.Router();
const FormData = require("../models/formData");
const randomColor = require("randomcolor");

const findByLabel = async (label) => {
  return await FormData.findOne({ label });
};

router.post("/addDataPoints", async (req, res) => {
  const { id, label, xCord, yCord, backgroundColor } = req.body;

  if (!id || !label || !xCord || !yCord) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  try {
    const exisitingDataPoint = await findByLabel(label);
    const newBackgroundColor = exisitingDataPoint
      ? exisitingDataPoint.backgroundColor
      : backgroundColor || randomColor();

    const newDataPoint = new FormData({
      id,
      label,
      xCord,
      yCord,
      backgroundColor: newBackgroundColor,
    });

    await newDataPoint.save();
    res
      .status(201)
      .json({ message: "Cords added successfully", cords: newDataPoint });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

router.get("/allDataPoints", async (req, res) => {
  try {
    const groupedData = await FormData.aggregate([
      {
        $group: {
          _id: "$label",
          data: {
            $push: {
              x: "$xCord",
              y: "$yCord",
            },
          },
          id: { $first: "$id" },
          backgroundColor: {
            $first: "$backgroundColor",
          },
        },
      },
    ]);

    const formattedData = groupedData.map((group) => ({
      id: group.id,
      data: group.data,
      label: group._id,
      backgroundColor: group.backgroundColor,
    }));

    res.json(formattedData);
  } catch (error) {
    console.error("Error retrieving data points:", error);
    res.status(500).send("Error retrieving data points");
  }
});

router.put("/updateDataPoints/:id", async (req, res) => {
  const { label, xCord, yCord } = req.body;

  try {
    const exisitingDataPoint = await FormData.findOne({ id: req.params.id });

    if (!exisitingDataPoint) {
      return res.status(404).json({ message: "Data point not found" });
    }

    const exisitingDataLabel = await findByLabel(label);

    const newBackgroundColor = exisitingDataLabel
      ? exisitingDataLabel?.backgroundColor
      : randomColor();

    const updatedDataPoint = await FormData.findOneAndUpdate(
      { id: req.params.id },
      { label, xCord, yCord, backgroundColor: newBackgroundColor },
      { new: true },
    );

    res.json({
      message: "Data point updated successfully",
      cords: updatedDataPoint,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

router.delete("/deleteDataPoint/:id", async (req, res) => {
  try {
    const deletedDataPoint = await FormData.findOneAndDelete({
      id: req.params.id,
    });

    if (!deletedDataPoint) {
      return res.status(404).json({ message: "Data point not found" });
    }

    res.json({
      message: "Data point deleted successfully",
      cords: deletedDataPoint,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

module.exports = router;
