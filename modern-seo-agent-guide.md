# Modern SEO Guide 2026
> Machine-readable guide for AI coding agents. Implement everything here in one pass.
> Stack assumed: Next.js App Router (or any SSR framework). Adapt as needed.

---

## Mental Model First

SEO in 2026 has three layers working in parallel:

| Layer | Goal | Where it shows up |
|---|---|---|
| **Traditional SEO** | Rank in Google/Bing blue links | Search result pages |
| **AEO** (Answer Engine Optimization) | Get cited in AI Overviews, featured snippets | Google AI Mode, Bing Copilot |
| **GEO** (Generative Engine Optimization) | Get cited by ChatGPT, Perplexity, Claude | LLM-powered answer engines |

All three share the same foundation. Fix the foundation, all three improve.

---

## LAYER 1 — TECHNICAL SEO FOUNDATION

### 1.1 Crawlability & Indexing

**robots.txt** — place at `/public/robots.txt` or generate dynamically:

```
User-agent: *
Allow: /
Disallow: /api/
Disallow: /admin/
Disallow: /_next/

# AI search crawlers — allow for citation (retrieval)
User-agent: GPTBot
Allow: /
User-agent: OAI-SearchBot
Allow: /
User-agent: ClaudeBot
Allow: /
User-agent: anthropic-ai
Allow: /
User-agent: PerplexityBot
Allow: /
User-agent: Google-Extended
Allow: /

# Block AI training scrapers only (not search/citation bots)
User-agent: CCBot
Disallow: /

Sitemap: https://yourdomain.com/sitemap.xml
Sitemap: https://yourdomain.com/llms.txt
```

> **Key distinction**: Allow `GPTBot`/`ClaudeBot`/`PerplexityBot` (they power search citation).
> Block `CCBot` (Common Crawl — bulk training data, not search).

**Next.js dynamic robots.ts**:
```typescript
// app/robots.ts
import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: '*', allow: '/', disallow: ['/api/', '/admin/'] },
      { userAgent: 'CCBot', disallow: '/' },
    ],
    sitemap: 'https://yourdomain.com/sitemap.xml',
  }
}
```

---

### 1.2 Sitemap

Generate dynamically — never static. Static sitemaps go stale.

```typescript
// app/sitemap.ts
import type { MetadataRoute } from 'next'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://yourdomain.com'

  // fetch dynamic routes from DB/CMS
  const tools = await getTools() // your data fetcher
  const toolUrls = tools.map((tool) => ({
    url: `${baseUrl}/tools/${tool.slug}`,
    lastModified: tool.updatedAt,
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }))

  return [
    { url: baseUrl, lastModified: new Date(), changeFrequency: 'daily', priority: 1.0 },
    { url: `${baseUrl}/submit`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.9 },
    { url: `${baseUrl}/about`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
    ...toolUrls,
  ]
}
```

**Priority scale:**
- `1.0` → homepage
- `0.9` → core CTA pages (submit, pricing)
- `0.8` → category/listing pages
- `0.6` → individual content pages
- `0.4` → utility pages (tags, filters)

---

### 1.3 llms.txt — AI Context File

Place at `/public/llms.txt` or generate dynamically at `/llms.txt`.

**What it is:** robots.txt for LLMs — tells AI systems what your site is about.
**Reality check:** Major crawlers don't fully respect it yet (May 2026). Still ship it — it's a half-day of work, IDEs like Cursor already use it, and it'll matter more over time.

```
# SassyMartie
> Directory for founders building AI-powered SaaS tools — the weird, the wild, the indie-built.

## About
SassyMartie helps indie hackers and solo builders list their AI SaaS tools and get discovered by real users. No pitch decks, no VC required. Just real products and real traffic.

## Audience
Millennial, Gen Z, and Gen Alpha builders. Digital natives shipping AI products.

## Core pages
- [Homepage](https://sassymartie.com): Browse listed AI tools
- [Submit](https://sassymartie.com/submit): List your tool
- [Hub](https://sassymartie.com/hub): Builder tools and resources
- [About](https://sassymartie.com/about): Mission and story

## Content
Listings updated daily. Tools categorized by type, stage, and use case.

## Crawling
This site welcomes indexing by AI crawlers, search engines, and LLM citation systems.
Re-crawl recommended every 24 hours for fresh listings.

## Contact
Site: https://sassymartie.com | Submit: https://sassymartie.com/submit
```

