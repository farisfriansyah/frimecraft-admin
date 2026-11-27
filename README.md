This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

## Portfolio image storage

Portfolio covers (JPG, PNG, WebP, or AVIF, up to 5 MB) are converted to WebP and resized to at most 1920 x 1440 before storage. Files are stored outside the deployment bundle in `~/.frimecraft/uploads/portfolio` by default, so replacing the standalone build does not remove them. Set `PORTFOLIO_UPLOAD_DIR` to another persistent, writable directory if needed. The image API reads this directory and falls back to `public/uploads/portfolio` for existing files.

## Production build

`npm run build` requires a root `.env` containing `DATABASE_URL` and a `SESSION_SECRET` of at least 32 characters. It produces the deployable standalone app in `.next/standalone`, including `.env`, runtime dependencies, `public`, and static assets. Upload the contents of that folder and run `npm start` (or `node server.js`) from its root. Keep the app directory private from direct static-file serving because it contains database credentials.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
