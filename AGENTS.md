<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

<!-- BEGIN:visual-theme-rules -->
# Visual theme rules

Use a black/zinc base with cyan as the primary accent for Agent DNS UI. Avoid neon green, lime, emerald, or terminal-green accents such as `#00ff41`; authentication states, error states, borders, and status labels should stay in the cyan/zinc family unless a user explicitly requests a different palette.
<!-- END:visual-theme-rules -->

<!-- BEGIN:asset-management-rules -->
# Asset management rules

Keep the root `public` directory free of loose visual assets.

- Store raster or high-resolution image files such as `.webp`, `.png`, `.jpg`, `.jpeg`, `.avif`, and `.gif` in `public/images`.
- Reference public raster images from code with `/images/{filename}` paths, for example `src="/images/hero.webp"`.
- Do not add new SVG files to `public` for UI icons or marks. Convert SVGs into typed React components under `app/components/icons`.
- Icon components must import `SVGProps` from `react`, accept `SVGProps<SVGSVGElement>`, and forward props to the root `<svg>`.
- Prefer `fill="currentColor"` or `stroke="currentColor"` inside SVG components so Tailwind text color utilities can style icons dynamically.
- Export reusable icon components from `app/components/icons/index.ts`.
- When replacing an SVG asset that was previously used through `<img>` or `next/image`, import and render the React icon component instead.
<!-- END:asset-management-rules -->
