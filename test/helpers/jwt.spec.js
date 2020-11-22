const faker = require("faker");
const jwt = require("jsonwebtoken");

const { generateNewToken, verifyToken } = require("../../src/helpers/jwt");
const { Session } = require("../../src/models");
jest.mock("../../src/models");

const testToken = faker.random.uuid();
const testPayload = { userId: faker.random.number({ min: 0 }) };

describe("JWT helper", () => {
  describe("generate token", () => {
    beforeAll(() => {
      Object.assign(jwt, {
        sign: jest
          .fn()
          .mockImplementationOnce((payload, secret, options, callback) =>
            callback(false, testToken)
          )
          .mockImplementationOnce((payload, secret, options, callback) =>
            callback(true, null)
          ),
      });
    });

    it("should generate new token", async () => {
      const result = await generateNewToken(testPayload);

      expect(result).toBe(testToken);
      expect(jwt.sign).toBeCalledTimes(1);
    });

    it("should rejects", async () => {
      return expect(generateNewToken(testPayload)).rejects.toBeTruthy();
    });

    afterEach(() => {
      jwt.sign.mockClear();
    });

    afterAll(() => {
      jwt.sign.mockRestore();
    });
  });

  describe("verify token", () => {
    beforeAll(() => {
      Object.assign(jwt, {
        verify: jest
          .fn()
          .mockImplementationOnce((payload, secret, callback) =>
            callback(false, testPayload)
          )
          .mockImplementationOnce((payload, secret, callback) =>
            callback(true, testPayload)
          )
          .mockImplementationOnce((payload, secret, callback) =>
            callback(false, testPayload)
          ),
      });
      Object.assign(Session, {
        findOne: jest
          .fn()
          .mockResolvedValueOnce(true)
          .mockResolvedValueOnce(null),
      });
    });

    it("should resolves decoded", async () => {
      const result = await verifyToken(testToken);

      expect(result).toEqual(testPayload);
      expect(jwt.verify).toBeCalledTimes(1);
      expect(Session.findOne).toBeCalledTimes(1);
    });

    it("should rejects because of jwt error", () => {
      return expect(verifyToken(testToken)).rejects.toBeTruthy();
    });

    it("should rejects because of removed session", () => {
      return expect(verifyToken(testToken)).rejects.toBe("Invalid Token.");
    });

    afterEach(() => {
      jwt.verify.mockClear();
      Session.findOne.mockClear();
    });

    afterAll(() => {
      jwt.verify.mockRestore();
      Session.findOne.mockRestore();
    });
  });
});
