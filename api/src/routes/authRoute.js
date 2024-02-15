const express = require("express");
const router = express.Router();
const authMiddleware = require("../middlewares/authMiddleware");

router.post("/login", authMiddleware.authLogin);
router.post("/logout", authMiddleware.authLogout);
router.post("/register", authMiddleware.authRegister);

module.exports = router;
