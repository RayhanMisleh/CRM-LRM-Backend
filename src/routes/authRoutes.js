const express = require("express");
const sessionController = require("../controllers/sessionController");
const auth = require("../middlewares/auth");

const router = express.Router();

router.post(
  "/signup",
  sessionController.signUp.bind(sessionController)
);


router.post(
  "/login",
  sessionController.login.bind(sessionController)
);

router.post("/logout", auth, sessionController.logout.bind(sessionController));

module.exports = router;
