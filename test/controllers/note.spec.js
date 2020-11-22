const faker = require("faker");
const httpMocks = require("node-mocks-http");

const noteController = require("../../src/api/controllers/note");
const noteService = require("../../src/services/note");

jest.mock("../../src/services/note");
jest.mock("mime-types");

describe("Note Controller", () => {
  const testContent = faker.lorem.text();
  const testNoteBody = {
    content: testContent,
  };
  const testNoteResponseData = {
    id: faker.random.number({ min: 1 }),
    content: testContent,
    createdAt: new Date().toString(),
    updatedAt: new Date().toString(),
  };
  const testUserId = faker.random.number({ min: 1 });
  const testNoteListResponseData = {
    notesList: [testNoteResponseData],
    pagination: {
      pageSize: faker.random.number({ min: 1 }),
      pages: faker.random.number({ min: 1 }),
    },
  };

  const getResMock = jest.fn(() => httpMocks.createResponse());

  describe("create new note", () => {
    beforeAll(() => {
      Object.assign(noteService, {
        upsertNote: jest.fn().mockResolvedValueOnce(testNoteResponseData),
      });
    });

    const getReqMock = jest.fn(() => {
      return httpMocks.createRequest({
        body: testNoteBody,
        user: {
          userId: testUserId,
        },
      });
    });

    it("should return newly created note data", async () => {
      const response = await noteController.createNewNote(
        getReqMock(),
        getResMock()
      );

      expect(response.statusCode).toBe(201);
      expect(response._getJSONData()).toEqual(testNoteResponseData);
      expect(noteService.upsertNote).toBeCalledTimes(1);
    });

    afterAll(() => {
      noteService.upsertNote.mockRestore();
    });
  });

  describe("list notes", () => {
    beforeAll(() => {
      Object.assign(noteService, {
        fetchMultipleNotes: jest
          .fn()
          .mockResolvedValueOnce(testNoteListResponseData),
      });
    });

    const getReqMock = jest.fn(() => {
      return httpMocks.createRequest({
        user: {
          userId: testUserId,
        },
        query: {
          pageSize: faker.random.number({ min: 1 }),
          page: faker.random.number({ min: 1 }),
        },
      });
    });

    it("should return list of notes", async () => {
      const response = await noteController.listNotes(
        getReqMock(),
        getResMock()
      );

      expect(response.statusCode).toBe(200);
      expect(response._getJSONData()).toEqual(testNoteListResponseData);
      expect(noteService.fetchMultipleNotes).toBeCalledTimes(1);
    });

    afterAll(() => {
      noteService.fetchMultipleNotes.mockRestore();
    });
  });

  describe("retrieve note", () => {
    beforeAll(() => {
      Object.assign(noteService, {
        fetchSingleNoteById: jest
          .fn()
          .mockResolvedValueOnce(testNoteResponseData)
          .mockRejectedValueOnce("Note not found."),
      });
    });

    const getReqMock = jest.fn(() => {
      return httpMocks.createRequest({
        user: {
          userId: testUserId,
        },
        params: {
          id: testNoteResponseData.id,
        },
      });
    });

    it("should return single note data", async () => {
      const response = await noteController.retrieveNote(
        getReqMock(),
        getResMock()
      );

      expect(response.statusCode).toBe(200);
      expect(response._getJSONData()).toEqual(testNoteResponseData);
      expect(noteService.fetchSingleNoteById).toBeCalledTimes(1);
    });

    it("should return 404", async () => {
      const response = await noteController.retrieveNote(
        getReqMock(),
        getResMock()
      );

      expect(response.statusCode).toBe(404);
      expect(response._getJSONData()).toHaveProperty("message");
      expect(noteService.fetchSingleNoteById).toBeCalledTimes(1);
    });

    afterEach(() => {
      noteService.fetchSingleNoteById.mockClear();
    });

    afterAll(() => {
      noteService.fetchSingleNoteById.mockRestore();
    });
  });

  describe("update note", () => {
    beforeAll(() => {
      Object.assign(noteService, {
        upsertNote: jest
          .fn()
          .mockResolvedValueOnce(testNoteResponseData)
          .mockRejectedValueOnce("Note not found."),
      });
    });

    const getReqMock = jest.fn(() => {
      return httpMocks.createRequest({
        body: testNoteBody,
        user: {
          userId: testUserId,
        },
        params: {
          id: testNoteResponseData.id,
        },
      });
    });

    it("should return updated note data", async () => {
      const response = await noteController.updateNote(
        getReqMock(),
        getResMock()
      );

      expect(response.statusCode).toBe(200);
      expect(response._getJSONData()).toEqual(testNoteResponseData);
      expect(noteService.upsertNote).toBeCalledTimes(1);
    });

    it("should return 404", async () => {
      const response = await noteController.updateNote(
        getReqMock(),
        getResMock()
      );

      expect(response.statusCode).toBe(404);
      expect(response._getJSONData()).toHaveProperty("message");
      expect(noteService.upsertNote).toBeCalledTimes(1);
    });

    afterEach(() => {
      noteService.upsertNote.mockClear();
    });

    afterAll(() => {
      noteService.upsertNote.mockRestore();
    });
  });

  describe("delete note", () => {
    beforeAll(() => {
      Object.assign(noteService, {
        deleteNoteById: jest
          .fn()
          .mockResolvedValueOnce(undefined)
          .mockRejectedValueOnce("Note not found."),
      });
    });

    const getReqMock = jest.fn(() => {
      return httpMocks.createRequest({
        user: {
          userId: testUserId,
        },
        params: {
          id: testNoteResponseData.id,
        },
      });
    });

    it("should return 204 with no content", async () => {
      const response = await noteController.deleteNote(
        getReqMock(),
        getResMock()
      );

      expect(response.statusCode).toBe(204);
      expect(noteService.deleteNoteById).toBeCalledTimes(1);
    });

    it("should return 404", async () => {
      const response = await noteController.deleteNote(
        getReqMock(),
        getResMock()
      );

      expect(response.statusCode).toBe(404);
      expect(noteService.deleteNoteById).toBeCalledTimes(1);
    });

    afterEach(() => {
      noteService.deleteNoteById.mockClear();
    });

    afterAll(() => {
      noteService.deleteNoteById.mockRestore();
    });
  });

  describe("share note", () => {
    beforeAll(() => {
      Object.assign(noteService, {
        shareNoteById: jest
          .fn()
          .mockResolvedValueOnce(true)
          .mockRejectedValueOnce("Note not found."),
      });
    });

    const getReqMock = jest.fn(() => {
      return httpMocks.createRequest({
        user: {
          userId: testUserId,
        },
        params: {
          id: testNoteResponseData.id,
        },
      });
    });

    it("should return 200", async () => {
      const response = await noteController.shareNote(
        getReqMock(),
        getResMock()
      );

      expect(response.statusCode).toBe(200);
      expect(noteService.shareNoteById).toBeCalledTimes(1);
    });

    it("should return 404", async () => {
      const response = await noteController.shareNote(
        getReqMock(),
        getResMock()
      );

      expect(response.statusCode).toBe(404);
      expect(noteService.shareNoteById).toBeCalledTimes(1);
    });

    afterEach(() => {
      noteService.shareNoteById.mockClear();
    });

    afterAll(() => {
      noteService.shareNoteById.mockRestore();
    });
  });

  describe("get shared note", () => {
    beforeAll(() => {
      Object.assign(noteService, {
        fetchSharedNoteById: jest
          .fn()
          .mockResolvedValueOnce(testNoteBody)
          .mockRejectedValueOnce("Note not found."),
      });
    });

    const getReqMock = jest.fn(() => {
      return httpMocks.createRequest({
        params: {
          id: testNoteResponseData.id,
        },
      });
    });

    it("should return single note data with 200", async () => {
      const response = await noteController.getSharedNote(
        getReqMock(),
        getResMock()
      );
      expect(response.statusCode).toBe(200);

      expect(response._getJSONData()).toEqual(testNoteBody);
      expect(noteService.fetchSharedNoteById).toBeCalledTimes(1);
    });

    it("should return 404", async () => {
      const response = await noteController.getSharedNote(
        getReqMock(),
        getResMock()
      );

      expect(response.statusCode).toBe(404);
      expect(response._getJSONData()).toHaveProperty("message");
      expect(noteService.fetchSharedNoteById).toBeCalledTimes(1);
    });

    afterEach(() => {
      noteService.fetchSharedNoteById.mockClear();
    });

    afterAll(() => {
      noteService.fetchSharedNoteById.mockRestore();
    });
  });
});
