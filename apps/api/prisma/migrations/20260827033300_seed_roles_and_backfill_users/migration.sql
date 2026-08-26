-- Seed the base roles. Idempotent so it is safe to re-run.
INSERT INTO "Role" ("id", "key", "label", "no", "createdAt", "updatedAt")
VALUES
  (gen_random_uuid()::text, 'user', 'User', 0, NOW(), NOW()),
  (gen_random_uuid()::text, 'artist', 'Artist', 1, NOW(), NOW()),
  (gen_random_uuid()::text, 'admin', 'Admin', 2, NOW(), NOW())
ON CONFLICT ("key") DO NOTHING;

-- Every existing user keeps working, with the baseline 'user' role.
INSERT INTO "UserRole" ("id", "userId", "roleId", "createdAt")
SELECT gen_random_uuid()::text, u."id", r."id", NOW()
FROM "User" u
CROSS JOIN "Role" r
WHERE r."key" = 'user'
ON CONFLICT ("userId", "roleId") DO NOTHING;

-- Preserve the existing admin, previously identified only by the
-- SystemParameters 'admin.email' value.
INSERT INTO "UserRole" ("id", "userId", "roleId", "createdAt")
SELECT gen_random_uuid()::text, u."id", r."id", NOW()
FROM "User" u
JOIN "Role" r ON r."key" = 'admin'
JOIN "SystemParameters" sp
  ON sp."type" = 'admin.email'
 AND sp."scope" = 'ALL'
WHERE LOWER(u."email") = LOWER(sp."value")
ON CONFLICT ("userId", "roleId") DO NOTHING;

-- The admin is also the artist on a single-artist deployment, so they keep
-- the ability to own commissions, openings and projects.
INSERT INTO "UserRole" ("id", "userId", "roleId", "createdAt")
SELECT gen_random_uuid()::text, u."id", r."id", NOW()
FROM "User" u
JOIN "Role" r ON r."key" = 'artist'
JOIN "SystemParameters" sp
  ON sp."type" = 'admin.email'
 AND sp."scope" = 'ALL'
WHERE LOWER(u."email") = LOWER(sp."value")
ON CONFLICT ("userId", "roleId") DO NOTHING;
