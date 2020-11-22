const noteService = require("../../services/note");

module.exports = {
  async createNewNote(req, res) {
    try {
      const newNoteData = await noteService.upsertNote(
        req.user.userId,
        req.body
      );

      return res.status(201).json(newNoteData);
    } catch (error) {
      throw error;
    }
  },
  async listNotes(req, res) {
    try {
      const data = await noteService.fetchMultipleNotes(
        req.user.userId,
        req.query.pageSize || 10,
        req.query.page || 1
      );

      return res.status(200).json(data);
    } catch (error) {
      throw error;
    }
  },
  async retrieveNote(req, res) {
    try {
      const noteData = await noteService.fetchSingleNoteById(
        req.user.userId,
        req.params.id
      );

      return res.status(200).json(noteData);
    } catch (error) {
      if (error === "Note not found.") {
        return res.status(404).json({
          message: "Note not found.",
        });
      }

      throw error;
    }
  },
  async updateNote(req, res) {
    try {
      const updatedNote = await noteService.upsertNote(
        req.user.userId,
        req.body,
        req.params.id
      );

      return res.status(200).json(updatedNote);
    } catch (error) {
      if (error === "Note not found.") {
        return res.status(404).json({
          message: "Note not found.",
        });
      }

      throw error;
    }
  },
  async deleteNote(req, res) {
    try {
      await noteService.deleteNoteById(req.user.userId, req.params.id);

      return res.sendStatus(204);
    } catch (error) {
      if (error === "Note not found.") {
        return res.status(404).json({
          message: "Note not found.",
        });
      }

      throw error;
    }
  },
  async shareNote(req, res) {
    try {
      await noteService.shareNoteById(req.user.userId, req.params.id);

      return res.sendStatus(200);
    } catch (error) {
      if (error === "Note not found.") {
        return res.status(404).json({
          message: "Note not found.",
        });
      }

      throw error;
    }
  },
  async getSharedNote(req, res) {
    try {
      const noteData = await noteService.fetchSharedNoteById(req.params.id);

      return res.status(200).json(noteData);
    } catch (error) {
      if (error === "Note not found.") {
        return res.status(404).json({
          message: "Note not found.",
        });
      }

      throw error;
    }
  },
};
