const { ZodError } = require("zod");
const AppError = require("../utils/AppError");

const validate = (schema) => (req, res, next) => {
  try {
    req.body = schema.parse(req.body);
    next();
  } catch (error) {
    if (error instanceof ZodError) {
      const details = error.issues.map(issue => ({
        field: issue.path.join("."),
        message: issue.message
      }));

      const dynamicDetailsString = details.map(d => `${d.field}: ${d.message}`).join(", ");
      const appErr = new AppError(
        `Validation failed: ${dynamicDetailsString}`,
        400,
        "VALIDATION_ERROR",
        {
          en: "Validation failed. Please verify your inputs.",
          ar: "فشل التحقق من صحة البيانات. يرجى التحقق من الحقول المدخلة."
        }
      );
      appErr.details = details;
      return next(appErr);
    }
    next(error);
  }
};

module.exports = validate;