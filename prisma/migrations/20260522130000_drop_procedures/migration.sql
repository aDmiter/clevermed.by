-- Legacy procedures replaced by ServiceCategory catalog

ALTER TABLE `Appointment` DROP FOREIGN KEY `Appointment_procedureId_fkey`;
ALTER TABLE `Appointment` DROP COLUMN `procedureId`;

DROP TABLE `DoctorProcedure`;
DROP TABLE `Procedure`;
