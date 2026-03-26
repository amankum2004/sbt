-- Update Appointment -> TimeSlot FK to cascade deletes

-- DropForeignKey
ALTER TABLE "Appointment" DROP CONSTRAINT "Appointment_timeSlotId_fkey";

-- AddForeignKey
ALTER TABLE "Appointment" ADD CONSTRAINT "Appointment_timeSlotId_fkey" FOREIGN KEY ("timeSlotId") REFERENCES "TimeSlot"("id") ON DELETE CASCADE ON UPDATE CASCADE;
