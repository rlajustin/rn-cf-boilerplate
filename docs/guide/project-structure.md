# Project Structure

This doc is meant to help you get familiar with the repository so you know where to find things. The structure might be non-standard, as I don’t come from a big tech background. Even if you’re a vibes-only coder, it’s wise to understand how the app works—it’ll help you know where to start when fixing bugs.

- [Root (/)](#/)
- [Shared](#shared)
- [Backend](#backend)
- [Client](#client)
- [Web](#web)

## `/`

There are a few files of interest in the root. `package.json` is probably the most important, as it connects the monorepo together and lets you run commands for each workspace without switching directories. `.prettierrc` provides code formatting conventions. I recommend installing Prettier and configuring your VS Code settings to format on save.

## `shared/`

This folder is the single source of truth for how the frontend and backend communicate. The `AllEndpoints` variable in `src/index.ts` associates typed endpoint definitions with a key string. You can specify how endpoints should be authenticated, and the corresponding middleware is automatically used when mounting the route to the backend. The specific file organization doesn’t matter here, as long as every endpoint definition is included in `AllEndpoints`.

## `backend/`

You’ll often reference `package.json` for development and deployment scripts. `.dev.vars` contains secrets uploaded to Cloudflare via the `<preview|prod>:update_secrets` commands. `wrangler.toml` contains bindings that allow your Cloudflare worker to interact with other Cloudflare services.

API code lives in `src`. `index.ts` is the entry point. `src/routes/` contains all the routes, which implement the definitions in `../shared/`. Applying these with the `mountRoutes` function applies the corresponding auth middleware.

`src/services/` and `src/utils/` contain helper functions.

`src/schema/` contains the database schema, used to create type-safe database queries. Drizzle uses this schema (as configured by `drizzle.config.ts`) to generate database migrations (in `migrations/`), which are then handled by the deployment scripts.

## `client/`

Again, start at `package.json`, which contains scripts for testing and deploying the iOS app (see [Development Workflow](/guide/development-workflow)). Once the app is built, you’ll see an `ios/` folder, which contains the native code that allows your JavaScript to interface with native UI components.

`app/` contains the app’s pages. Expo uses [file-based routing](https://docs.expo.dev/develop/file-based-routing/). The other folders mostly contain utils or components used in the app directory. I recommend reading the Expo docs to understand their configuration files.

Note: The [EAS Build](https://docs.expo.dev/build/introduction/) process uses yarn by default, so you may need yarn resolutions even if you’re using npm.

## `web/`

This is a very bare-bones Next.js app, which AI can handle perfectly fine—so you don’t need me to explain it to you.
