const { z } = require("zod");

const USER_TYPES = ["customer", "shopOwner", "admin"];
const COORDINATE_SOURCES = ["device_gps", "google_geocode", "manual_update", "fallback"];

const emailSchema = z
  .string({ required_error: "Email is required" })
  .trim()
  .email({ message: "Invalid email address" })
  .max(254, { message: "Email must not exceed 254 characters" })
  .transform((value) => value.toLowerCase());

const optionalEmailSchema = z.preprocess((value) => {
  if (typeof value !== "string") return value;
  const trimmedValue = value.trim();
  return trimmedValue ? trimmedValue : undefined;
}, emailSchema.optional());

const phoneSchema = z
  .string({ required_error: "Phone is required" })
  .trim()
  .regex(/^\d{10}$/, { message: "Phone number must be exactly 10 digits" });

const optionalPhoneSchema = z.preprocess((value) => {
  if (typeof value !== "string") return value;
  const trimmedValue = value.trim();
  return trimmedValue ? trimmedValue : undefined;
}, phoneSchema.optional());

const passwordSchema = z
  .string({ required_error: "Password is required" })
  .trim()
  .min(4, { message: "Password must be at least 4 characters" })
  .max(100, { message: "Password must not exceed 100 characters" });

const otpCodeSchema = z
  .string({ required_error: "OTP is required" })
  .trim()
  .regex(/^\d{6}$/, { message: "OTP must be exactly 6 digits" });

const optionalOtpCodeSchema = z.preprocess((value) => {
  if (typeof value !== "string") return value;
  const trimmedValue = value.trim();
  return trimmedValue ? trimmedValue : undefined;
}, otpCodeSchema.optional());

const nameSchema = z
  .string({ required_error: "Name is required" })
  .trim()
  .min(2, { message: "Name must be at least 2 characters" })
  .max(50, { message: "Name must not exceed 50 characters" });

const userTypeSchema = z.enum(USER_TYPES, {
  required_error: "User type is required",
  invalid_type_error: "Invalid user type",
});

const loginSchema = z
  .object({
    contactType: z.literal("phone").optional(),
    phone: phoneSchema,
    password: passwordSchema,
  })
  .transform((data) => ({
    ...data,
    contactType: "phone",
  }));

const signupSchema = z
  .object({
    name: nameSchema.optional(),
    username: nameSchema.optional(), // backward-compatibility with legacy payloads
    email: optionalEmailSchema,
    phone: phoneSchema,
    password: passwordSchema,
    otp: optionalOtpCodeSchema,
    usertype: userTypeSchema,
  })
  .superRefine((data, ctx) => {
    if (!data.name && !data.username) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["name"],
        message: "Name is required",
      });
    }
  })
  .transform((data) => ({
    ...data,
    name: data.name || data.username,
  }));

const resetPasswordSchema = z.object({
  phone: phoneSchema,
  password: passwordSchema,
  otp: optionalOtpCodeSchema,
});

const otpRequestSchema = z.object({
  phone: phoneSchema,
});

const serviceItemSchema = z.object({
  service: z
    .string({ required_error: "Service name is required" })
    .trim()
    .min(1, { message: "Service name is required" })
    .max(100, { message: "Service name is too long" }),
  price: z
    .union([z.string(), z.number()])
    .transform((value) => String(value).trim())
    .refine((value) => value.length > 0, { message: "Service price is required" }),
});

const shopSchema = z.object({
  name: nameSchema,
  email: optionalEmailSchema,
  phone: phoneSchema,
  ownerPhone: optionalPhoneSchema,
  password: passwordSchema.optional(),
  shopname: z
    .string({ required_error: "Shop name is required" })
    .trim()
    .min(2, { message: "Shop name must be at least 2 characters" })
    .max(100, { message: "Shop name must not exceed 100 characters" }),
  state: z.string({ required_error: "State is required" }).trim().min(1, { message: "State is required" }),
  district: z
    .string({ required_error: "District is required" })
    .trim()
    .min(1, { message: "District is required" }),
  city: z.string({ required_error: "City is required" }).trim().min(1, { message: "City is required" }),
  street: z.string({ required_error: "Street is required" }).trim().min(1, { message: "Street is required" }),
  pin: z
    .string({ required_error: "Pin is required" })
    .trim()
    .regex(/^\d{6}$/, { message: "Pin must be exactly 6 digits" }),
  services: z.union([
    z.array(serviceItemSchema).min(1, { message: "At least one service is required" }),
    z.string().trim().min(2, { message: "Services payload is required" }),
  ]),
  lat: z.coerce
    .number({ invalid_type_error: "Latitude must be a number" })
    .min(-90, { message: "Latitude must be between -90 and 90" })
    .max(90, { message: "Latitude must be between -90 and 90" }),
  lng: z.coerce
    .number({ invalid_type_error: "Longitude must be a number" })
    .min(-180, { message: "Longitude must be between -180 and 180" })
    .max(180, { message: "Longitude must be between -180 and 180" }),
  coordinatesSource: z.enum(COORDINATE_SOURCES).optional(),
});

module.exports = {
  signupSchema,
  loginSchema,
  shopSchema,
  resetPasswordSchema,
  otpRequestSchema,
  emailSchema,
  optionalEmailSchema,
  phoneSchema,
  optionalPhoneSchema,
  passwordSchema,
  otpCodeSchema,
  optionalOtpCodeSchema,
  nameSchema,
};

