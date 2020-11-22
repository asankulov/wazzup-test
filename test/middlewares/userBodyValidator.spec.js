const faker = require("faker");
const httpMocks = require("node-mocks-http");

const userBodyValidator = require("../../src/api/middlewares/userBodyValidator");

describe("User Body Validator", () => {
  const nextMock = jest.fn();

  it("should call next", async () => {
    const req = httpMocks.createRequest({
      body: {
        username: faker.internet.userName(),
        password: faker.internet.password(),
      },
    });

    const res = httpMocks.createResponse();
    await userBodyValidator(req, res, nextMock);

    expect(nextMock).toBeCalledTimes(1);
  });

  it("should return 400", async () => {
    const res = httpMocks.createResponse();

    const response1 = await userBodyValidator(
      httpMocks.createRequest({
        body: {
          username: faker.internet.userName(),
        },
      }),
      res,
      nextMock
    );

    const response2 = await userBodyValidator(
      httpMocks.createRequest({
        body: {
          password: faker.internet.password(),
        },
      }),
      res,
      nextMock
    );

    expect(response1.statusCode).toBe(400);
    expect(response1._isJSON()).toBeTruthy();

    expect(response2.statusCode).toBe(400);
    expect(response2._isJSON()).toBeTruthy();

    expect(nextMock).not.toBeCalled();
  });

  afterEach(() => {
    nextMock.mockClear();
  });
});
