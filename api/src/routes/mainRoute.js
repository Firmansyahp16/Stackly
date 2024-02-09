const express = require("express");
const router = express.Router();

const productRoute = require("./productRoute");
const logRoute = require("./logRoute");
const authRoute = require("./authRoute");
const authMiddleware = require("../middlewares/authMiddleware");

router.get("/", (req, res) => {
  res.send("Stackly API Connected");
});

router.use("/auth", authRoute);

router.use(authMiddleware.isLoggedIn);

router.use("/product", productRoute);
router.use("/log", logRoute);

module.exports = router;
