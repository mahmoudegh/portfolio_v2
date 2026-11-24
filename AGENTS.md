# Portfolio V2 — Agent Instructions

<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

---

## 1. Project Overview

This repository contains Portfolio V2, a professional personal portfolio website for Mahmoud Galal, a frontend developer.

The goal is to present genuine professional experience, skills, projects, and contact information through a high-quality, performant, SEO-friendly website.

Deployment target: Vercel only.

### Project Priorities

Follow this priority order:

1. Performance and loading speed.
2. Technical SEO and search engine visibility.
3. Clean, maintainable architecture.
4. High-quality UI/UX and responsive design.
5. English and Arabic localization with correct RTL/LTR behavior.
6. Light and dark themes.
7. Accessibility and cross-browser compatibility.

Do not sacrifice performance, SEO, or maintainability for unnecessary visual effects or implementation convenience.

## 2. Technology Stack

Target stack:

- Next.js App Router.
- React.
- TypeScript.
- Tailwind CSS.
- Vercel deployment.

Use the existing project dependencies and configuration as the starting point.

Before making changes, inspect `package.json`, the lockfile, and installed package versions.

Do not assume the project uses the latest stable versions.

Follow the APIs and conventions supported by the actual installed versions.

Do not introduce another framework or build system.

## 3. Architecture and Next.js Conventions

### App Router

- Use Next.js App Router conventions.
- Organize routes, layouts, loading states, error boundaries, and metadata according to the installed Next.js version.
- Keep route-specific functionality close to the routes that use it.
- Use reusable components for genuinely shared functionality.
- Keep content/data definitions separate from presentation components.
- Avoid unnecessary abstraction and overengineering.
- Prefer straightforward, maintainable solutions.

### Server and Client Components

- Server Components are the default.
- Use Client Components only when browser APIs, interactive state, event handlers, or client-side libraries genuinely require them.
- Keep client boundaries as small as possible.
- Do not add `"use client"` to entire pages or layouts merely because one small component needs interactivity.
- Do not move essential portfolio content to client-side fetching.
- Avoid unnecessary hydration and client-side JavaScript.
- Do not use React Router. Use Next.js routing.

### Rendering Strategy

- Prefer static rendering and generation for content that does not require request-time data.
- Project listing and project detail pages should be statically generated where appropriate.
- Use dynamic rendering only when there is a real requirement.
- Do not introduce unnecessary API routes or backend infrastructure for static content.
- Avoid unnecessary runtime dependencies and server-side work.

### Data Architecture

- Keep portfolio content separate from UI components.
- Use strongly typed TypeScript data structures.
- Avoid duplicating content across components and localized pages.
- Design the content architecture to support English and Arabic.
- Preserve the distinction between content, presentation, and routing.
- Do not introduce a CMS unless explicitly approved.

## 4. Localization and Direction

Supported languages:

- English (`en`).
- Arabic (`ar`).

### Localization Requirements

- Use proper localized URLs and route handling.
- Keep language-specific content organized and maintainable.
- Ensure localized page equivalents exist when translations are available.
- Use the correct locale in navigation and internal links.
- Avoid mixing translated content directly into presentation logic.
- Do not rely on browser language detection alone to determine the current page language.

### RTL and LTR

- English pages must use LTR.
- Arabic pages must use RTL.
- Set the correct `lang` and `dir` attributes on the document root.
- Prefer logical CSS properties such as `margin-inline-start`, `padding-inline-end`, and `text-align: start`.
- Avoid hardcoded left/right positioning when layouts should adapt to direction.
- Verify navigation, icons, buttons, cards, forms, spacing, and responsive layouts in both directions.
- Do not treat RTL as simply mirroring the entire interface. Preserve the intended visual hierarchy and reading experience.

## 5. Theme Support

The website must support:

- Light theme.
- Dark theme.

Requirements:

- Provide a consistent design system for both themes.
- Avoid scattered hardcoded colors.
- Prefer centralized theme tokens and CSS variables.
- Prevent unnecessary theme flashes during initial page loading.
- Ensure readable contrast in both themes.
- Persist the user's theme preference using an appropriate mechanism.
- Respect system theme preferences when appropriate.
- Avoid introducing a large theme library for a simple theme toggle.

