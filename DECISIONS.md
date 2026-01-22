# Architecture Decisions & Tradeoffs

## 1. Monorepo Structure (Backend + Frontend Separated)

**Decision:** Keep `RSM-BE` (Laravel) and `RSM-FE` (React) in separate folders within one repository.

**Why:**

- Easy to run both locally with separate dev servers
- Clear separation of concerns
- Can deploy backend/frontend independently
- Simple for small teams

**Tradeoffs:**

- ✅ **Pros:** Easy local development, clear boundaries, independent deployments
- ❌ **Cons:** More complex CI/CD setup, can't share code between BE/FE directly
- **Alternative:** Separate repositories (overkill for small projects)

---

## 2. Sanctum for Authentication (Not JWT/Passport)

**Decision:** Use Laravel Sanctum with token-based auth.

**Why:**

- Simpler than Passport (no OAuth2 complexity)
- Built-in CSRF protection for SPAs
- Stateful + stateless auth options
- First-party Laravel package

**Tradeoffs:**

- ✅ **Pros:** Simple, secure, officially supported
- ❌ **Cons:** Less flexible than OAuth2, tokens stored in database
- **Alternative:** JWT (stateless but requires more security work)

---

## 3. Service Layer Pattern for Business Logic

**Decision:** Extract business logic into Service classes (e.g., `CustomerImportService`, `WorkOrderImportService`).

**Why:**

- Controllers stay thin (only handle HTTP)
- Business logic is reusable (API, console, queue)
- Easier to test in isolation
- Clearer separation of concerns

**Tradeoffs:**

- ✅ **Pros:** Testable, reusable, maintainable, clear responsibility
- ❌ **Cons:** More files/classes to manage, slight learning curve
- **Alternative:** Fat controllers (simpler but harder to maintain)

---

## 4. Permission-Based Authorization (Spatie Laravel-Permission)

**Decision:** Use Spatie's role/permission package instead of building custom.

**Why:**

- Battle-tested, used by thousands of projects
- Flexible permission system (role-based + direct permissions)
- Well-documented, active maintenance
- Gates/policies integration

**Tradeoffs:**

- ✅ **Pros:** Mature, flexible, saves development time
- ❌ **Cons:** External dependency, overkill for simple role checks
- **Alternative:** Custom roles table (more work, less flexible)

---

## 5. API Resources for Data Transformation

**Decision:** Use Laravel API Resources (`WorkOrderResource`, `CustomerResource`) instead of returning models directly.

**Why:**

- Control exactly what data is exposed
- Transform data consistently (dates, relationships)
- Hide sensitive fields (passwords, tokens)
- Easy to version API responses

**Tradeoffs:**

- ✅ **Pros:** Security, consistency, flexibility, API versioning
- ❌ **Cons:** Extra boilerplate, slightly more code
- **Alternative:** Return models directly (risky, exposes everything)

---

## 6. CSV Import Architecture (Service + Controller)

**Decision:** Separate CSV parsing logic into dedicated service classes with flexible header mapping.

**Why:**

- Complex business logic doesn't belong in controller
- Header normalization allows various CSV formats
- Easy to add new import types (just add service)
- Reusable for CLI/queue jobs

**Tradeoffs:**

- ✅ **Pros:** Flexible, reusable, testable, user-friendly
- ❌ **Cons:** More code than simple CSV read, memory usage for large files
- **Alternative:** Simple `fgetcsv()` in controller (rigid, not reusable)

---

## 7. TanStack Query for Frontend State Management

**Decision:** Use TanStack Query (React Query) for server state, React hooks for UI state.

**Why:**

- Automatic caching and refetching
- Built-in loading/error states
- Reduces boilerplate compared to Redux
- Perfect for API-driven apps

**Tradeoffs:**

- ✅ **Pros:** Less code, automatic optimizations, great DX
- ❌ **Cons:** Learning curve, another dependency
- **Alternative:** Redux (more control but way more boilerplate)

---

## 8. Tailwind CSS for Styling

**Decision:** Use Tailwind CSS 4.x utility classes instead of CSS modules or styled-components.

**Why:**

- Rapid development with utility classes
- Consistent design system out of the box
- No CSS file switching
- Purged CSS = tiny production bundle

**Tradeoffs:**

- ✅ **Pros:** Fast development, small bundle, consistent design
- ❌ **Cons:** Verbose HTML classes, Tailwind 4.x migration needed
- **Alternative:** CSS Modules (more files, slower development)

---

## Summary of Core Principles

1. **Separation of Concerns**: Services for logic, controllers for HTTP, resources for data transformation
2. **Security First**: Sanctum auth, API resources hide sensitive data, permission checks everywhere
3. **Developer Experience**: TanStack Query, Tailwind CSS, clear folder structure
4. **Maintainability**: Service layer, eager loading, consistent patterns
5. **Pragmatism**: Use battle-tested packages (Spatie, Sanctum) instead of reinventing

---

## When to Revisit These Decisions

- **10,000+ work orders**: Add database indexes, implement caching
- **Multiple tenants**: Add multi-tenancy architecture
- **Team grows**: Consider adding TypeScript for type safety
