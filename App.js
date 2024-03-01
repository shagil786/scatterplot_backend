const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const morgan = require("morgan");
const cors = require("cors");
const datapoints = require("./routes/datapoints");

const app = express();
const port = 3001;
require("dotenv/config");

app.use(cors());
app.options("*", cors());

// Middlewares
app.use(bodyParser.json({ limit: "50mb" }));
app.use(bodyParser.urlencoded({ extended: true, limi: "50mb" }));
app.use(morgan("tiny"));

const api = process.env.API_URL;
app.use(`${api}/v1`, datapoints);

const dbConfig = require("./config/database.config");
mongoose.Promise = global.Promise;

mongoose
  .connect(dbConfig.url, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("Successfully connected to the database");
  })
  .catch((err) => {
    console.log("Could not connect to the database. Exiting now...", err);
    process.exit();
  });

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
