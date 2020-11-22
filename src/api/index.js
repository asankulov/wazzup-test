const router = require("express").Router();

const noteRoutes = require("./routes/note");
const authRoutes = require("./routes/auth");

router.use("/auth", authRoutes);
router.use("/note", noteRoutes);

module.exports = router;
