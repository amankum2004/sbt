const {
  loginSchema,
  signupSchema,
  resetPasswordSchema,
  shopSchema,
} = require("../../Server/validators/auth-validator");

describe("auth-validator unit tests", () => {
  it("infers email login contactType and normalizes email", () => {
    const payload = loginSchema.parse({
      email: "USER@Example.COM",
      password: "1234",
    });

    expect(payload.contactType).toBe("email");
    expect(payload.email).toBe("user@example.com");
  });

  it("rejects login when contactType is email but email is missing", () => {
    const result = loginSchema.safeParse({
      contactType: "email",
      password: "1234",
    });

    expect(result.success).toBe(false);
    expect(result.error.issues.some((issue) => issue.message.includes("Email is required"))).toBe(
      true
    );
  });

  it("accepts signup payload with legacy username and maps it to name", () => {
    const payload = signupSchema.parse({
      username: "Legacy User",
      email: "legacy@example.com",
      phone: "9876543210",
      password: "1234",
      otp: "123456",
      usertype: "customer",
    });

    expect(payload.name).toBe("Legacy User");
    expect(payload.usertype).toBe("customer");
  });

  it("rejects reset password payload with invalid OTP format", () => {
    const result = resetPasswordSchema.safeParse({
      email: "person@example.com",
      password: "abcd",
      otp: "12345",
    });

    expect(result.success).toBe(false);
  });

  it("rejects shop payload with invalid coordinates", () => {
    const result = shopSchema.safeParse({
      name: "Shop Owner",
      email: "owner@example.com",
      phone: "9876543210",
      password: "1234",
      shopname: "Salon Hub",
      state: "Delhi",
      district: "New Delhi",
      city: "New Delhi",
      street: "Main Road",
      pin: "110001",
      services: [{ service: "Haircut", price: "200" }],
      lat: 120,
      lng: 200,
    });

    expect(result.success).toBe(false);
  });
});
