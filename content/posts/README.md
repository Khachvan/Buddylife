# Repository posts

One JSON file per post and language, named `<YYYY-MM-DD>-<slug>.<language>.json`.
They are published by the site exactly like backoffice posts: live when `status` is
`published` or `scheduled` and `publishAt` is in the past. See
[docs/CONTENT-PLAYBOOK.md](../../docs/CONTENT-PLAYBOOK.md) for the format, visuals and
video rules, and `pnpm content` to validate before opening a pull request.
