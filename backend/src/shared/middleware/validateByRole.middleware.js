// shared/middleware/dynamicValidator.js
const AppError = require("../utils/AppError");

const validateByRole = (schemaMap) => {
  return (req, res, next) => {
    const { role } = req.body;

    const schema = schemaMap[role];
    if (!schema) {
      return next(
        new AppError(
          "Invalid or unsupported role.",
          400,
          "VALIDATION_ERROR",
          {
            en: `Role must be one of: ${Object.keys(schemaMap).join(", ")}`,
            ar: "الدور المقدم غير صالح."
          }
        )
      );
    }

    const validationResult = schema.safeParse(req.body);

    if (!validationResult.success) {
      const details = validationResult.error.issues.map(issue => ({
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

    req.body = validationResult.data;
    next();
  };
};

module.exports = validateByRole;