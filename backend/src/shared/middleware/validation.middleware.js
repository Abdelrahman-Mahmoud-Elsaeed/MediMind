const { ZodError } = require("zod");

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
    next(error);
  }
};

module.exports = validate;