Theme functionality must not unnecessarily convert otherwise static Server Components into Client Components.

## 6. SEO Requirements

SEO is a primary project requirement.

### Metadata

- Use the Next.js Metadata API supported by the installed version.
- Provide unique, meaningful titles and descriptions for every indexable page.
- Implement canonical URLs.
- Implement correct `hreflang` alternates for English and Arabic.
- Include appropriate Open Graph metadata.
- Include Twitter/X card metadata.
- Ensure metadata is available in the initial HTML response.
- Avoid duplicate metadata across unrelated pages.

### Technical SEO

Implement and verify:

- `sitemap.xml`.
- `robots.txt`.
- Canonical URLs.
- Localized alternate URLs.
- Appropriate indexing directives.
- Semantic HTML.
- Correct heading hierarchy.
- Descriptive internal links.
- Meaningful image alt attributes.
- Proper document language and direction.
- Correct handling of unavailable localized pages.
- No accidental indexing of development, preview, or duplicate URLs.

### Structured Data

Use valid JSON-LD structured data where appropriate.

Potential schemas include:

- `Person`.
- `WebSite`.
- `WebPage`.
- `CreativeWork` or another appropriate project representation.

Requirements:

- Use accurate, verifiable information.
- Do not invent credentials, awards, clients, or professional affiliations.
- Avoid redundant or invalid structured data.
- Ensure structured data agrees with visible page content.

### Search Engine Rendering

- Essential content must exist in server-rendered HTML.
- Do not depend on JavaScript execution to expose the main page content.
- Ensure project descriptions and meaningful content are crawlable.
- Do not hide important SEO content behind client-only interactions.

## 7. Performance Requirements

Performance must be measured, not assumed.

### JavaScript

- Minimize client-side JavaScript.
- Avoid unnecessary dependencies.
- Avoid large libraries for simple functionality.
- Do not migrate the entire template dependency tree automatically.
- Prefer native browser capabilities and lightweight solutions when practical.
- Avoid unnecessary client-side data fetching.

### Images

- Audit all existing images before using them.
- Use Next.js Image optimization where appropriate.
- Prefer modern image formats when supported.
- Provide responsive image sizes.
- Specify dimensions or aspect ratios to prevent layout shifts.
- Lazy-load non-critical images.
- Prioritize important above-the-fold images.
- Use meaningful alt text.
- Avoid unnecessarily large source images.
- Do not introduce remote image sources without evaluating their reliability and performance.

### Fonts

- Prefer optimized local font loading where appropriate.
- Avoid unnecessary external font requests.
- Load only required font weights and subsets.
- Ensure Arabic typography is properly supported.
- Prevent font loading from causing significant layout shifts.

### Rendering and Loading

- Avoid unnecessary blocking resources.
- Avoid expensive animations and visual effects.
- Prevent layout shifts.
- Keep initial rendering fast.
- Optimize critical rendering paths.
- Use lazy loading and code splitting where they provide measurable benefits.

### Core Web Vitals

Pay particular attention to:

- LCP.
- INP.
- CLS.

Use Lighthouse and appropriate browser tools to measure performance.

Do not claim performance improvements without actual measurements.

## 8. Design and UI/UX

The purchased React/Vite template is a visual and functional reference, not the target application architecture.

Requirements:

- Study the template before implementing its design.
- Identify reusable design patterns and genuinely useful components.
- Rebuild components using the target Next.js architecture.
- Do not copy the original client-side architecture.
- Do not migrate unused UI components.
- Avoid preserving unnecessary template dependencies.
- Maintain visual consistency across pages.
- Ensure responsive behavior across mobile, tablet, and desktop.
- Preserve the intended design quality while improving usability and performance.

Do not blindly copy template demo content.

## 9. Content Accuracy and Data Integrity

The old portfolio contains the actual portfolio content and images.

The purchased template contains demonstration content.

These sources must never be confused.

### Content Rules

- Use genuine information from the old portfolio and information explicitly provided by the project owner.
- Do not invent projects, clients, awards, testimonials, skills, employment history, or achievements.
- Do not use template demo content as actual professional experience.
- Do not invent project descriptions or technologies.
- Preserve meaningful original project information.
- Flag missing or ambiguous information instead of making assumptions.
- Do not silently discard potentially important existing content.
- Keep image-to-project associations accurate.
- Preserve original image assets unless there is a clear reason to optimize or replace them.

