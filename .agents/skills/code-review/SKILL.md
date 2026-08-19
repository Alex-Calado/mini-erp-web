---
name: code-review
description: Code review skill focusing on correctness, edge cases, security, data integrity, performance, architecture, and explicit evidence.
---

# Code Review Skill

When performing code reviews, evaluate the codebase against the following core criteria:

1. **Correctness**: Ensure code meets functional requirements, handles business logic accurately, and has no syntax or logical flaws.
2. **Edge Cases**: Identify boundary conditions, missing error handlers, null/undefined checks, and unexpected user inputs.
3. **Security**: Audit for vulnerabilities such as price tampering, unauthenticated route access, secret exposure, and input sanitization issues.
4. **Data Integrity**: Verify atomic database operations (e.g., Prisma transactions), index coverage, schema constraints, and prevention of race conditions.
5. **Performance**: Ensure efficient database queries (e.g., avoiding N+1 queries or full-table memory loads), proper server/client component boundaries, and lean bundle size.
6. **Architecture**: Enforce clear separation of concerns, keep business logic out of presentation components, and comply with project architecture guidelines.
7. **Explicit Evidence**: Support all review findings with concrete file links, line references, command outputs, or error tracebacks rather than speculative assertions.
