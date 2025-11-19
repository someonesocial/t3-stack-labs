# Create T3 App

This is a [T3 Stack](https://create.t3.gg/) project bootstrapped with `create-t3-app`.

## What's next? How do I make an app with this?

We try to keep this project as simple as possible, so you can start with just the scaffolding we set up for you, and add additional things later when they become necessary.

If you are not familiar with the different technologies used in this project, please refer to the respective docs. If you still are in the wind, please join our [Discord](https://t3.gg/discord) and ask for help.

- [Next.js](https://nextjs.org)
- [NextAuth.js](https://next-auth.js.org)
- [Prisma](https://prisma.io)
- [Drizzle](https://orm.drizzle.team)
- [Tailwind CSS](https://tailwindcss.com)
- [tRPC](https://trpc.io)

## Learn More

To learn more about the [T3 Stack](https://create.t3.gg/), take a look at the following resources:

- [Documentation](https://create.t3.gg/)
- [Learn the T3 Stack](https://create.t3.gg/en/faq#what-learning-resources-are-currently-available) — Check out these awesome tutorials

You can check out the [create-t3-app GitHub repository](https://github.com/t3-oss/create-t3-app) — your feedback and contributions are welcome!

## How do I deploy this?

Follow our deployment guides for [Vercel](https://create.t3.gg/en/deployment/vercel), [Netlify](https://create.t3.gg/en/deployment/netlify) and [Docker](https://create.t3.gg/en/deployment/docker) for more information.

Route (app)                                 Size  First Load JS
┌ ƒ /                                    2.34 kB         135 kB
├ ○ /_not-found                            996 B         103 kB
├ ○ /about                                 368 B         106 kB
├ ƒ /api/trpc/[trpc]                       127 B         102 kB
├ ƒ /chat                                3.42 kB         139 kB
├ ○ /game                                1.26 kB         103 kB
├ ƒ /labs                                4.72 kB         140 kB
├ ƒ /learn                               1.14 kB         118 kB
├ ○ /projects                            1.49 kB         107 kB
└ ○ /svg                                 3.05 kB         120 kB
+ First Load JS shared by all             102 kB
  ├ chunks/255-e3bf15caf1f1e0f9.js       45.7 kB
  ├ chunks/4bd1b696-c023c6e3521b1417.js  54.2 kB
  └ other shared chunks (total)          2.04 kB


○  (Static)   prerendered as static content
ƒ  (Dynamic)  server-rendered on demand