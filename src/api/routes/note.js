const router = require("express").Router();

const noteController = require("../controllers/note");
const isAuthenticated = require("../middlewares/isAuthenticated");
const noteBodyValidator = require("../middlewares/noteBodyValidator");
const paginationParamsValidator = require("../middlewares/paginationParamsValidator");

router.post(
  "/",
  isAuthenticated,
  noteBodyValidator,
  noteController.createNewNote
);
router.get(
  "/",
  isAuthenticated,
  paginationParamsValidator,
  noteController.listNotes
);
router.get("/:id", isAuthenticated, noteController.retrieveNote);
router.put(
  "/:id",
  isAuthenticated,
  noteBodyValidator,
  noteController.updateNote
);
router.delete("/:id", isAuthenticated, noteController.deleteNote);

router.put("/shared/:id", isAuthenticated, noteController.shareNote);
router.get("/shared/:id", noteController.getSharedNote);

module.exports = router;
