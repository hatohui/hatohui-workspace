-- Rename AppConfig to SystemParameters (plain rename, preserves all rows/ids).
ALTER TABLE "AppConfig" RENAME TO "SystemParameters";
ALTER TABLE "SystemParameters" RENAME CONSTRAINT "AppConfig_pkey" TO "SystemParameters_pkey";
ALTER INDEX "AppConfig_type_scope_key" RENAME TO "SystemParameters_type_scope_key";
