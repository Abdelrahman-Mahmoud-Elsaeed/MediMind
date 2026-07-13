const validate = (schema) => (req, res, next) => {
  try {
    // Validate the request body, query, and params
    const result = schema.safeParse({
      body: req.body,
      query: req.query,
      params: req.params
    });

    if (!result.success) {
      console.log('Validation Error:', JSON.stringify(result.error.issues, null, 2));
      console.log('Request Body:', req.body);

      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: result.error.issues[0]?.message || 'Validation failed',
          details: result.error.issues
        }
      });
    }

    // Attach validated data to request
    req.body = result.data.body || req.body;
    req.query = result.data.query || req.query;
    req.params = result.data.params || req.params;

    next();
  } catch (error) {
    console.error('Validation middleware error:', error);
    return res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'Internal server error during validation'
      }
    });
  }
};

module.exports = validate;