Also generate `/llms-full.txt` with your N most recent listings in markdown format.

---

### 1.4 Core Web Vitals

**2026 targets (75th percentile, mobile):**

| Metric | Target | Fail threshold | What it measures |
|---|---|---|---|
| **LCP** | < 2.5s | > 4.0s | Largest content loads |
| **INP** | < 200ms | > 500ms | Response to any interaction |
| **CLS** | < 0.1 | > 0.25 | Layout shift during load |
| **TTFB** | < 800ms | — | Server response time |

**INP is the most commonly failed in 2026.** Fix it by:
- Breaking up long JS tasks with `scheduler.yield()`
- Using React Suspense to avoid blocking the main thread
- Lazy loading heavy components
- Auditing third-party scripts (analytics, chat widgets)

**LCP fix checklist:**
```html
<!-- Preload your hero image/LCP candidate -->
<link rel="preload" as="image" href="/hero.webp" fetchpriority="high" />

<!-- Use fetchpriority on the img tag -->
<img src="/hero.webp" fetchpriority="high" alt="..." width="1200" height="630" />

<!-- Use next-gen formats -->
<!-- Always serve WebP or AVIF. Never raw PNG/JPG for large images. -->
```

**CLS fix:**
- Always set explicit `width` and `height` on all images
- Reserve space for dynamic content with CSS `aspect-ratio`
- Avoid injecting content above existing content

---

### 1.5 Rendering Strategy

**Critical for AI search**: Most AI crawlers do NOT execute JavaScript. If your content depends on client-side JS to render, AI systems like Perplexity, ChatGPT Search, and Google AI Overviews will not see it.

**Rule:** Core content (titles, descriptions, listings, prices) must be in the server-rendered HTML.

```typescript
// GOOD — content in server HTML, AI can read it
// app/tools/[slug]/page.tsx
export default async function ToolPage({ params }) {
  const tool = await getToolBySlug(params.slug) // server-side
  return (
    <article>
      <h1>{tool.name}</h1>
      <p>{tool.description}</p>
    </article>
  )
}

// BAD — content loaded client-side, invisible to AI crawlers
'use client'
export default function ToolPage() {
  const [tool, setTool] = useState(null)
  useEffect(() => { fetchTool().then(setTool) }, []) // AI sees nothing
  return <div>{tool?.description}</div>
}
```

**Preferred architecture for dynamic content:** ISR (Incremental Static Regeneration) with `revalidate`.

```typescript
// app/tools/page.tsx
export const revalidate = 3600 // rebuild every hour

export default async function ToolsPage() {
  const tools = await getTools() // pre-rendered, fast, fresh-ish
  return <ToolList tools={tools} />
}
```

---

### 1.6 HTTPS & Security

- HTTPS is a confirmed ranking factor since 2014. Non-negotiable.
- Ensure no mixed content (HTTP assets on HTTPS pages)
- Add security headers: `X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`

```typescript
// next.config.js
const securityHeaders = [
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
]
```

---

## LAYER 2 — ON-PAGE SEO

### 2.1 Meta Tags — Full Implementation

