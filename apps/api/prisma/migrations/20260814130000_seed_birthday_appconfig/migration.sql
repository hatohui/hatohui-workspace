-- Guarantees the birthday-reminder AppConfig rows exist after every deploy,
-- independent of whether the separate seed script is ever run. ON CONFLICT DO
-- NOTHING so a value already edited in the database is never overwritten.
INSERT INTO "AppConfig" (id, type, scope, value, "updatedAt") VALUES
  ('bdaycfg_reminderdays', 'friends.birthday.reminderdays', 'FRIENDS', '7', now()),
  ('bdaycfg_dailysendcap', 'friends.birthday.dailysendcap', 'FRIENDS', '250', now()),
  ('bdaycfg_senderemail', 'friends.birthday.senderemail', 'FRIENDS', 'noreply@hatohui.com', now()),
  ('bdaycfg_sendername', 'friends.birthday.sendername', 'FRIENDS', 'Friends - Hatohui Notifications', now()),
  ('bdaycfg_avatarurl', 'friends.birthday.avatarurl', 'FRIENDS', 'https://assets.hatohui.com/assets/wqee.jpg', now())
ON CONFLICT ("type", "scope") DO NOTHING;
