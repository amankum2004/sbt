-- Align PostgreSQL tables with the current phone-first Prisma schema.

-- User email is now optional.
ALTER TABLE "User"
ALTER COLUMN "email" DROP NOT NULL;

-- OTP records are now phone-first, while keeping optional email support.
ALTER TABLE "OTP"
ADD COLUMN IF NOT EXISTS "phone" TEXT NOT NULL DEFAULT '';

ALTER TABLE "OTP"
ALTER COLUMN "email" DROP NOT NULL;

CREATE INDEX IF NOT EXISTS "OTP_phone_idx" ON "OTP"("phone");

-- Shop email is optional and owner phone is used as the primary owner identifier.
ALTER TABLE "Shop"
ALTER COLUMN "email" DROP NOT NULL;

ALTER TABLE "Shop"
ADD COLUMN IF NOT EXISTS "ownerPhone" TEXT;

WITH unique_shop_phones AS (
  SELECT "phone"
  FROM "Shop"
  WHERE "phone" IS NOT NULL
  GROUP BY "phone"
  HAVING COUNT(*) = 1
)
UPDATE "Shop" AS s
SET "ownerPhone" = s."phone"
FROM unique_shop_phones AS u
WHERE s."ownerPhone" IS NULL
  AND s."phone" = u."phone";

CREATE UNIQUE INDEX IF NOT EXISTS "Shop_ownerPhone_key" ON "Shop"("ownerPhone");

-- Appointments may now be booked with phone-only details.
ALTER TABLE "Appointment"
ALTER COLUMN "customerEmail" DROP NOT NULL;

ALTER TABLE "Appointment"
ADD COLUMN IF NOT EXISTS "customerPhone" TEXT;

UPDATE "Appointment" AS a
SET "customerPhone" = u."phone"
FROM "User" AS u
WHERE a."customerPhone" IS NULL
  AND a."userId" = u."id";

CREATE INDEX IF NOT EXISTS "Appointment_customerPhone_idx" ON "Appointment"("customerPhone");