```typescript
// app/tools/[slug]/page.tsx
import type { Metadata } from 'next'

export async function generateMetadata({ params }): Promise<Metadata> {
  const tool = await getToolBySlug(params.slug)

  return {
    // Title: primary keyword first, brand last, under 60 chars
    title: `${tool.name} — ${tool.tagline} | SassyMartie`,

    // Description: 120-160 chars, includes keyword, has CTA
    description: `${tool.description.slice(0, 130)}. Discover it on SassyMartie.`,

    // Canonical — always self-referencing
    alternates: {
      canonical: `https://sassymartie.com/tools/${tool.slug}`,
    },

    // Open Graph — for social sharing
    openGraph: {
      title: tool.name,
      description: tool.description.slice(0, 200),
      url: `https://sassymartie.com/tools/${tool.slug}`,
      siteName: 'SassyMartie',
      images: [
        {
          url: tool.ogImage || 'https://sassymartie.com/og-default.png',
          width: 1200,
          height: 630,
          alt: `${tool.name} — ${tool.tagline}`,
        },
      ],
      type: 'website',
    },

    // Twitter Card
    twitter: {
      card: 'summary_large_image',
      title: tool.name,
      description: tool.description.slice(0, 200),
      images: [tool.ogImage || 'https://sassymartie.com/og-default.png'],
    },

    // Robots — default: index, follow
    robots: {
      index: true,
      follow: true,
      googleBot: { index: true, follow: true, 'max-snippet': -1 },
    },
  }
}
```

**Title tag rules:**
- Under 60 characters (Google truncates at ~60)
- Primary keyword as close to the start as possible
- Brand name at the end, separated by `—` or `|`
- Every page has a unique title

**Description rules:**
- 120–160 characters
- Contains the primary keyword naturally
- Has a soft call to action
- Every page has a unique description
- Does NOT directly affect rankings — affects click-through rate

---

### 2.2 Heading Hierarchy

```html
<!-- One H1 per page — contains primary keyword -->
<h1>AI SaaS Directory for Indie Hackers</h1>

<!-- H2s for main sections -->
<h2>Recently Listed Tools</h2>
<h2>Top Categories</h2>
<h2>How It Works</h2>

<!-- H3s for subsections under H2 -->
<h3>Productivity Tools</h3>
<h3>Content Creation</h3>
```

Rules:
- One and only one `<h1>` per page
- Don't skip levels (no H1 → H3)
- Include target keyword in H1 naturally
- H2s should reflect what users scan for

---

### 2.3 URL Structure

Good URLs are short, descriptive, and keyword-rich.

```
✅ sassymartie.com/tools/notion-ai-assistant
✅ sassymartie.com/categories/productivity
✅ sassymartie.com/blog/how-to-list-your-ai-saas

❌ sassymartie.com/tools?id=12345
❌ sassymartie.com/t/na-assistant-v2-final-FINAL
❌ sassymartie.com/page/123
```

Rules:
- Lowercase only
- Hyphens to separate words (not underscores)
- Descriptive, not ID-based
- Under 75 characters where possible
- Stable — changing URLs loses link equity

---

### 2.4 Image SEO

```tsx
import Image from 'next/image'

// Every meaningful image needs descriptive alt text
<Image
  src="/tool-screenshot.webp"
  alt="Screenshot of NotionAI assistant generating a weekly plan"
  width={1200}
  height={800}
  // For LCP candidate image:
  priority={true}
  // For non-critical images:
  loading="lazy"
/>
```

**File naming:** `tool-name-feature-screenshot.webp` not `IMG_2047.jpg`
**Formats:** WebP (default), AVIF (best compression). Never raw PNG/JPG for large images.
**Alt text:** Describe what's in the image as if explaining to someone who can't see it. Includes keyword where natural. Empty alt for decorative images: `alt=""`

---

### 2.5 Internal Linking

Internal links distribute authority and help crawlers discover pages.

```tsx
// Tool listing page — link to individual tools
<Link href={`/tools/${tool.slug}`}>{tool.name}</Link>

// Blog post — link to related tools
<p>
  If you're building an AI writing assistant, check out{' '}
  <Link href="/categories/writing">writing tools on SassyMartie</Link>.
</p>
```

**Rules:**
- Every important page should have at least 3 internal links pointing to it
- Anchor text should be descriptive (not "click here")
- Homepage and submit page should be linked from everywhere
- No orphan pages (pages with zero internal links)
- Link from high-authority pages to important new pages

---

## LAYER 3 — STRUCTURED DATA (SCHEMA)

Structured data is the bridge between traditional SEO and AI citations.
In 2026, it's how AI Overviews and answer engines decide what to cite.
Always use JSON-LD. Always validate with Google's Rich Results Test.

### 3.1 Organization Schema (site-wide)

```typescript
// app/layout.tsx
const organizationSchema = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'SassyMartie',
  url: 'https://sassymartie.com',
  logo: 'https://sassymartie.com/logo.png',
  description: 'Directory for founders building AI-powered SaaS tools',
  sameAs: [
    'https://twitter.com/sassymartie',
    // add other official profiles
  ],
}

