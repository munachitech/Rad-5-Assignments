// Checks req.body against a Zod schema before the controller runs
export const validate = (schema) => (req, res, next) => {
  const result = schema.safeParse(req.body);

  if (!result.success) {
    const errors = result.error.issues.map((issue) => issue.message);
    return res.status(400).json({ error: "Validation failed", details: errors });
  }

  req.body = result.data; // cleaned data
  next();
};

// Makes sure /:id in the URL is a number
export const checkId = (req, res, next) => {
  if (!Number.isInteger(Number(req.params.id))) {
    return res.status(400).json({ error: "ID must be a number" });
  }
  next();
};
