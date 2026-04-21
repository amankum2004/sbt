-- Make phone required and email optional for contact form submissions.

ALTER TABLE "Contact"
ADD COLUMN IF NOT EXISTS "phone" TEXT NOT NULL DEFAULT '';

ALTER TABLE "Contact"
ALTER COLUMN "email" DROP NOT NULL;

ALTER TABLE "Contact"
ALTER COLUMN "phone" DROP DEFAULT;
