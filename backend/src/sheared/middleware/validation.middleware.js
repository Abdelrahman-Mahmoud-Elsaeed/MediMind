const { ZodError } = require("zod");

const validate = (schema) => (req, res, next) => {
  try {
    req.body = schema.parse(req.body);
    next();
  } catch (error) {
    if (error instanceof ZodError) {
      return res.status(400).json({
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message: "Validation failed",
          details: error.issues.map(issue => ({
            field: issue.path.join("."),
            message: issue.message
          }))
        }
      });
    }

    next(error);
  }
};

module.exports = validate