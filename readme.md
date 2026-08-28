# RU SnipeZ — showcase site

Single-page site for the RU SnipeZ project. Every number it displays comes from
`src/data/stats.json`, which is generated from the bot's own logs by
`build_stats.py`.

## Run it

```bash
npm install
npm run dev
```

## Fill in the real numbers

The site ships with placeholder values for the metrics I could not compute
without your data files. A banner sits at the top of the page listing how many
are still fake, and it disappears on its own once they are all real. Do not
deploy while that banner is showing.

Copy `build_stats.py` into your bot repo and run it there:

```bash
python build_stats.py \
    --users user_data.json \
    --logs ru_snipez_logs.json \
    --cache last_opened.json \
    --courses course_data.json \
    --out ../ru-snipez-site/src/data/stats.json
```

Then commit the regenerated `stats.json`. Raw logs stay on your machine and no
Discord user ID appears in the output, only counts derived from them.

The script guesses at your schema and skips anything it cannot parse rather
than failing. If a metric comes out empty, the two things to check are
`TS_FORMAT` at the top of the file and the key names inside `transitions()` and
`command_usage()`. Adjust those to match what your JSON actually contains.

Rerun it after each registration period to keep the site current.

## Before you deploy

- [ ] Replace `yourusername` in `src/App.tsx` and `src/components/Hero.tsx`
- [ ] Verify the four claims in `src/components/Architecture.tsx` against your
      actual implementation, especially the "Known limits" card
- [ ] Confirm the semester count in `stats.json` is right
- [ ] Run `build_stats.py` until the placeholder banner clears

## Deploy

Push to GitHub, import the repo on Vercel, accept the detected Vite settings.
Build command `npm run build`, output directory `dist`.

## Stack

Vite, React, TypeScript, Recharts. Styling is hand-written CSS in
`src/index.css` rather than a framework, since this is one bespoke page and the
design leans on custom properties for its palette.
