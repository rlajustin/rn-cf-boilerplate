# Setup Reference

## Prerequisites

You can install the repo with `git clone https://github.com/rlajustin/rn-cf-boilerplate.git`. You can delete the docs folder if you would like.

For local development, you will need [Xcode](https://apps.apple.com/us/app/xcode/id497799835) in order to build and simulate the mobile app. Once Xcode is installed, you should be able to install an iPhone simulator. You should also have [homebrew](https://brew.sh/). Install Node.js with `brew install node`.

You should now be able to install dependencies with `npm i`. Try to build the iOS app locally with `npm run client ios`, and install whatever other dependencies necessary for the build to succeed. This will likely be the point of most friction in the setup process.

You should also create a Cloudflare account, and purchase a domain (optional). This will give you a custom domain to host your API/website, as well as a custom email domain.

## Configuration

First, create config files using the command

You will need to complete the following files with names or values specific to your app:

```
client/app.json
backend/.dev.vars
backend/wrangler.toml
backend/package.json
```

For the backend files that don't exist yet, create them by copying their corresponding EXAMPLE files. Additionally, search the codebase for instances of "<YOUR-", as you should change these as well.

First, you should create a free [Brevo](https://app.brevo.com/) account, as they have a generous free plan that lets you send 300 emails every day. If you scale really big, I would look into self-hosting your email service, probably with [Mailcow](https://mailcow.email/) or [Mail in a Box](https://mailinabox.email/), but you don't need to worry about that and can switch in the future if necessary. Try searching online for a guide to set Brevo up with your custom domain via Cloudflare. Once it's all set up, fill in `backend/.dev.vars` with values from the "SMTP & API" and "Senders, Domains & Dedicated IPs" tabs. You will also need to generate a JWT secret with the command `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`. Put this output into `.dev.vars`. The `APP_BUNDLE_ID` and `TEAM_ID` fields are from Apple, and necessary to implement Device Attestation (but aren't necessary as of this moment).

To complete the initial set up, you only need to complete the local section in `backend/wrangler.toml`, setting "database_name" to match with the `local:migrate` script in `backend/package.json`. After completing this, you should be able to perform the initial database migration and launch the backend service using `npm run backend local:deploy`

To complete `wrangler.toml`, you will need to create cloudflare databases and bind them to your worker. For the preview and prod KV/D1 databases, you should use these docs: [KV](https://developers.cloudflare.com/kv/get-started/), [D1](https://developers.cloudflare.com/d1/get-started/).
