# API features

Technical features shared by every app. User-facing features are in each app's `features.md`.

| Feature          | Sub-features                                                                                                                                       | Spec                                                           |
| ---------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------- |
| Authentication   | • Google sign-in<br>• Session management<br>• Logout                                                                                               |                                                                |
| Authorization    | • Roles: user, artist, admin<br>• Admin key<br>• Cron key                                                                                          |                                                                |
| Admin API        | • Users<br>• Profiles<br>• System parameters                                                                                                       |                                                                |
| User settings    | • Per-user overrides<br>• App-wide defaults                                                                                                        | [spec](../../docs/specs/api/user-settings/PRD.md)              |
| Asset management | • Signed upload<br>• Batch signed upload<br>• Upload limits<br>• Thumbnail generation<br>• Stored-file deletion                                    | [spec](../../docs/specs/art/storage-layout/README.md)          |
| Process queue    | • Thumbnail jobs<br>• Storage delete jobs<br>• Notification email jobs<br>• Retry with backoff                                                     | [spec](../../docs/specs/api/process-queue/README.md)           |
| Scheduled jobs   | • Birthday reminder evaluation (hourly)<br>• Birthday reminder sending (hourly)<br>• Reminder cleanup (daily)<br>• Queue processing (every 15 min) | [spec](../../docs/specs/friends/birthday-notifications/PRD.md) |
| Email            | • Template emails<br>• HTML emails<br>• Email outbox<br>• Notification emails                                                                      | [spec](../../docs/specs/api/notification-emails/PRD.md)        |
| Rate limiting    | • Passcode attempts<br>• Image upload signing                                                                                                      | [spec](../../docs/specs/art/queue-passcodes/README.md)         |
| Caching          | • Redis read-through cache                                                                                                                         |                                                                |
| API docs         | • Scalar reference at `/docs`<br>• OpenAPI export<br>• Generated TypeScript client                                                                 |                                                                |
| Health check     | • `GET /health`                                                                                                                                    |                                                                |
