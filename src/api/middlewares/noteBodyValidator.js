const { validationResult, body } = require("express-validator");

module.exports = async (req, res, next) => {
  await body("content")
    .notEmpty()
    .isString()
    .trim()
    .withMessage("Field missed")
    .run(req);

  const result = validationResult(req);

  if (!result.isEmpty()) {
    return res.status(400).json({
      errors: result
        .array()
        .slice(0, 1)
        .map((err) => ({ [err.param]: err.msg })),
    });
  }

  next();
};
