const validate = require("../../Server/middlewares/validate-middleware");
const { loginSchema } = require("../../Server/validators/auth-validator");

const createMockResponse = () => {
  const res = {
    statusCode: 200,
    body: null,
  };

  res.status = vi.fn((code) => {
    res.statusCode = code;
    return res;
  });

  res.json = vi.fn((payload) => {
    res.body = payload;
    return res;
  });

  return res;
};

describe("validate middleware integration", () => {
  it("passes validated and transformed payload to next()", async () => {
    const req = {
      body: {
        email: "USER@Example.COM",
        password: "1234",
      },
    };
    const res = createMockResponse();
    const next = vi.fn();
    const middleware = validate(loginSchema);

    await middleware(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(req.body.contactType).toBe("email");
    expect(req.body.email).toBe("user@example.com");
    expect(res.status).not.toHaveBeenCalled();
  });

  it("returns 422 and error details when validation fails", async () => {
    const req = {
      body: {
        contactType: "phone",
        password: "1234",
      },
    };
    const res = createMockResponse();
    const next = vi.fn();
    const middleware = validate(loginSchema);

    await middleware(req, res, next);

    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(422);
    expect(res.body.success).toBe(false);
    expect(Array.isArray(res.body.errors)).toBe(true);
    expect(res.body.errors.some((error) => error.path === "phone")).toBe(true);
  });
});