// In layout:
<script
  type="application/ld+json"
  dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
/>
```

---

### 3.2 SoftwareApplication Schema (tool listing pages)

```typescript
// app/tools/[slug]/page.tsx
function ToolSchema({ tool }) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: tool.name,
    description: tool.description,
    url: tool.websiteUrl,
    applicationCategory: tool.category,
    operatingSystem: 'Web',
    offers: {
      '@type': 'Offer',
      price: tool.price || '0',
      priceCurrency: 'USD',
    },
    aggregateRating: tool.rating
      ? {
          '@type': 'AggregateRating',
          ratingValue: tool.rating,
          ratingCount: tool.ratingCount,
        }
      : undefined,
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}
```

---

### 3.3 BreadcrumbList Schema

```typescript
function BreadcrumbSchema({ items }: { items: { name: string; url: string }[] }) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}

// Usage:
<BreadcrumbSchema items={[
  { name: 'Home', url: 'https://sassymartie.com' },
  { name: 'Productivity', url: 'https://sassymartie.com/categories/productivity' },
  { name: tool.name, url: `https://sassymartie.com/tools/${tool.slug}` },
]} />
```

---

### 3.4 FAQPage Schema (high GEO value)

FAQ schema directly feeds into Google AI Overviews and answer engines.
Add to landing pages, about page, and any page with Q&A content.

```typescript
function FAQSchema({ faqs }: { faqs: { question: string; answer: string }[] }) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}
```

---

### 3.5 Schema Drift — Avoid This

Schema drift = JSON-LD data contradicts visible page content. Kills trust with AI systems.

```typescript
// BAD — schema says InStock but DOM might say "Sold Out" from async update
const schema = { offers: { availability: 'https://schema.org/InStock' } }

// GOOD — derive schema from same source of truth as the UI
const schema = {
  offers: {
    availability: tool.available
      ? 'https://schema.org/InStock'
      : 'https://schema.org/OutOfStock',
  },
}
```

---

## LAYER 4 — CONTENT FOR AI CITATION

### 4.1 BLUF Formatting (Bottom Line Up Front)

AI systems skim for the answer. Put it first, then explain.

```markdown
❌ SEO-unfriendly structure:
"In this article, we will explore the concept of AI SaaS directories, 
their history, and eventually get to why SassyMartie exists..."

✅ AI-friendly BLUF structure:
"SassyMartie is a free directory where indie hackers list AI-powered SaaS tools 
to get discovered by users and builders.

Here's how it works: [explanation follows]"
```

**BLUF applied to page sections:**
- Answer the implied question in the first sentence of each section
- Use subheadings that are themselves answerable questions
- Avoid preamble, filler, and throat-clearing

---

### 4.2 Content Structure for AI Extraction

```markdown
## What is SassyMartie?

SassyMartie is a free AI SaaS directory for indie hackers and solo builders. 
It lists AI-powered tools across categories including productivity, content creation, 
and developer tools.

**Founded:** 2026  
**Focus:** AI SaaS tools by solo builders  
**Free to list:** Yes  
**URL:** sassymartie.com/submit

## Who is it for?

