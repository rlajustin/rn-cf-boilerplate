# Project Structure

The aim of this doc is to acquaint you with the repository so you know where to find things. I want to acknowledge that this project's structure might be non-standard, as I do not come from a big tech background. Even if you are a vibes-only coder, I think it would still be wise to understand how the app works, as it informs you of where to begin when fixing bugs.

- [Root (/)](#/)
- [Shared](#shared)
- [Backend](#backend)
- [Client](#client)
- [Web](#web)

## `/`

There are a few files of interest in the root. `package.json` is probably the most important, doing some npm stuff to connect the monorepo together. You can easily run commands for each workspace without needing to navigate between them. `.prettierrc` is used to provide standard conventions in how your code is formatted. I would recommend downloading prettier and configuring your VS Code settings so that it applies formatting on save.

## `shared/`

This folder acts as the single source of truth in defining how the frontend and backend communicate with each other. The AllEndpoints variable in `src/index.ts` allows you to associate typed endpoint definitions with a key string. You can determine how the endpoints should be authenticated, and the corresponding middleware is automatically used when mounting the route to the backend. The specific file organization doesn't matter here, as long as every endpoint definition is a part of the AllEndpoints variable.

## `backend/`

You will often use `package.json` as a reference, as it contains all the scripts associated with development and deployment. `.dev.vars` contains secrets that are uploaded to Cloudflare via the `<preview|prod>:update_secrets` commands. `wrangler.toml` mostly contains bindings that allows your cloudflare worker to interact with other Cloudflare services.

The API code is in `src`. `index.ts` is the starting point. `src/routes/` contains all of the routes, which are essentially implementations of the definitions in `../shared/`. Applying these with the `mountRoutes` function will apply the corresponding auth middleware.

`src/services/` and `src/utils/` both contain some helper functions.

`src/schema/` contains the database schema, which is used to create type-safe database queries. Drizzle will use this database schema (as configured by `drizzle.config.ts`) to generate database migrations (in `migrations/`), which are then handled by the deployment scripts.

## `client/`

Again, we start at `package.json`, which contains scripts for testing and deploying the iOS part of the app, more on that in [Development Workflow](/guide/development-workflow). Once the app is initially built, you will see an `ios/` folder, which contains the native code of the app. This is what allows the Javascript you write to interface with native UI components.

`app/` contains the pages of the app. Expo uses [file-based routing](https://docs.expo.dev/develop/file-based-routing/). The other folders mostly contain utils or components that are used in the app directory. I would recommend reading the Expo docs to understand their configuration files.

It's worth noting that the [EAS Build](https://docs.expo.dev/build/introduction/) process uses yarn by default, so for that you may need yarn resolutions even if you're using npm.

## `web/`

This is an extremely bare-bones Next.js app, which AI can handle perfectly fine, so you don't need me to explain it to you.