If content needs rewriting, preserve its factual meaning.

If information is unavailable, ask for clarification or leave an explicit placeholder for review.

### Adding, Hiding, and Removing Projects

Project content is maintained in `content/projects.json`. Keep the related image assets and generated image manifests in sync whenever project data changes.

#### Add a project

1. Add one entry to `content/projects.json` with a unique `id` and `slug`, genuine name, category, status, alt text, links, visibility, localized company/date/description, and the existing image data shape. Do not invent missing details.
2. Add the project's original responsive screenshots under `public/images/projects/<slug>/`. Use the existing filenames `mobile.webp`, `tablet.webp`, `desktop.webp`, and `large-desktop.webp` where available. These are the source images; do not place generated crops here.
3. Generate the responsive card thumbnails and detail hero crops with `npm run images:generate`. This updates `public/images/project-card-thumbnails/`, `public/images/project-detail-hero/`, `src/data/project-card-image-manifest.json`, and `src/data/project-detail-hero-image-manifest.json`.
4. Check the new project's listing card and localized detail page. Confirm the image choice, crop, alt text, links, and share metadata use the correct project.

#### Hide a project

Set that project's `isVisible` to `false` in `content/projects.json`. Hidden projects are excluded from listings, detail routes, and generated image manifests. Keep its source images and content unless the owner explicitly asks to remove them; hiding is reversible.

#### Remove a project

Remove its entry from `content/projects.json`, then remove only that slug's source folder under `public/images/projects/<slug>/` when the project owner intends its original assets to be deleted. Run `npm run images:generate` to rebuild manifests and current generated crops. Review generated output before deleting any leftover files: the generator writes current assets and manifests but does not prune stale thumbnail or hero files. Never remove another project's assets or a shared image. Check links, routes, sitemap output, and the project listing after removal.

#### Image folder responsibilities

- `public/images/projects/`: original responsive screenshots grouped by project slug; edit these when replacing source screenshots.
- `public/images/project-card-thumbnails/`: generated responsive crops for project listing cards; do not edit by hand. Regenerate after changing source screenshots, card crop handling, or project visibility.
- `public/images/project-detail-hero/`: generated responsive crops for project detail pages and project share previews; do not edit by hand. Regenerate after changing source screenshots or project visibility.
- `src/data/project-card-image-manifest.json` and `src/data/project-detail-hero-image-manifest.json`: generated file maps consumed by the UI and metadata; do not hand-edit. Regenerate them with the image script.
- `src/data/site.ts`, `src/data/project-images.server.ts`, `src/components/work-listing.tsx`, and `app/[locale]/project/[slug]/page.tsx` contain the project's data mapping, image lookup, listing presentation, and detail page/metadata. Edit these only when the data shape, image behavior, or page behavior needs to change; keep all supported locales in sync.

## 10. Accessibility

Follow WCAG accessibility principles.

Requirements include:

- Semantic HTML.
- Keyboard-accessible navigation and controls.
- Visible focus indicators.
- Appropriate ARIA attributes when necessary.
- Correct labels for forms and inputs.
- Sufficient color contrast.
- Meaningful alt text.
- Accessible dialogs and menus.
- Reduced-motion support.
- Appropriate heading hierarchy.
- Accessible theme and language controls.

Do not use ARIA attributes as a substitute for correct semantic HTML.

Verify accessibility in both light/dark themes and RTL/LTR layouts.

## 11. Dependency Management

Be conservative when adding dependencies.

Before installing any package:

1. Determine whether the functionality already exists in the project.
2. Check whether native browser or Next.js functionality is sufficient.
3. Evaluate bundle size and maintenance status.
4. Confirm compatibility with installed React and Next.js versions.
5. Consider whether the package introduces unnecessary client-side JavaScript.
6. Explain why the dependency is needed.

Do not install all dependencies from the purchased template.

Do not add multiple libraries that solve the same problem.

Do not upgrade unrelated packages without a clear reason.

Preserve the existing package manager and lockfile.

## 12. Coding Standards

