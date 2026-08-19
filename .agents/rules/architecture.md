# Architecture Rules

- Use Next.js App Router and TypeScript.
- Default to Server Components.
- Use Client Components only for browser interaction/state.
- Database access must remain server-side.
- Validate all mutations with Zod on the server.
- Do not trust totals, prices, authorization or identifiers from the browser.
- Use Prisma transactions for multi-step atomic writes.
- Keep business rules outside presentation components.
- Do not create generic repositories, generic CRUD frameworks or new dependencies
  without explaining the concrete benefit.
- Never expose environment variables or secrets.
- Before broad changes, present a plan.
- After changes, run lint, tests and build.
