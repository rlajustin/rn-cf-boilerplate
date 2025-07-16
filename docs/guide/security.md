# Security Reference

For any full-stack application, security should be a priority from the beginning. If security isn’t handled proactively, you may run into a lot of headaches later. The security implemented in this boilerplate should be considered the bare minimum—if you get big, you’ll want a real security audit. Here’s how authentication works in this boilerplate, so you have a reference if you ever want to change parameters or make deeper changes.

## Security Primer

This is not exhaustive and doesn’t discuss protecting users from browser-based attacks (CSRF/XSS). This just covers the core of server-side authentication that nearly all backends have in some form.

### What do we authenticate?

If you’re new to app dev, you may not know how this works. What does it mean for a user to log in? Sure, we can check if their username and password match the database, but after login, how do we know subsequent API calls are from the same user? Checking IPs isn’t reliable (especially for mobile apps), and sending credentials with every request is both inefficient and risky.

This is where access tokens come in. When a user logs in, we generate and _sign_ a token (a string containing user info). These [signatures](https://en.wikipedia.org/wiki/Digital_signature) are made so it’s [cryptographically impossible](https://en.wikipedia.org/wiki/Computational_hardness_assumption) to change the token’s contents without the server knowing. The user stores this token, which (a) contains nothing about their login credentials, making it safer to store, and (b) allows us to verify their identity without a database request, since we can simply verify the token’s validity.

We also use a “refresh token.” Logging in gives the user a long-lived token (default: 4 years), which is used to generate short-lived (e.g., 15 min) access tokens. We store refresh tokens in a database, and when the user wants to refresh their access token, we check if their refresh token is valid. This lets us:

- Track valid user sessions and display them to the user
- Give users transparency over their active sessions (associate tokens with IPs/regions)
- Allow users to sign out of all sessions after a password change
- Restrict access by a malicious user

and more.

### How do we authenticate?

Simply creating middleware to verify tokens doesn’t automatically make your app secure—it’s easy to create vulnerabilities if you’re not careful. For example, suppose we’re a bank with users A and B.

Let’s say we have a money transfer endpoint like this:

```typescript
// Hypothetical vulnerable endpoint

app.post("/transfer", async (req, res) => {
  const { senderUsername, recipientUsername, amount } = req.body;

  // Throws an error if token is invalid
  try {
    await authenticateToken(req.headers.authorization);
  } catch {
    throw new HTTPException(401, "Authorization failed");
  }

  await transferMoney(senderUsername, recipientUsername, amount);
});
```

Suppose User A sends a request with:

```json
{
  "senderUsername": "userB",
  "recipientUsername": "userA",
  "amount": "1_000_000"
}
```

Even though we use authentication, this request will succeed—attacker A can impersonate User B and send money to herself. This is a catastrophic security issue, and AI editors can easily introduce mistakes like this. As a rule, never let a user assert their identity to the API—always use the data from their access token.

Instead, the transfer endpoint should look like this:

```typescript
// Secure endpoint

app.post("/transfer", async (req, res) => {
  const { recipientUsername, amount } = req.body;

  const tokenBody = await authenticateToken(req.headers.authorization);
  const senderUsername = tokenBody.username;

  await transferMoney(senderUsername, recipientUsername, amount);
});
```

In this repo, middleware automatically decodes and authenticates the token before your API handler runs. Just call `getAuthenticatedUser` from `src/utils/auth.ts` to get the decoded token body.

### Other considerations

The above is the bare minimum for securing your app. If you handle sensitive user data (especially with web apps), you also need to protect users from attacks like Cross-Site Scripting (XSS) and Cross-Site Request Forgery (CSRF). It’s easy to accidentally create vulnerabilities to these attacks. If you want a cheap (in price and maybe quality) consultation, reach out.

## Boilerplate Security Features

Here’s a brief overview of the current auth flow. A lot is missing, but writing documentation takes time, so this is it for now.

### User Scopes

There are two main user scopes in this app, though you may want to add more or implement more complex verification. You can easily add custom logic (just search for the `allowUserAccess` function).

### User Registration

With the current setup, users are "unverified" until they verify their email, at which point they become a "user." Upon registering, the new user is added to the users table (see `backend/src/schema/user.ts`), and can immediately use endpoints scoped to "unverified" users. You can restrict access to other parts of the app by specifying in the `shared/` folder whether an endpoint requires the "user" scope. Before email verification, their scope is "unverified," and middleware prevents them from using protected endpoints.

If you want to tie your app more strongly to mobile devices (to deter programmatic account creation and potential API abuse), you can use Apple’s [Managed Device Attestation](https://support.apple.com/guide/deployment/managed-device-attestation-dep28afbde6a/web) to limit registrations. I haven’t implemented many features myself, and it’s probably not critical at first, but it’s worth looking into.

### Changing Password or Email

This app supports allowing a user to change their password or email. Currently, the frontend implementation is web-only, but you can integrate it with your mobile app if you want. Note: the password reset link immediately gives the user authority to change their password, while the email verification code requires login. Changing email, account deletion, and password changes can be done for emails that haven’t yet been verified (implemented on the web frontend). The email is only changed in the database if the user successfully completes the email change.

### Why no phone number verification?

If you want to add phone verification to the auth flow and have some budget, I might be down to help make it/add it to this repo. I didn’t do it initially because SMS is annoying and about $0.01/text.