- Use TypeScript consistently.
- Avoid `any` unless there is a justified reason.
- Prefer explicit and maintainable types.
- Keep components focused and reusable.
- Avoid excessively large components.
- Use descriptive naming.
- Avoid duplicated logic.
- Keep configuration centralized where appropriate.
- Avoid unnecessary comments and abstractions.
- Handle errors explicitly.
- Avoid suppressing TypeScript or ESLint errors without justification.
- Do not introduce unnecessary state.
- Follow the repository's existing formatting and linting conventions.
- Use the installed Next.js documentation before relying on potentially outdated APIs.

## 13. Testing and Verification

Do not consider a task complete merely because the application compiles.

Use the verification tools available in the project.

Depending on the changes, verify:

- TypeScript checks.
- ESLint.
- Production build.
- Route availability.
- Localized routes.
- English LTR layout.
- Arabic RTL layout.
- Light and dark themes.
- Navigation and interactive elements.
- Project listing and detail pages.
- Metadata and canonical URLs.
- Sitemap and robots.txt.
- Structured data.
- Image loading and optimization.
- Responsive layouts.
- Accessibility.
- Performance using Lighthouse or equivalent tools.

Do not claim that something was tested unless the test was actually executed.

Clearly distinguish between:

- Implemented.
- Tested successfully.
- Not tested.
- Known limitations.
- Issues requiring manual review.

## 14. Vercel Deployment

Vercel is the only deployment target.

Requirements:

- Maintain compatibility with Vercel's Next.js deployment environment.
- Do not configure static export using `output: "export"`.
- Use appropriate Next.js rendering and image optimization capabilities.
- Avoid assumptions about a separate custom server.
- Keep environment variables secure.
- Never commit secrets or credentials.
- Ensure production builds work before deployment.
- Consider production URL configuration when generating canonical URLs and sitemap entries.
- Do not introduce deployment-specific complexity without a clear requirement.

## 15. Development Workflow

Before making significant changes:

1. Inspect the relevant project files.
2. Read the installed Next.js documentation relevant to the task.
3. Understand existing architecture and dependencies.
4. Identify possible regressions and implementation risks.
5. Propose the approach when architectural decisions are involved.
6. Implement in small, logically separated steps.
7. Run appropriate verification after changes.
8. Report exactly what changed and what was verified.

Do not start large-scale refactoring without first understanding the existing project.

Do not overwrite or delete existing files or content without understanding their purpose.

Avoid unrelated changes.

When uncertain about an important architectural or content decision, ask before proceeding.

## 16. Project Constraints

- Repository: `portfolio_v2`.
- Main branch: `main`.
- Deployment: Vercel.
- Website languages: English and Arabic.
- Themes: Light and Dark.
- Main content source: Old portfolio data and assets.
- Design reference: Purchased React/Vite portfolio template.
- Target architecture: Next.js App Router.

The project must remain focused on presenting genuine professional work with excellent performance, SEO, maintainability, and user experience.

**Final principle:** Do not optimize for writing the least code or completing the migration as quickly as possible. Optimize for building the correct, maintainable, production-ready portfolio.

<!-- BEGIN:nextjs-agent-feedback -->

## Report Next.js feedback

The project owner enabled `experimental.agentFeedback`, authorizing this feedback pass. When enabled, `next dev` writes this block and restores it if removed. Commit `AGENTS.md` with your work to keep the tree clean.

During the current user request, retain anonymized facts as feedback candidates for meaningful or recurring Next.js issues:

- Crashes, hangs, OOMs, or unexpected slowness
- Incorrect behavior, output, errors, or diagnostics
- Missing, unclear, or conflicting documentation
- Unexpected CLI, codemod, Skill, or upgrade behavior and non-obvious workarounds

Continue the current user request without reporting immediately. Routine debugging is not feedback. Verify changes before retaining them as feedback candidates. Never retain code, logs, paths, URLs, secrets, personal information, or project-specific data.

Retain qualifying friction even if it is later fixed or worked around; record the final outcome during the reporting pass.

Before the final response, run one reporting pass. If candidates remain, from this file's directory run `npx --no-install next internal agent-feedback-instructions` once without piping or truncating its output. Follow its output or error guidance. If a network sandbox blocks it, retry with network access; if it still returns no output, continue normally.

<!-- END:nextjs-agent-feedback -->
