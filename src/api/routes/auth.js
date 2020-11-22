const router = require("express").Router();

const authController = require("../controllers/auth");
const userBodyValidator = require("../middlewares/userBodyValidator");
const isAuthenticated = require("../middlewares/isAuthenticated");

router.post("/sign-up", userBodyValidator, authController.signUp);
router.post("/sign-in", userBodyValidator, authController.signIn);
router.all("/sign-out", isAuthenticated, authController.signOut);

module.exports = router;
