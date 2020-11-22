const faker = require("faker");
const httpMocks = require("node-mocks-http");

const paginationParamsValidator = require("../../src/api/middlewares/paginationParamsValidator");

describe("List Notes Query Params Validator", () => {
  const nextMock = jest.fn();
  const res = httpMocks.createResponse();

  it("should call next", async () => {
    const req = httpMocks.createRequest({
      query: {
        page: faker.random.number({
          min: 1,
        }),
        pageSize: faker.random.number({
          min: 1,
        }),
      },
    });

    await paginationParamsValidator(req, res, nextMock);
    await paginationParamsValidator(httpMocks.createRequest(), res, nextMock);

    expect(nextMock).toBeCalledTimes(2);
  });

  it("should return 400", async () => {
    const req = httpMocks.createRequest({
      query: {
        page: faker.random.number(0),
      },
    });
    const response1 = await paginationParamsValidator(req, res, nextMock);
    const response2 = await paginationParamsValidator(
      httpMocks.createRequest({
        query: {
          pageSize: faker.random.word(),
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
