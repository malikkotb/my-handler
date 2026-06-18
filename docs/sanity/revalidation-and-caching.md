# Revalidation and Caching

## Webhook Endpoint

Revalidation handler: `app/api/revalidate/route.ts`

To register this URL with Sanity (URL + secret in Manage), use **`npm run sanity:project-setup`** or add the webhook manually — see [Sanity project setup](./project-setup.md).

Behavior:

1. Validates webhook signature with `SANITY_REVALIDATE_SECRET`
2. Validates body shape (`_id`, `_type`, optional `uri`)
3. Normalizes `_id` by removing `drafts.` prefix
4. Revalidates tags:
   - document type (`_type`)
   - document id (`doc:{id}`)
   - URI (if provided)

## Query Tag Strategy

Tags attached in queries should match webhook tags:

- Page metadata query tags URI in `app/(web)/[[...uri]]/page.tsx`
- Page sections query tags `doc:{docId}` in `features/page-builder/page-sections.tsx`
- Site query tags `site` in `app/(web)/layout.tsx`

Use explicit tags when content should refresh after webhook events.

## Caching Model

`features/sanity/client.ts` uses:

- `useCdn: true` in development
- `useCdn: false` in production

Non-live fetches use Next.js data cache (`force-cache`) plus explicit tags for invalidation. This setup keeps reads fast while allowing targeted cache busting.

## Redirects Are Build-Time

Redirects are fetched in `next.config.ts` inside `async redirects()`.

Implications:

- Updating redirects in Sanity does not hot-update a running build
- A rebuild/redeploy is required for redirect changes to apply
