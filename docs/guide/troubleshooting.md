# Troubleshooting

Feel free to send me an email (you can find it if you do a bit of digging). I can’t promise to be super involved with resolving issues, but I might be able to point you in the right direction if it’s something I’ve encountered before.

## Read the docs!

For me, the most helpful resources (for the iOS client) were **documentation** and **GitHub issues**. You don’t need to fully understand everything you read, but it’ll often give you better direction than blindly using AI.

In particular, AI is pretty bad at diagnosing Expo app errors. I’d say 90% of confusing issues are due to a mismatch between native modules and their corresponding JS parts. Use `npm ls <>` and `npm dedupe` to help resolve these. This problem is especially annoying with the EAS build process.

## AI will often struggle

It’s important to know that **AI has a poor understanding of React Native**, and you’ll inevitably encounter bugs it simply can’t solve due to limited documentation.