Founders and builders who want real users to find their tools without running ads 
or going through VC-gated marketplaces.
```

Why this works:
- Key facts are explicit and extractable
- Bolded data points are easy for AI to parse
- No ambiguity about what the page is about
- Answers the "what, who, how" quickly

---

### 4.3 E-E-A-T Signals (Experience, Expertise, Authoritativeness, Trust)

For a directory platform:

- **Experience:** Show real builder stories, real tool launches, real community activity
- **Expertise:** Publish guides written from experience ("How we built the cropper tool")
- **Authority:** Get mentioned on Product Hunt, Indie Hackers, Hacker News, dev blogs
- **Trust:** Real contact info, transparent about what SassyMartie is and isn't, no fake reviews

---

### 4.4 Topic Clusters for Semantic Authority

Don't write random blog posts. Build clusters around core topics.

```
Core topic: AI SaaS for indie hackers
  ├── How to list your AI tool (pillar page)
  │     ├── Best practices for writing tool descriptions
  │     ├── How to pick your category
  │     └── Getting your first 100 users from directories
  ├── Building AI tools solo (pillar page)
  │     ├── Vibe coding for non-engineers
  │     ├── Shipping fast vs building right
  │     └── Tools every solo AI builder uses
  └── AI SaaS directory comparison (pillar page)
        ├── SassyMartie vs Product Hunt
        ├── SassyMartie vs IndieHackers
        └── Best places to list your AI SaaS in 2026
```

Internal links must connect all cluster articles back to the pillar and to each other.

---

## LAYER 5 — PERFORMANCE & MONITORING

### 5.1 Essential Setup Checklist

- [ ] Google Search Console connected and verified
- [ ] Bing Webmaster Tools connected (Bing powers ChatGPT Search)
- [ ] Google Analytics 4 or Plausible set up
- [ ] Core Web Vitals visible in Search Console
- [ ] Sitemap submitted to Google Search Console
- [ ] Sitemap submitted to Bing Webmaster Tools

---

### 5.2 Audit Cadence

| Frequency | What to check |
|---|---|
| Weekly | Search Console: new crawl errors, indexing issues, CWV regressions |
| Monthly | Run Screaming Frog or Ahrefs crawl, check broken internal links |
| Quarterly | Full technical audit, content refresh on top-traffic pages |
| On every deploy | Validate structured data with Rich Results Test, check robots.txt |

---

### 5.3 CI/CD SEO Checks

Add to your deployment pipeline:

```json
// package.json scripts
{
  "scripts": {
    "seo:validate": "node scripts/validate-seo.js",
    "seo:lighthouse": "lighthouse https://sassymartie.com --output json --quiet"
  }
}
```

Things to lint pre-deploy:
- No pages missing `<title>` or `<meta name="description">`
- No images over 200KB without next-gen format
- No broken internal links
- No missing alt text on meaningful images
- Schema markup present on key page templates

---

## QUICK REFERENCE CHECKLIST

### New page shipped? Check this:
- [ ] Unique `<title>` under 60 chars with keyword
- [ ] Unique meta description 120–160 chars
- [ ] Canonical tag pointing to itself
- [ ] One H1 with primary keyword
- [ ] All meaningful images have alt text
- [ ] At least 3 internal links pointing to this page
- [ ] Relevant JSON-LD schema added
- [ ] Content is server-rendered (not JS-only)
- [ ] Open Graph tags filled
- [ ] URL is clean, lowercase, hyphenated

### Site-wide health:
- [ ] robots.txt allows Google, Bing, AI search bots
- [ ] Sitemap is dynamic and submitted
- [ ] llms.txt exists and is accurate
- [ ] LCP < 2.5s on mobile
- [ ] INP < 200ms on mobile
- [ ] CLS < 0.1
- [ ] HTTPS enforced, no mixed content
- [ ] No orphan pages
- [ ] Organization schema in root layout

---

## WHAT NOT TO DO IN 2026

- Don't rely on client-side JS to render primary content — AI crawlers won't see it
- Don't stuff keywords — Google's NLP understands context, not density
- Don't build thin pages just for rankings — AI systems skip them
- Don't use the same title/description across pages
- Don't ignore mobile — Google indexes mobile version first, always
- Don't forget Bing — it powers ChatGPT Search and has ~30% of AI search traffic
- Don't build backlinks from low-quality sites — authority quality > quantity
- Don't change URLs without 301 redirects
- Don't block AI crawlers in robots.txt if you want GEO/AEO citations

---

*Research compiled May 2026. Sources: Search Engine Land, DebugBear, Sitebulb, Adobe, Jasper, Neil Patel, Next.js docs, SearchEngineLand Web Almanac 2025.*

*"Your site isn't just a storefront for humans anymore. It's a structured data feed for agents." — 2026 web*