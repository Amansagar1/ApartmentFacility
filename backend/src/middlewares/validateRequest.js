// ----------------Generic Zod Validation Middleware------------
const validateRequest = (schema) => (req, res, next) => {
  try {
    schema.parse({
      body: req.body,
      query: req.query,
      params: req.params,
    });
    next();
  } catch (error) {
    next(error); // Passes the ZodError to our globalErrorHandler
  }
};

module.exports = validateRequest;
