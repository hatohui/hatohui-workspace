# Features

Functional features per app, each in a table in the app's own folder. Design reasoning lives in `docs/specs/<app>/`.

| App       | Features                                                    | Status                                      |
| --------- | ----------------------------------------------------------- | ------------------------------------------- |
| API       | [apps/api/features.md](../apps/api/features.md)             | live                                        |
| Friends   | [apps/friends/features.md](../apps/friends/features.md)     | live                                        |
| Art       | [apps/art/features.md](../apps/art/features.md)             | live                                        |
| Workspace | [apps/workspace/features.md](../apps/workspace/features.md) | admin console live, task management planned |
| www       | [apps/www/features.md](../apps/www/features.md)             | live                                        |
| Travel    |                                                             | planned, empty                              |

Infrastructure: local Postgres, MinIO, Mailpit and Redis via `docker-compose.yml`; per-app CD workflows and Terraform under `infra/`; an OpenAPI client generated into `@hatohui/models`.
