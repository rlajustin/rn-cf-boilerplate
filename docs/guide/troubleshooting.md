# Troubleshooting

You can feel free to send me an email (which you can find if you do a bit of digging). I can't promise to be super involved with resolving issues, but at the very least I might be able to point you in the right direction if it's something I've encountered before.

## Read the docs!

For me, the most helpful resources (for the iOS client portion) were **documentation** and **github issues**. You don't need to fully understand what you read, but often it'll give you a better direction rather than blindly using AI.

In particular, AI is pretty awful at assessing the Expo app's errors. I would say that 90% of the confusing issues were due to a mismatch between the native modules their corresponding JS parts. Make use of the `npm ls <>` commands and `npm dedupe`. This problem is particularly annoying with the EAS build process.

## AI often will struggle

It's important to know that **AI has a poor understanding of React Native**, and you will inevitably encounter bugs that it simply cannot solve due to the limited documentation available.
