# Introduction

Vibe coding is exceptional for making web apps, but often fails elsewhere. This is especially true in the mobile app ecosystem. React Native/Expo are very much lacking in accurate documentation. While RN somewhat resembles React for the web, the build process is very different, and LLMs have a severe knowledge gap. This project aims to (among other things) fill that gap, allowing those familiar with React-like code to avoid this pain and begin building.

If you are a vibe coder who is generally able to figure stuff out, some understanding of programming (especially TS/React/Node), and a lot of time on your hands, I would say this is a good place to start building a mobile app. **This boilerplate can take you from 0 to MVP** and even a bit beyond without you paying a dime for hosting\*\*\*.

Once have substantially many users, aside from [buying me a coffee](https://ko-fi.com/rlajustin), you will want to transition to self-hosting parts of the DB and/or API for the sake of minimizing cloud costs. This DB migration in particular might be painful, so you may want to self-host from the start. Sometime down the line (when I get the hardware) I intend to experiment on a home server how that all works, though if you are seeing this, try looking into [Hyperdrive](https://developers.cloudflare.com/hyperdrive/).

\*\*\*Unfortunately (as far as I'm concerned) it costs **$99 annually** to publish your app to the IOS App store with an Apple developer account. You don't need to purchase this when you start building, but it's sort of necessary if you want to distribute developer versions of the app (this is necessary to integrate IOS App Attest, as well possibly other native features). App attest should work as is so you don't need to test it, unless you decide to integrate it in more places.

## Design Decisions/Goals

This is an opinionated (but accordingly robust) project. Here are some things I considered when building this template:

- **Security:** Properly handling auth is either hard or expensive, and not handling auth entirely is probably more expensive. This auth is simple and secure, integrating email verification for singular users, and optionally only allowing registration from valid iOS devices via [Device Attestation](https://support.apple.com/guide/deployment/managed-device-attestation-dep28afbde6a/web). **This auth flow works best for consumer apps.\*** If you need B2B/enterprise solutions, I would recommend switching the auth logic for an auth provider of your choice.
- **Developer experience:** Explicit and strict typing, building up context for your vibe coding tool of choice. I don't know much of the devops side, but there is decent infrastructure for deployment and development.
- **Simple and flexible stack:** To start out, the backend can be deployed in a single command. Drizzle (in my understanding) mostly decouples your backend from any specific database service. The entire codebase is entirely javascript, making it easier for you to learn. Backend implementation is mostly decoupled from cloudflare (aside from KV, which is sort of non-essential as is). Even auth is extremely bare-bones and sort of implementation agnostic. This all allows you to switch your stack before launch with minimal pain.
  - A note on this: I could've made the API a part of the web server, but there's a good chance you'll want to switch to a self-hosted option for the API anyway and thus I deemed it best to keep them separate.
- **Ready to be vibe-coded:** The monorepo structure allows your AI editor of choice to find context and infer proper frontend implementations of backend code and vice-versa. Simply create a feature in the `shared/` folder as the single source of truth, and allow typescript to handle the rest. For better results, create explicit `.cursorrules` (or your equivalent) with this structure.

In general, my philosophy is a little too optimistic in that this project prepares to handle a ton of users, but I also do know that it's a pretty big headache if these things aren't considered from very early on.

\*Around the millions of users range, these prices scale dramatically better than any auth service. Scaling a mail server using mailcow on a VPS is extremely cheap. <u>**That said, consider using some auth-as-a-service solution**,</u> especially if you plan on ever needing outside integration (SSO, social media, etc.). Services like WorkOS (seem to) have a generous free plan, and it should be pretty easy to use in place of my custom auth setup. Much like with cloud providers, I found it really hard to understand these SaaS pricing models and was a little put off by that, but if you do your research it might be worthwhile.

## What is React Native

React native has two parts: the react part and the native part. Basically, it allows you to use JS to interface with the native code that runs on the phone itself. Watching [this video](https://www.youtube.com/watch?v=gvkqT_Uoahw) might help slightly. React native is a framework in the same sense that React for the web is (it isn't) and we get the extra tooling we need by using **Expo**, read more that [here](https://docs.expo.dev/develop/file-based-routing/).

When you are working in javascript, RN supports hot refreshing since the native code doesn't need to be changed in any way. However, when you import a react native library which has native modules, it becomes necessary to initiate a full rebuild of the app, which in this repo can be done with the command `npm run client ios`.

## What is Cloudflare

Cloudflare essentially provides compute in such a way that abstracts away some of the difficulties with networking and servers and stuff. Here is a [summary](https://www.youtube.com/watch?v=FH5-m0aiO5g), though the video can only go so deep into the specifics.

There are many alternatives (aws/vercel, gcp, azure, etc.) but honestly I probably just fell for this [propaganda](https://www.youtube.com/@backpine). Cloudflare has relatively good pricing/free tier and you will probably need them for some of your infrastructure anyway so why not.
