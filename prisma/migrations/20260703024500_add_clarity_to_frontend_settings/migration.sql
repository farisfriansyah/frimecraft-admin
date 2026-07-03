-- Add Microsoft Clarity configuration to frontend settings
ALTER TABLE "frontend_settings"
ADD COLUMN "clarityProjectId" TEXT;
