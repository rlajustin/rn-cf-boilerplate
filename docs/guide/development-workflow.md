# Development Workflow

## iOS Client

For local development, there are two main scripts you will be using.

`npm run client ios` builds the native portion of the iOS app, installing it onto the local simulator. From then on, changes to the javascript will hot-reload the app. You will only need to perform these builds when adding packages containing native code, otherwise it suffices to restart the local server using `npm run client start`

Expo Application Services (EAS) is used to deploy your app. I don't have much experience with this, so I would recommend reading the [docs](https://docs.expo.dev/eas/) and writing your own build scripts.

## API Backend

Before creating a new endpoint, you should first define it in `shared/endpoints/` before implementing it in `backend/src/routes/`. You can locally test by running

```
npm run backend dev
```

If you changed the database scheme, replace this with

```
npm run backend local:deploy
```

To deploy your worker to Cloudflare, you should first have the section in `wrangler.toml` configured. To upload your local environment variables, you can use

```
npm run backend <preview|prod>:update_secrets
```

To deploy use

```
npm run backend <preview|prod>:deploy
```

## Web

Again, I will not go into details since this is a next app which is well documented. Just use `npm run web dev` to run locally.
