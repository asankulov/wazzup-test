const faker = require("faker");
const httpMocks = require("node-mocks-http");

const isAuthenticated = require("../../src/api/middlewares/isAuthenticated");
const jwtHelper = require("../../src/helpers/jwt");

describe("Is Authenticated middleware", () => {
  const nextMock = jest.fn();
  const getCorrectReqMock = jest.fn(() => {
    return httpMocks.createRequest({
      headers: {
        authorization: `Bearer ${faker.random.uuid()}`,
      },
    });
  });
  const getResMock = jest.fn(() => httpMocks.createResponse());

  describe("Positive cases", () => {
    beforeAll(() => {
      Object.assign(jwtHelper, {
        verifyToken: jest
          .fn()
          .mockResolvedValueOnce({ userId: faker.random.number({ min: 0 }) }),
      });
    });

    it("should call next", async () => {
      await isAuthenticated(getCorrectReqMock(), getResMock(), nextMock);

      expect(nextMock).toBeCalledTimes(1);
      expect(jwtHelper.verifyToken).toBeCalledTimes(1);
    });

    afterAll(() => {
      jwtHelper.verifyToken.mockRestore();
    });
  });

  describe("Wrong cases", () => {
    beforeAll(() => {
      Object.assign(jwtHelper, {
        verifyToken: jest.fn().mockRejectedValueOnce("Some Error."),
      });
    });

    it("should return 401", async () => {
      const response = await isAuthenticated(
        httpMocks.createRequest(),
        getResMock(),
        nextMock
      );

      expect(response.statusCode).toBe(401);
      expect(nextMock).not.toBeCalled();
      expect(jwtHelper.verifyToken).not.toBeCalled();
    });

    it("should return 400", async () => {
      const response = await isAuthenticated(
        getCorrectReqMock(),
        getResMock(),
        nextMock
      );

      expect(response.statusCode).toBe(400);
      expect(nextMock).not.toBeCalled();
      expect(jwtHelper.verifyToken).toBeCalledTimes(1);
    });

    afterEach(() => {
      jwtHelper.verifyToken.mockClear();
    });

    afterAll(() => {
      jwtHelper.verifyToken.mockRestore();
    });
  });

  afterEach(() => {
    nextMock.mockClear();
  });
});
