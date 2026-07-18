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

      return res.status(400).json({
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message: `Validation failed: ${dynamicDetailsString}`,
          messages: {
            en: `Validation failed on: ${dynamicDetailsString}`,
            ar: `فشل التحقق من البيانات في الأقسام التالية: ${dynamicDetailsString}`
          },
          details
        }
      });
    }

    req.body = validationResult.data;
    next();
  };
};

module.exports = validateByRole;