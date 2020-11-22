const faker = require("faker");
const httpMocks = require("node-mocks-http");

const authController = require("../../src/api/controllers/auth");
const authService = require("../../src/services/auth");

jest.mock("../../src/services/auth");

describe("Auth Controller", () => {
  const testAccessToken = faker.random.uuid();
  const testTokenResponse = {
    accessToken: testAccessToken,
  };
  const testUsername = faker.internet.userName();
  const testUserUserId = faker.random.number({
    min: 1,
  });
  const testRequestUserBody = {
    username: testUsername,
    password: faker.internet.password(),
  };

  const getResMock = jest.fn(() => httpMocks.createResponse());

  describe("sign up user", () => {
    beforeAll(() => {
      Object.assign(authService, {
        createNewUser: jest
          .fn()
          .mockRejectedValueOnce("Username has already taken.")
          .mockResolvedValueOnce(testTokenResponse),
      });
    });

    const getReqMock = jest.fn(() => {
      return httpMocks.createRequest({
        body: testRequestUserBody,
      });
    });

    it("should return 400", async () => {
      const response = await authController.signUp(getReqMock(), getResMock());

      expect(response.statusCode).toBe(400);
      expect(response._getJSONData()).toHaveProperty("message");
      expect(authService.createNewUser).toBeCalledTimes(1);
      expect(authService.createNewUser).toBeCalledWith(testRequestUserBody);
    });

    it("should return 201 with token pair", async () => {
      const response = await authController.signUp(getReqMock(), getResMock());

      expect(response.statusCode).toBe(201);
      expect(response._getJSONData()).toEqual(testTokenResponse);
      expect(authService.createNewUser).toBeCalledTimes(1);
      expect(authService.createNewUser).toBeCalledWith(testRequestUserBody);
    });

    afterEach(() => {
      authService.createNewUser.mockClear();
    });

    afterAll(() => {
      authService.createNewUser.mockRestore();
    });
  });

  describe("sign in user", () => {
    beforeAll(() => {
      Object.assign(authService, {
        processLogin: jest
          .fn()
          .mockRejectedValueOnce("Invalid username/password.")
          .mockResolvedValueOnce(testTokenResponse),
      });
    });

    const getReqMock = jest.fn(() => {
      return httpMocks.createRequest({
        body: testRequestUserBody,
      });
    });

    it("should return 400", async () => {
      const response = await authController.signIn(getReqMock(), getResMock());

      expect(response.statusCode).toBe(400);
      expect(response._getJSONData()).toHaveProperty("message");
      expect(authService.processLogin).toBeCalledTimes(1);
      expect(authService.processLogin).toBeCalledWith(testRequestUserBody);
    });

    it("should return 200 with token pair", async () => {
      const response = await authController.signIn(getReqMock(), getResMock());

      expect(response.statusCode).toBe(200);
      expect(response._getJSONData()).toEqual(testTokenResponse);
      expect(authService.processLogin).toBeCalledTimes(1);
      expect(authService.processLogin).toBeCalledWith(testRequestUserBody);
    });

    afterEach(() => {
      authService.processLogin.mockClear();
    });

    afterAll(() => {
      authService.processLogin.mockRestore();
    });
  });

  describe("sign out user", () => {
    beforeAll(() => {
      Object.assign(authService, {
        revokeTokenByUserId: jest
          .fn()
          .mockResolvedValueOnce(false)
          .mockResolvedValueOnce(true),
      });
    });
    const getReqMock = jest.fn(() => {
      return httpMocks.createRequest({
        user: {
          userId: testUserUserId,
        },
      });
    });

    it("should return 400", async () => {
      const response = await authController.signOut(getReqMock(), getResMock());

      expect(response.statusCode).toBe(400);
      expect(response._getJSONData()).toHaveProperty("message");
      expect(authService.revokeTokenByUserId).toBeCalledTimes(1);
      expect(authService.revokeTokenByUserId).toBeCalledWith(testUserUserId);
    });

    it("should return 200", async () => {
      const response = await authController.signOut(getReqMock(), getResMock());

      expect(response.statusCode).toBe(200);
      expect(authService.revokeTokenByUserId).toBeCalledTimes(1);
      expect(authService.revokeTokenByUserId).toBeCalledWith(testUserUserId);
    });

    afterEach(() => {
      authService.revokeTokenByUserId.mockClear();
    });

    afterAll(() => {
      authService.revokeTokenByUserId.mockRestore();
    });
  });
});
