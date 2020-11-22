const faker = require("faker");

const noteService = require("../../src/services/note");
const models = require("../../src/models");

jest.mock("../../src/models");

describe("Note Service", () => {
  const testUserId = faker.random.number({
    min: 1,
  });
  const testNoteId = faker.random.number({
    min: 1,
  });
  const testContent = faker.lorem.text();
  const testNoteBody = {
    content: testContent,
  };
  const testSuccessNoteResponse = {
    id: testNoteId,
    content: testContent,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  const testListCount = faker.random.number({ min: 1 });
  const testPageSize = 10;
  const testSuccessNoteListResponse = {
    notesList: [testSuccessNoteResponse],
    pagination: {
      pageSize: testPageSize,
      pages: Math.ceil(testListCount / testPageSize),
    },
  };

  describe("upsert note", () => {
    describe("insert new note", () => {
      beforeAll(() => {
        Object.assign(models.Note, {
          create: jest.fn().mockResolvedValueOnce({
            toJSON: () => testSuccessNoteResponse,
          }),
        });
      });

      it("should insert new note", () => {
        return expect(
          noteService.upsertNote(testUserId, testNoteBody)
        ).resolves.toEqual(testSuccessNoteResponse);
      });

      afterAll(() => {
        models.Note.create.mockRestore();
      });
    });

    describe("update note", () => {
      beforeAll(() => {
        Object.assign(models.Note, {
          findOne: jest
            .fn()
            .mockResolvedValueOnce({
              toJSON: () => testSuccessNoteResponse,
              set: jest.fn(),
              save: jest.fn(),
            })
            .mockResolvedValueOnce(null),
        });
      });

      it("should update note by id", () => {
        return expect(
          noteService.upsertNote(testUserId, testNoteBody, testNoteId)
        ).resolves.toEqual(testSuccessNoteResponse);
      });

      it("should rejects", () => {
        return expect(
          noteService.upsertNote(testUserId, testNoteBody, testNoteId)
        ).rejects.toBe("Note not found.");
      });

      afterAll(() => {
        models.Note.findOne.mockRestore();
      });
    });
  });

  describe("fetch multiple notes", () => {
    beforeAll(() => {
      Object.assign(models.Note, {
        findAll: jest.fn().mockResolvedValueOnce([testSuccessNoteResponse]),
        count: jest.fn().mockResolvedValueOnce(testListCount),
      });
    });

    it("should return multiple notes", () => {
      return expect(
        noteService.fetchMultipleNotes(testUserId)
      ).resolves.toEqual(testSuccessNoteListResponse);
    });

    afterAll(() => {
      models.Note.findAll.mockRestore();
    });
  });

  describe("fetch single note by id", () => {
    beforeAll(() => {
      Object.assign(models.Note, {
        findOne: jest.fn().mockResolvedValueOnce({
          toJSON: jest.fn().mockReturnValueOnce(testSuccessNoteResponse),
        }),
      });
    });

    it("should return single note", () => {
      return expect(
        noteService.fetchSingleNoteById(testUserId, testNoteId)
      ).resolves.toEqual(testSuccessNoteResponse);
    });

    afterAll(() => {
      models.Note.findOne.mockRestore();
    });
  });

  describe("delete note by id", () => {
    beforeAll(() => {
      Object.assign(models.Note, {
        findOne: jest
          .fn()
          .mockResolvedValueOnce({
            destroy: jest.fn(),
          })
          .mockResolvedValueOnce(null),
      });
    });

    it("should delete single note", () => {
      return expect(
        noteService.deleteNoteById(testUserId, testNoteId)
      ).resolves.not.toThrow();
    });

    it("should rejects", () => {
      return expect(
        noteService.deleteNoteById(testUserId, testNoteId)
      ).rejects.toBe("Note not found.");
    });

    afterAll(() => {
      models.Note.findOne.mockRestore();
    });
  });

  describe("share note by id", () => {
    beforeAll(() => {
      Object.assign(models.Note, {
        findOne: jest
          .fn()
          .mockResolvedValueOnce({
            set: jest.fn(),
            save: jest.fn(),
          })
          .mockResolvedValueOnce(null),
      });
    });

    it("should set isShared field to true", () => {
      return expect(
        noteService.shareNoteById(testUserId, testNoteId)
      ).resolves.not.toThrow();
    });

    it("should rejects", () => {
      return expect(
        noteService.shareNoteById(testUserId, testNoteId)
      ).rejects.toBe("Note not found.");
    });

    afterAll(() => {
      models.Note.findOne.mockRestore();
    });
  });

  describe("fetch shared note by id", () => {
    beforeAll(() => {
      Object.assign(models.Note, {
        findOne: jest.fn().mockResolvedValueOnce({
          toJSON: jest.fn().mockReturnValueOnce(testNoteBody),
        }),
      });
    });

    it("should fetch shared note by id", () => {
      return expect(
        noteService.fetchSharedNoteById(testNoteId)
      ).resolves.toEqual(testNoteBody);
    });

    it("should rejects", () => {
      return expect(noteService.fetchSharedNoteById(testNoteId)).rejects.toBe(
        "Note not found."
      );
    });

    afterAll(() => {
      models.Note.findOne.mockRestore();
    });
  });
});
