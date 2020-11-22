const faker = require("faker");
const models = require("../../src/models");
const authService = require("../../src/services/auth");
const jwtHelper = require("../../src/helpers/jwt");

jest.mock("../../src/models");
jest.mock("../../src/helpers/jwt");

describe("Auth Service", () => {
  const testUserId = faker.random.number({
    min: 1,
  });
  const testUsername = faker.internet.userName();
  const testNewUserBody = {
    username: testUsername,
    password: faker.internet.password(),
  };
  const testUser = {
    userId: testUserId,
    username: testUsername,
  };
  const testAccessToken = faker.random.uuid();
  const testTokenResponse = {
    accessToken: testAccessToken,
  };

  describe("create new user", () => {
    beforeAll(() => {
      Object.assign(models.User, {
        findOne: jest
          .fn()
          .mockResolvedValueOnce(null)
          .mockResolvedValueOnce(testUser),
        create: jest.fn().mockResolvedValueOnce({
          get: (key) => testUser[key],
        }),
      });
      Object.assign(models.Session, {
        create: jest.fn().mockResolvedValueOnce({
          get: (key) => testTokenResponse[key],
        }),
      });
      jwtHelper.generateNewToken = jest
        .fn()
        .mockResolvedValueOnce(testAccessToken);
      Object.assign(models.sequelize, {
        transaction: () => ({
          commit: jest.fn(),
          rollback: jest.fn(),
        }),
      });
    });

    it("should create new user", () => {
      return expect(
        authService.createNewUser(testNewUserBody)
      ).resolves.toEqual(testTokenResponse);
    });

    it("should raise error", () => {
      return expect(authService.createNewUser(testNewUserBody)).rejects.toEqual(
        "Username has already taken."
      );
    });

    afterAll(() => {
      models.User.findOne.mockRestore();
      models.User.create.mockRestore();
      models.Session.create.mockRestore();
      jwtHelper.generateNewToken.mockRestore();
      models.sequelize.transaction.mockRestore();
    });
  });

  describe("process login", () => {
    beforeAll(() => {
      Object.assign(models.User, {
        findOne: jest
          .fn()
          .mockResolvedValueOnce(null)
          .mockResolvedValueOnce({
            comparePassword: (attempt) => Promise.resolve(false),
          })
          .mockResolvedValueOnce({
            comparePassword: (attempt) => Promise.resolve(true),
            get: (key) => testUser[key],
          }),
      });
      Object.assign(models.Session, {
        create: jest.fn().mockResolvedValueOnce({
          get: (key) => testTokenResponse[key],
        }),
      });
      jwtHelper.generateNewToken = jest
        .fn()
        .mockResolvedValueOnce(testAccessToken);
    });

    it("should raise error because of invalid username", () => {
      return expect(authService.processLogin(testNewUserBody)).rejects.toEqual(
        "Invalid username/password."
      );
    });

    it("should raise error because of invalid password", () => {
      return expect(authService.processLogin(testNewUserBody)).rejects.toEqual(
        "Invalid username/password."
      );
    });

    it("should return new token pair", () => {
      return expect(authService.processLogin(testNewUserBody)).resolves.toEqual(
        testTokenResponse
      );
    });

    afterAll(() => {
      models.User.findOne.mockRestore();
      models.Session.create.mockRestore();
      jwtHelper.generateNewToken.mockRestore();
    });
  });

  describe("process logout", () => {
    beforeAll(() => {
      Object.assign(models.Session, {
        destroy: jest.fn().mockResolvedValueOnce(1).mockResolvedValueOnce(0),
      });
    });

    it("should revoke token pair", () => {
      return expect(
        authService.revokeTokenByUserId(testUserId)
      ).resolves.toBeTruthy();
    });

    it("should rejects because of already revoked token", () => {
      return expect(
        authService.revokeTokenByUserId(testUserId)
      ).resolves.toBeFalsy();
    });

    afterAll(() => {
      models.Session.destroy.mockRestore();
    });
  });
});
