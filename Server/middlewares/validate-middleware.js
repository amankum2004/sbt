const validate = (schema, source = "body") => async (req, res, next) => {
  try {
    const payload = req[source];
    const parsedPayload = await schema.parseAsync(payload);
    req[source] = parsedPayload;
    next();
  } catch (error) {
    if (error?.name === "ZodError") {
      const issues = error.issues || [];
      const firstIssue = issues[0];

      return res.status(422).json({
        success: false,
        message: firstIssue?.message || "Validation failed",
        errors: issues.map((issue) => ({
          path: Array.isArray(issue.path) ? issue.path.join(".") : "",
          message: issue.message,
        })),
      });
    }

    return next(error);
  }
};

module.exports = validate;
