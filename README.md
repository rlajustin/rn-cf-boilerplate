# Build an IOS App with Cloudflare Backend

[![ko-fi](https://ko-fi.com/img/githubbutton_sm.svg)](https://ko-fi.com/U7U21CUEQD)

## Documentation

[Documentation](https://rlajustin.com/rn-cf-docs)

##### \*\*This repository can be used in its current state, but some features may be incomplete.

## TODO

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

## License

This project is licensed under the MIT License. See the [LICENSE](./LICENSE) file for details.
