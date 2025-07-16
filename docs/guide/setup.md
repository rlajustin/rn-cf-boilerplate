# Setup Reference

I'll probably make this more verbose at some point in the future.

## Prerequisites

Clone the repository:

```
git clone https://github.com/rlajustin/rn-cf-boilerplate.git
```

The `docs` folder can be deleted if desired.

For local development, you’ll need [Xcode](https://apps.apple.com/us/app/xcode/id497799835) to build and simulate the mobile app. Once Xcode is installed, you can install an iPhone simulator. You should also have [Homebrew](https://brew.sh/). Install Node.js with:

```
brew install node
```

Install dependencies with:

```
npm i
```

Try to build the iOS app locally with:

```
npm run client ios
```

Install any additional dependencies required for the build to succeed. This is likely where you’ll encounter the most friction during setup.

You should also create a Cloudflare account and (optionally) purchase a domain. This will give you a custom domain to host your API/website, as well as a custom email domain.

## Configuration

First, create config files using the command

You will need to complete the following files with names or values specific to your app:

```
client/app.json
backend/.dev.vars
backend/wrangler.toml
backend/package.json
```

For backend files that don’t exist yet, create them by copying their corresponding EXAMPLE files. Additionally, search the codebase for instances of "<YOUR-", as you should change these as well.

Create a free [Brevo](https://app.brevo.com/) account for email—Brevo offers a generous free plan (300 emails/day). If you scale up, consider self-hosting your email service with [Mailcow](https://mailcow.email/) or [Mail in a Box](https://mailinabox.email/). For now, follow an online guide to set up Brevo with your custom domain via Cloudflare. Once set up, fill in `backend/.dev.vars` with values from the "SMTP & API" and "Senders, Domains & Dedicated IPs" tabs. Generate a JWT secret with:

```
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Put this output into `.dev.vars`. The `APP_BUNDLE_ID` and `TEAM_ID` fields are from Apple and are necessary for Device Attestation (but aren’t required immediately).

To complete the initial setup, fill out the local section in `backend/wrangler.toml`, setting `database_name` to match the `local:migrate` script in `backend/package.json`. After this, you should be able to perform the initial database migration and launch the backend service with:

```
npm run backend local:deploy
```

To complete `wrangler.toml`, you’ll need to create Cloudflare databases and bind them to your worker. For preview and prod KV/D1 databases, refer to these docs: [KV](https://developers.cloudflare.com/kv/get-started/), [D1](https://developers.cloudflare.com/d1/get-started/).
