# REAN — Rescuing European Animals in Need

A modern, responsive website for REAN, a charity that rescues stray dogs from
Romania and re-homes them in the UK. Built with React + Vite.

This is the first build: a full homepage plus placeholder pages for the rest of
the site (Adopt, Happy Homes, Donate, News, Contact, Sign In). Navigation is
client-side React state — no router dependency — so it runs anywhere.

## Running it locally

You need [Node.js](https://nodejs.org/) (version 18 or newer).

```bash
npm install      # install dependencies (first time only)
npm run dev      # start the dev server at http://localhost:5173
```

Open the URL it prints in your browser. The page reloads as you edit files.

## Building for production

```bash
npm run build    # outputs a static site into the dist/ folder
npm run preview  # preview the production build locally
```

## Project structure

```
rean-site/
├── index.html          # page shell, loads the app
├── package.json        # dependencies and scripts
├── vite.config.js      # build config
└── src/
    ├── main.jsx        # React entry point
    └── App.jsx         # the entire site (homepage + all pages)
```

Everything lives in `src/App.jsx` for now — the design tokens, components, and
pages are all in that one file, clearly sectioned with comments.

## Deploying

The `dist/` folder from `npm run build` is a plain static site. You can host it
free on:

- **Vercel** — import the GitHub repo, it auto-detects Vite, click deploy.
- **Netlify** — connect the repo; build command `npm run build`, publish dir `dist`.
- **GitHub Pages** — push `dist/` to a `gh-pages` branch (or use an action).

## What's next

- Real dog photos (currently warm SVG placeholders, ready to swap)
- The adoption inquiry form on dog profiles
- The admin dashboard for managing dogs and content
- Wiring up real donate buttons (PayPal / card)

## Notes

- The dog portraits are intentional SVG placeholders so the layout looks
  finished before real images are added.
- The REAN logo is recreated as inline SVG, so there's no image file to manage.
- Fonts (Fraunces + Inter) load from Google Fonts via the stylesheet.
