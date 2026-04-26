<!-- BEGIN:nextjs-agent-rules -->
# Next.js 16: ALWAYS read docs before coding

Before any Next.js work, find and read the relevant doc in `node_modules/next/dist/docs/`. Your training data is outdated — the docs are the source of truth.

## 🚀 Next.js 16 Cheat Sheet for Agents

Next.js 16 introduced several major breaking changes. Follow these rules strictly:

### 1. Async Request APIs (CRITICAL)
The following APIs are now **Promises** and MUST be awaited. Synchronous access is removed.
- `params` and `searchParams` in Pages/Layouts.
- `cookies()`, `headers()`, `draftMode()`.

**Example Page:**
```tsx
export default async function Page(props: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { slug } = await props.params;
  const searchParams = await props.searchParams;
  return <div>{slug}</div>;
}
```

### 2. File Renaming: `middleware` -> `proxy`
- Rename `middleware.ts` to `proxy.ts`.
- Rename the exported function `middleware` to `proxy`.
- Note: `proxy` runs in Node.js runtime by default, NOT Edge.

### 3. Caching Changes
- `revalidateTag(tag, cacheLife)` now requires a second argument (e.g., `'max'`, `'default'`).
- Use `updateTag(tag)` for "read-your-writes" (immediate refresh) in Server Actions.
- `cacheLife` and `cacheTag` are stable (no `unstable_` prefix).

### 4. Configuration
- `turbopack` is now a top-level option in `next.config.ts`.
- `experimental.dynamicIO` is now `cacheComponents: true`.
- `next lint` is removed; use the ESLint CLI directly.

### 5. Metadata & Icons
- `Image` generation functions in `opengraph-image.tsx`, etc., now receive `params` and `id` as Promises.

## 🛠 Project Context
- This project uses **React 19.2** (includes View Transitions, `useEffectEvent`).
- UI Components are built with **Base UI** and **Tailwind CSS 4**.
- Always use `cn()` utility for class merging.
<!-- END:nextjs-agent-rules -->
