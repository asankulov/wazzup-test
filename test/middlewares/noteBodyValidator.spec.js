const httpMocks = require("node-mocks-http");
const faker = require("faker");

const noteBodyValidator = require("../../src/api/middlewares/noteBodyValidator");

describe("Note Body Validator", () => {
  const nextMock = jest.fn();
  const getResMock = jest.fn(() => httpMocks.createResponse());

  it("should call next", async () => {
    const req = httpMocks.createRequest({
      body: {
        content: faker.lorem.text(),
      },
    });
    await noteBodyValidator(req, getResMock(), nextMock);

    expect(nextMock).toBeCalledTimes(1);
  });

  it("should return 400", async () => {
    const req = httpMocks.createRequest({
      body: {},
    });
    const response = await noteBodyValidator(req, getResMock(), nextMock);

    expect(response.statusCode).toBe(400);
    expect(response._isJSON()).toBeTruthy();
    expect(nextMock).not.toBeCalled();
  });

  afterEach(() => {
    nextMock.mockClear();
  });
});
