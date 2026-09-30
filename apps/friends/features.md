# Friends features

A private birthday tracker and social-circle CRM.

| Feature            | Sub-features                                                                                                                                                                   | Spec                                                              |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------- |
| Friend directory   | • Add, edit and delete a friend<br>• Search<br>• Group by month, age or year<br>• Sort ascending or descending<br>• Social handles<br>• Per-entry visibility<br>• Add yourself | [spec](../../docs/specs/friends/profile-model/PRD.md)             |
| Avatars            | • Upload a photo<br>• Photo history<br>• Restore an earlier photo                                                                                                              | [spec](../../docs/specs/friends/profile-model/PRD.md)             |
| Birthdays          | • Upcoming birthdays timeline<br>• Calendar view<br>• Turning age                                                                                                              | [spec](../../docs/specs/friends/birthday-notifications/PRD.md)    |
| Birthday reminders | • Reminder email<br>• Days-before reminder<br>• Weeks-before reminder<br>• Turn reminders off                                                                                  | [spec](../../docs/specs/api/user-settings/PRD.md)                 |
| Connections        | • Send a request<br>• Accept a request<br>• Decline a request<br>• Cancel a sent request<br>• Disconnect                                                                       | [spec](../../docs/specs/friends/connections-graph/PRD.md)         |
| Social graph       | • Friends-of-friends tree                                                                                                                                                      | [spec](../../docs/specs/friends/connections-graph/PRD.md)         |
| Notifications      | • Inbox<br>• Unread count<br>• Mark all as read<br>• Delete one<br>• Clear all<br>• Email for connection requests and accepts                                                  | [spec](../../docs/specs/api/notification-emails/PRD.md)           |
| Onboarding         | • Opt in<br>• Handle<br>• Profile<br>• Visibility<br>• Birthday<br>• Timezone<br>• Initial connections<br>• Skip                                                               | [spec](../../docs/specs/friends/directory-rbac-onboarding/PRD.md) |
| Settings           | • Name and handle<br>• Language<br>• Theme<br>• Timezone<br>• Reminder preferences                                                                                             | [spec](../../docs/specs/api/user-settings/PRD.md)                 |

## Planned

| Feature          | Sub-features                         |
| ---------------- | ------------------------------------ |
| Friend directory | • Claim an entry that represents you |
| Notifications    | • Mark one as read                   |
