// Using dotenv module for accessing .env variable
require("dotenv").config();

// Importing express module
const express = require("express");
// Importing cors module for enabling fetching data using localhost address
const cors = require("cors");
// Importing pool variable for connecting to database from dbConfig
const pool = require("./configs/dbConfig");

// Creating new express app
const app = express();
// Importing port from .env
const port = process.env.PORT;

// Importing router from mainRoute
const mainRouter = require("./routes/mainRoute");

// Make the app to able to use cors
app.use(cors());
// Make the app to able to parse json
app.use(express.json());
// Make the app to able to obtain data from form-encode
app.use(express.urlencoded({ extended: true }));

// Using the mainRouter
app.use("/", mainRouter);

// Run the app using port and run the connection access to database
app.listen(port, () => {
  // Creating connection to database
  const client = pool.connect();
  // Check the client, If empty then log "DB Not Connected"
  if (!client) {
    console.log("DB Not Connected");
  }
  // Connection to DB created and express app running successfully
  console.log(`Running on port ${port}, DB Connected`);
});
