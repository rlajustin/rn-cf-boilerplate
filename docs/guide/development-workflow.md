# Development Workflow

I'll probably make this more verbose at some point in the future.

## iOS Client

For local development, you’ll mainly use two scripts:

- `npm run client ios` builds the native portion of the iOS app and installs it onto the local simulator. After this, changes to JavaScript will hot-reload the app. You only need to perform these builds when adding packages with native code; otherwise, just restart the local server with `npm run client start`.

Expo Application Services (EAS) is used to deploy your app. I don’t have much experience with this, so I recommend reading the [docs](https://docs.expo.dev/eas/) and writing your own build scripts.

## API Backend

Before creating a new endpoint, define it in `shared/endpoints/` before implementing it in `backend/src/routes/`. You can test locally by running:

```
npm run backend dev
```

If you changed the database schema, use:

```
npm run backend local:deploy
```

To deploy your worker to Cloudflare, make sure the section in `wrangler.toml` is configured. To upload your local environment variables, use:

```
npm run backend <preview|prod>:update_secrets
```

To deploy, use:

```
npm run backend <preview|prod>:deploy
```

## Web

This is a Next.js app, so I won’t go into detail. Just use `npm run web dev` to run locally.
