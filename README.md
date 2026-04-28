# word-app-miniprogram

Minimal native WeChat Mini Program scaffold that WeChat DevTools can open directly.

## Structure

- `project.config.json`: DevTools project config with `miniprogramRoot` set to `miniprogram/`
- `project.private.config.json`: local-only DevTools overrides
- `package.json`: optional TypeScript tooling
- `tsconfig.json`: TypeScript config for Mini Program source files
- `miniprogram/`: source root for app files and pages

## Getting started

1. Open `C:\Users\24761\Desktop\word-app-miniprogram\` in WeChat DevTools.
2. Keep the placeholder appid `touristappid` for local preview, or replace it with a real appid.
3. Add app files under `miniprogram/` when ready.

## Optional tooling

```bash
npm install
npm run typecheck
```
