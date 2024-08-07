const express = require("express");
const router = express.Router();
const {
  registerController,
  loginController,
  logoutController,
  refetchController,
} = require("../controllers/authController");

router.post("/register", registerController);
router.post("/login", loginController);
router.get("/logout", logoutController);
router.get("/refetch", refetchController);

module.exports = router;
