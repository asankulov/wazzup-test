const { Note } = require("../models/");

module.exports = {
  async upsertNote(userId, noteData, noteId = false) {
    try {
      if (noteId) {
        const existedNote = await Note.findOne({
          where: {
            id: noteId,
            userId,
          },
          attributes: ["id", "content", "createdAt", "updatedAt"],
        });
        if (!existedNote) return Promise.reject("Note not found.");

        existedNote.set("content", noteData.content);
        await existedNote.save();

        return existedNote.toJSON();
      }

      const newNote = await Note.create(
        {
          userId,
          content: noteData.content,
        },
        {
          returning: ["id", "content", "createdAt", "updatedAt"],
        }
      );

      return newNote.toJSON();
    } catch (error) {
      throw error;
    }
  },
  async fetchMultipleNotes(userId, pageSize = 10, page = 1) {
    try {
      const count = await Note.count({
        where: {
          userId,
        },
      });

      const notesList = await Note.findAll({
        where: {
          userId,
        },
        limit: pageSize,
        offset: pageSize * (page - 1),
        attributes: ["id", "content", "createdAt", "updatedAt"],
      });

      return {
        notesList,
        pagination: {
          pageSize,
          pages: Math.ceil(count / pageSize),
        },
      };
    } catch (error) {
      throw error;
    }
  },
  async fetchSingleNoteById(userId, noteId) {
    try {
      const note = await Note.findOne({
        where: {
          id: noteId,
          userId,
        },
        attributes: ["id", "content", "createdAt", "updatedAt"],
      });
      if (!note) return Promise.reject("Note not found.");

      return note.toJSON();
    } catch (error) {
      throw error;
    }
  },
  async deleteNoteById(userId, noteId) {
    try {
      const note = await Note.findOne({
        where: {
          userId,
          id: noteId,
        },
        attributes: ["id"],
      });
      if (!note) return Promise.reject("Note not found.");

      await note.destroy();
    } catch (error) {
      throw error;
    }
  },
  async shareNoteById(userId, noteId) {
    try {
      const note = await Note.findOne({
        where: {
          id: noteId,
          userId,
        },
        attributes: ["id", "isShared"],
      });
      if (!note) return Promise.reject("Note not found.");

      note.set("isShared", true);
      await note.save();
    } catch (error) {
      throw error;
    }
  },
  async fetchSharedNoteById(noteId) {
    try {
      const note = await Note.findOne({
        where: {
          id: noteId,
          isShared: true,
        },
        attributes: ["content"],
      });
      if (!note) return Promise.reject("Note not found.");

      return note.toJSON();
    } catch (error) {
      throw error;
    }
  },
};
