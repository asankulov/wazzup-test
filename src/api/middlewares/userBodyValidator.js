const { validationResult, body } = require("express-validator");

module.exports = async (req, res, next) => {
  await body("username")
    .notEmpty()
    .isString()
    .trim()
    .if((value) => /^\w+\.?\w+$/gm.test(value))
    .withMessage("Parameter missed")
    .run(req);

  await body("password")
    .notEmpty()
    .isString()
    .trim()
    .withMessage("Parameter missed")
    .run(req);

  const result = validationResult(req);
  if (!result.isEmpty()) {
    return res.status(400).json({
      errors: result.array().map((err) => ({ [err.param]: err.msg })),
    });
  }

  next();
};
