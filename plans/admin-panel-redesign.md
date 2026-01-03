# Plan: Admin Panel Redesign

## 0. Metadata
- Status: draft
- Owner: Cascade AI
- Created: 2025-12-21
- Last updated: 2025-12-21
- Related: Admin UI refresh initiative

## 1. Goal
Create a cohesive, mobile-first admin experience with a persistent sidebar, streamlined header, and polished dashboard/home blocks while keeping existing Convex-powered forms functional.

## 2. Non-goals (out of scope)
- Reworking backend Convex mutations/queries.
- Introducing new admin features beyond layout/UI polish.
- Changing authentication/authorization flows.

## 3. Requirements
### Functional
- Provide a left sidebar navigation with dashboard, orders, categories, products, and a view-store CTA.
- Replace the top-only nav with a new layout that keeps key actions accessible on mobile via a sheet/drawer.
- Refresh the admin home page with hero metrics + quick links without breaking existing cards on other sections.
- Ensure existing Orders/Categories/Products pages inherit the new layout without regressions.

### Non-functional
- Performance: No noticeable regressions; avoid heavy new dependencies.
- Security/Privacy: Maintain AdminGate protections.
- Reliability: Layout should gracefully handle loading states already in place.
- Compatibility: Support mobile-first breakpoints and large desktop screens via Tailwind utilities.

## 4. Assumptions & Open Questions
### Assumptions
- Current shadcn/ui + Tailwind stack remains the base.
- Sidebar primitive in `components/ui/sidebar.tsx` can be leveraged.
- Dashboard hero metrics will initially use curated placeholder data with clear labels. When we want real counts we can wire the existing Convex hooks (orders, products) into lightweight summary components without schema changes.

### Open questions
- _Resolved_: Metrics launch with placeholders. Real data requires follow-up task to create read-only Convex summary queries (orders today, low stock) but is outside this redesign to avoid backend scope creep.

## 5. Proposed Approach
### Architecture / design sketch
- Introduce an `AdminShell` composition: `<Sidebar + Main>` anchored in `app/admin/layout.tsx`.
- Build `AdminSidebar` (desktop) + sheet-triggered mobile nav that reuses nav config.
- Replace `AdminTopNav` with a lighter header component that includes breadcrumb/title and action slots.
- Redesign `/admin/page.tsx` with hero metrics grid, quick links, and activity section using Cards.

### Interfaces & contracts
- APIs: Reuse existing Convex hooks; add lightweight summary hooks only if needed later.
- DB schema: Untouched.
- Events/queues: None.
- Errors: Rely on existing toast/spinner patterns.

## 6. Work Breakdown (ordered)
1. Introduce shared nav config + icons for admin sections (new constants file or within sidebar component).
2. Build `AdminSidebar` + mobile sheet using shadcn sidebar primitive; wire into `app/admin/layout.tsx`.
3. Create new `AdminHeader` component for page titles/CTA area, refactor existing pages to use it.
4. Redesign `/admin` dashboard: hero metrics grid, quick actions, recent activity list (ship with labeled placeholder data; add real summaries in a future task if desired).
5. Update Orders/Categories/Products pages to fit within the new shell (spacing, header usage) and ensure responsiveness.
6. QA pass (mobile + desktop), update `/docs/admin-panel.md` or new doc, add regression notes/tests if needed.

## 7. Testing & Validation
- Unit: N/A (component-level visual check).
- Integration: Ensure Convex data hooks still render inside new layout.
- E2E: Manual verification of navigation + page interactions.
- Manual QA checklist:
  - Sidebar collapses on mobile into sheet.
  - Navigation highlights current route.
  - All existing forms (products/categories) remain functional.
  - Dashboard hero cards responsive.
- Success metrics: Zero layout regressions reported; smoother navigation feedback from stakeholders.

## 8. Rollout / Migration / Rollback
- Migrations/backfills: None.
- Feature flags: Not needed; change is UI-only but can be gated via branch deploy.
- Monitoring/alerts: Rely on manual QA + user feedback.
- Rollback steps: Revert layout and component changes to previous version.

## 9. Risks & Mitigations
- Risk: Sidebar integration breaks existing padding/layout -> Mitigation: implement in layout wrapper with progressive enhancement.
- Risk: Dashboard metrics require backend changes -> Mitigation: start with placeholder counts using existing data or static copy.
- Risk: Mobile sheet conflicts with existing components -> Mitigation: reuse tested shadcn sheet patterns and test on small screens early.

## 10. Change Log
- 2025-12-21: Created plan (initial draft for admin panel redesign).
