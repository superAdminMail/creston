-- Rename the company registration field and add the FCA reference number.
ALTER TABLE "site_configuration"
RENAME COLUMN "siteLLC" TO "siteCRN";

ALTER TABLE "site_configuration"
ADD COLUMN "siteFRN" TEXT;
