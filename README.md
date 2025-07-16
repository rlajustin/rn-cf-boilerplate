# Build an IOS App with Cloudflare Backend

[![ko-fi](https://ko-fi.com/img/githubbutton_sm.svg)](https://ko-fi.com/U7U21CUEQD)

#### TODO

- [x] add email verification code attempts logic
- [x] implement password reset
  - [x] limit number of reset emails
- [x] webapp with at least auth (login) and pw reset
- [x] dont encrypt email in access token that's sort of silly
- [x] look at the auth again and make sure it's like reasonably secure lol (ip rate limits? ddos protection? make a better rate limiter)
- [x] change email? delete account?
- [x] refresh token stuff
- [x] integrate sign out with refresh token
- [x] make auth flow smoother (auto log in upon registration)
- [ ] proactive refreshing?
- [ ] show all active refresh tokens (active sessions) and allow sign out of them
- [ ] rotate token on refresh
- [ ] make ApiClient try catch garbage readable
- [ ] apply device attestation middleware
- [ ] README stuff
  - [ ] describe security parameters in the readme
  - [ ] more verbose setup in readme (include prerequisites)
  - [ ] describe all features, i.e. email verification, pw reset, app attest, auth flow/how to use auth, etc.
- [ ] build using external database service, integrate using hyperdrive or smth
- [ ] make more special use of managed device attestation

##### \*\*This repository can be used in its current state, but some features could still be incomplete/unsafe.

## Contents

1. [Introduction](#introduction)
   - [Design Language](#design-language)
   - [What is React Native](#what-is-react-native)
   - [What is Cloudflare](#what-is-cloudflare)
   - [AI isn't super good at building this](#AI-isn't-super-good-at-building-this)
2. [Features](#features)
   - [End-to-end Type Safety](#end-to-end-type-safety)
   - [Simple(ish) Deployment](#simpleish-deployment)
3. [Getting Started](#getting-started)
4. [Self-hosting](#self-hosting)
   - [Database integration with Hyperdrive](#)
   -

##### Building to IOS

The first (and likely most difficult) task to complete is building/launching the IOS app. First, `npm i` and then

`cd client && npx expo prebuild -p ios && cd ios && pod install`

you need to have cocoapods (which also requires homebrew on macos)

run `npm run client ios`. This will attempt to build the app using XCode and simulate the app.

##### Deploying local API

First, you will need to create a free cloudflare account. Then, in order to run the api, we need to set up the SQL and key-value databases. Run `npx wrangler kv namespace create <KV-STORAGE-NAME>`. The output should list an id field, which you should paste into `wrangler.toml` under `[[kv_namespaces]]`. You should also go through `wrangler.toml` and fill in wherever there is a placeholder. You should be able to run `npm run backend dev` to start a local instance of the API.

## License

This project is licensed under the MIT License. See the [LICENSE](./LICENSE) file for details.
