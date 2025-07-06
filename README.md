# Build an IOS App with Cloudflare Backend

#### TODO

- [x] add email verification code attempts logic
- [x] implement password reset
  - [x] limit number of reset emails
- [x] webapp with at least auth (login) and pw reset
- [x] dont encrypt email in access token that's sort of silly
- [ ] look at the auth again and make sure it's like reasonably secure lol (ip rate limits? ddos protection? make a better rate limiter)
- [ ] README stuff
  - [ ] describe security parameters in the readme
  - [ ] more verbose setup in readme (include prerequisites)
  - [ ] describe all features, i.e. email verification, pw reset, app attest, auth flow/how to use auth, etc.
- [ ] build using external database service, integrate using hyperdrive or smth
- [ ] change email? delete account?

##### \*\*This repository can be used in its current state, but many features are still incomplete/unsafe.

## Contents

1. [Introduction](#introduction)
   - [What is React Native](#what-is-react-native)
   - [What is Cloudflare](#what-is-cloudflare)
   - [AI isn't super good at building this](#AI-isn't-super-good-at-building-this)
2. [Features](#features)
   - [End-to-end Type Safety](#end-to-end-type-safety)
   - [Simple(ish) Deployment](#simpleish-deployment)
3. [Getting Started](#getting-started)

## Introduction

This is boilerplate code was made for my friends who are currently studying computer science in undergrad, but have have little to no work experience. I myself have only like half a year of (intensive) experience in building a webapp. If you are a vibe coder who is generally able to figure stuff out, some understanding of programming in any language, and a lot of time on your hands, this is probably a good place to start in building an app. **This boilerplate can take you from 0 to MVP** and even a bit beyond without you paying a dime for hosting\*\*\*.

If your app gets a substantial userbase, first I would like a cut of your profits you made (half joking), but also to avoid insane cloud costs, you will want to transition to self-hosting parts of the DB and API. This DB migration in particular might be painful, so you may want to self-host or use a dedicated DB provider from the outset.

\*\*\*Unfortunately, it costs **$99 annually** to publish your app to the IOS App store with an Apple developer account. You don't need to purchase this when you start building, but it's sort of necessary if you want to distribute developer versions of the app (this is necessary to integrate IOS App Attest, among many other native features). I believe it is free if you just simulate the app on a MacOS device or using Expo Go.

##### What is React Native

React native has two parts: the react part and the native part. The goal with this repository is so that you have to write as little "native" code as possible, which in the case of an IOS app is written in swift and objective C and stuff idk. Basically, a RN app is built on top of native code that has obj-c "bridges" which interface the react-like code with the actual native code that runs on the phone itself. React native is a framework in the same sense that React is, i.e. it isn't and it's pretty inconvenient to write a raw RN app (or so I'm told), so we instead use the **Expo** which uses file-based routing, read more [here](https://docs.expo.dev/develop/file-based-routing/).

##### What is Cloudflare

We use it to host the backend because it has a relatively cheap free tier. When this is deployed, rather than a centralized server, cloudflare has a globally distributed network that ensures assets are always close to the user. For a lot of applications though I would still recommend having a centralized DB, so the actual benefit of this distributed network may vary.

##### AI isn't normally good at building these types of apps

It's important to know that **AI has a poor understanding of React Native**, and you will inevitably encounter bugs that it simply cannot solve due to the limited documentation available.

If you're ever really stuck, shoot me an email at <me@rlajustin.com> with "[ENGINEERING QUESTION]" in the subject. I can't promise to be super involved with helping you (I will be busy with grad school), but at the very least I can point you in the right direction because I've encountered _a lot_ of bugs in the process of working on an app of my own. This might be more helpful than stackoverflow since we likely have a similarly little understanding background in react native, expo, IOS, typescript, swift, good software practices, tech, etc.

## Features

As with any vibe-coded project, it's super important to have your code well-documented so Claude can help you along the way. This project is structured as what's apparently known as a **"monorepo"**, which according to Reddit has pros and cons.

In this section I display the general flow of adding a new feature, first with writing the API endpoint, making requests on the frontend, and deploying the API so you can test.

#### End-to-end Type Safety

One pro is that we have **end-to-end type safety**, in which you first declare the request and return types for each API endpoint before implementing them. Additionally, we use a library known as **Drizzle**, an typesafe SQL wrapper, making simple DB stuff pretty easy to do even with no background in it. All you need to do is create/edit schema files if you ever want to add or change a table, and the database migration should be handled seamlessly when you deploy.

This allows the following flow to be relatively seamless: Suppose we wanted to (vibe-code) a friends list feature. First, we would define two new endpoints with keys `ADD_FRIEND` and `GET_FRIENDS` in, for example, `shared/src/endpoints/friends`, specifying that they require authentication, and properly exporting them from the shared folder.

Then, make a new database table in `backend/src/schema/`, making a new file named `friends.ts` and properly exporting from it.

Inside of `src/routes/protected/` we can make a new folder `friends/`, structuring it similarly to `identity`. Given references to the schema file we just made as well as the endpoint defined in `shared`, these endpoints should be fairly simple for AI tools to write. Note that you should get the user's identity from parsing `c.set("access_token_body", payload)`, I would look at how authentication is implemented in `backend/src/middleware.ts`.

Now for the frontend, we can simply type `apiClient.post({endpointName: "ADD_FRIEND"...})` and the

#### Simple(ish) Deployment

I tried to set up helpful scripts in the `package.json` files so you hopefully don't need to write any custom deployment scripts, but I am not a devops engineer (or any sort of engineer for that matter) and things might not work super well.

First, you will need to create `wrangler.toml` and `.dev.vars` in the `backend` folder, copying from their corresponding .EXAMPLE files. I would just ask claude how you should fill them in, it should be documented well enough (there is more information below).

Whenever the schema is changed, you need to perform a database migration, which should be handled by `npm run backend <local | preview | prod>:migrate`. Sometimes, you run into issues with tables already existing and whatnot, in which case you could figure out how to manually edit the `backend/migrations` folder using DROP TABLE commands. Otherwise, you don't ever need to modify that folder yourself.

## Getting Started

You should grep this repo for "YOUR-". You will need to replace all of these.

##### Prerequisites

You should have a macOS machine with XCode and Node.js installed. You need to have [homebrew](https://brew.sh/) as well.

##### Building to IOS

The first (and likely most difficult) task to complete is building/launching the IOS app. First, `npm i` and then

`cd client && npx expo prebuild -p ios && cd ios && pod install`

you need to have cocoapods (which also requires homebrew on macos)

run `npm run client ios`. This will attempt to build the app using XCode and simulate the app.

##### Deploying local API

First, you will need to create a free cloudflare account. Then, in order to run the api, we need to set up the SQL and key-value databases. Run `npx wrangler kv namespace create <KV-STORAGE-NAME>`. The output should list an id field, which you should paste into `wrangler.toml` under `[[kv_namespaces]]`. You should also go through `wrangler.toml` and fill in wherever there is a placeholder. You should be able to run `npm run backend dev` to start a local instance of the API.

##### Register an account and log in

In order to register an account (at least without changing some stuff), we need to set up the mail service. There are 6 SMTP variables in `.dev.vars` that you will need to fill out. I would recommend creating a free [Brevo](https://app.brevo.com/) account, they have a somewhat generous free plan that lets you send 300 emails each month. If you scale really big, I would look into self-hosting your email service, probably with [Mail in a Box](https://mailinabox.email/), but you don't need to worry about that. Once you have Brevo account, go to the "SMTP & API" tab and get the necessary credentials to fill in. SMTP_PASSWORD is the API key, and the sender name can be whatever you want. You will also need to generate a JWT secret with the command `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`. Put this output into `.dev.vars`.

##### Start building stuff idk

#### Acknowledgements

- Much of the backend structure was (initially) built on top of [Melody Auth](https://github.com/ValueMelody/melody-auth), which has many additional features that I stripped away. I would recommend using this as a resource if you want to add more features to the auth flow.
