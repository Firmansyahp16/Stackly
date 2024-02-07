const express = require("express");
const router = express.Router();

const productRoute = require("./productRoute");
const logRoute = require("./logRoute");

router.get("/", (req, res) => {
  res.send("Stackly API Connected");
});

router.use("/product", productRoute);
router.use("/log", logRoute);

module.exports = router;
