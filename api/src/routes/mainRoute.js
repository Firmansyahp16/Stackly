const express = require("express");
const router = express.Router();

const productRoute = require("./productRoute");

router.get("/", (req, res) => {
  res.send("Stackly API Connected");
});

router.use("/product", productRoute);

module.exports = router;