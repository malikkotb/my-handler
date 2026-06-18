# Sanity Client and Data Fetching

- **Client**: Import `sanityClient` and `sanityFetch` from `~/features/sanity/client`. Use `sanityFetch({ query, params, live, options })` for all Server Component fetching.
- **Draft mode**: Enabled via `/api/draft-mode/enable`. Client switches to draft perspective automatically.
- **Live mode**: `live` defaults to `true` when draft mode is on. `live: true` uses Sanity Live (stega); `live: false` uses standard fetch with Next.js caching/ISR.
- **Env**: Sanity vars validated in `~/env.ts`. Server: `SANITY_API_VIEW_TOKEN`, `SANITY_API_EDIT_TOKEN`, `SANITY_REVALIDATE_SECRET`. Public: `NEXT_PUBLIC_SANITY_*`.
- **Revalidation**: Webhook `/api/revalidate`; validates signature with `SANITY_REVALIDATE_SECRET`; revalidates by document type and optional slug.
