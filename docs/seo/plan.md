# SEO Plan — tututordeingles.online

Focus on **low-competition, high-intent LATAM Spanish keywords** rather than broad terms like "aprender inglés" or "clases de inglés," where competition against large companies is unrealistic.

**Target audience is exclusively LATAM Spanish speakers** (primarily Mexico). All Spanish copy, keywords, cultural references, and localization decisions must use Mexican/LATAM Spanish — not Castilian/European Spanish.

## Current Site Audit

### What is already working

- Clean top-level URL structure for the main hub pages and supporting SEO pages.
- Separate blog and SEO landing-page intent.
- Unique `<title>` and meta description per page.
- Canonical URLs in place.
- Sitemap generation in place.
- Strong internal hub-and-spoke linking on the interview cluster.
- Good page readability on dark theme with improved typography.

### Gaps to close next

- Add breadcrumb structured data to hub pages, landing pages, and blog posts.
- Add or expose stronger trust signals: About, author, and credentials context that search engines and users can verify.
- Keep the existing `robots.txt` current and ensure sitemap submission stays current in Google Search Console and Bing Webmaster Tools.
- Use IndexNow for faster Bing discovery of new or updated URLs.
- Keep `/llms.txt` up to date as an AI discovery map for the main hub pages, landing pages, and the best supporting articles.
- Expand each landing page with more original examples, scenarios, and proof of expertise.
- Keep title, H1, OG title, and anchor text aligned with the same intent on every page.

### Interpretation rules

- If a page is meant to rank for search intent, it should live at a top-level SEO URL, not under `/blog`.
- Blog posts are supporting informational content.
- Landing pages are hub or money-adjacent informational pages.
- Do not create duplicate or near-duplicate versions of the same intent under different URLs.

---

## Primary Rule: Additive Content Only

DO NOT MODIFY EXISTING PAGES.

- Do not rewrite homepage content.
- Do not change existing service pages.
- Do not change pricing pages.
- Do not alter navigation.
- Do not alter conversion copy.
- Do not alter branding.
- Do not alter page titles of existing pages.
- Do not alter existing URLs.

This project is **CONTENT EXPANSION ONLY**. All work must be created under **NEW URLs**.

---

## Goal

Generate organic search traffic from professionals interested in improving English for:

- Jobs
- Interviews
- Remote work
- Software development
- Professional communication
- Working with U.S. companies

The purpose of content is:

1. Rank in search.
2. Demonstrate expertise.
3. Funnel visitors to existing tutoring pages.

---

## Language Strategy

The interview SEO cluster should be **Spanish-first for LATAM search intent**, with English alternates on their own URLs.

Guidelines:

- Use a Spanish primary page for each interview intent that matters for LATAM search.
- Pair each Spanish page with a real English alternate when the English version adds value.
- Use `hreflang` and `x-default` to connect the pair.
- Keep the title, H1, meta description, summary, body copy, internal anchors, and social copy localized to the page language.
- Do not mix languages on the same SEO landing page except where an English example is necessary for teaching English.
- Blog posts can stay supporting content, but the money-adjacent or high-intent pages should exist in Spanish too.

The Spanish version should usually be the default for LATAM users. The English version should exist as a deliberate alternate, not as a duplicate clone.

Examples:

- `/ingles-para-entrevistas-de-trabajo` <-> `/english-for-job-interviews`
- `/metodo-star-para-entrevistas-en-ingles` <-> `/star-method-interview-answers`
- `/como-responder-tell-me-about-yourself-en-ingles` <-> `/how-to-answer-tell-me-about-yourself`
- `/vocabulario-para-entrevistas-profesionales` <-> `/interview-vocabulary-for-professionals`
- `/como-describir-experiencia-laboral-en-ingles` <-> `/how-to-describe-work-experience`

---

## Content Types Allowed

### Type 1: Educational Blog Posts

Examples:

- How to Stop Translating in Your Head
- How to Improve English Speaking Fluency
- English for Software Developers
- Common Interview Questions in English
- Business English Vocabulary for Meetings

### Type 2: SEO Landing Pages

Standalone informational pages targeting specific search intent.

Examples:

- /english-for-software-developers
- /english-for-job-interviews
- /english-for-remote-workers
- /business-english-for-professionals

These pages are the primary SEO targets for commercial or high-intent informational queries. They should feel like complete answers to the searcher's query, not like repackaged blog posts.

### Routing Rule

- Blog content stays under `/blog/...`.
- Landing pages stay at the root level, e.g. `/english-for-job-interviews`.
- If two pages would answer the same query in nearly the same way, keep one canonical page and merge the others into it.

These are informational content pages. They must not replace existing site pages.

---

## Content Clusters

### Cluster: Job Interviews

**Target search intent:** People preparing for interviews in English.

Pages:

- How to Answer Tell Me About Yourself
- 25 Common Interview Questions in English
- STAR Method Interview Answers
- How to Describe Work Experience in English
- Interview Vocabulary for Professionals

### Cluster: Software Developers

**Target search intent:** Technical professionals working with international teams.

Pages:

- English for Software Developers
- How to Explain a Bug in English
- English Vocabulary Used in Sprint Meetings
- Technical Communication in English
- English for Working With U.S. Engineering Teams

### Cluster: Remote Work

**Target search intent:** Professionals working remotely with English-speaking companies.

Pages:

- English for Remote Workers
- Professional Slack Communication
- Zoom Meeting English
- Running Meetings in English
- Workplace Communication Skills

### Cluster: Speaking Fluency

**Target search intent:** People struggling to speak naturally.

Pages:

- Why You Understand English But Can't Speak It
- How to Think in English
- How to Stop Translating Mentally
- Daily Speaking Practice Techniques
- Speaking Fluency Exercises

### Cluster: Business English

**Target search intent:** Professionals seeking workplace communication skills.

Pages:

- Business English Vocabulary
- English for Presentations
- Professional Email Communication
- English for Meetings
- Small Talk for Professionals

---

## Internal Linking: Hub-and-Spoke Model

All new pages must follow a **hub-and-spoke** structure.

### Levels

| Level | Type | Examples | Word Count |
|-------|------|----------|------------|
| 1 | Existing conversion pages (untouched) | `/`, `/signup` | — |
| 2 | SEO hub pages | `/english-for-job-interviews` | 2000–4000 |
| 3 | Supporting blog posts | `/blog/25-common-interview-questions-in-english` | 1200–2500 |

### Every Blog Post Must Link To

1. **Its parent hub page** — using relevant anchor text (e.g., "English for Job Interviews Guide")
2. **2–4 related articles** — to build topical relevance
3. **One conversion page** — near the end (e.g., "Book a private English tutoring session" → `/signup`)

### Every Hub Page Must Link To

All supporting articles in its cluster, listed explicitly so Google understands the relationship:

```text
/english-for-job-interviews
├── How to Answer Tell Me About Yourself
├── STAR Method Interview Answers
├── Interview Vocabulary for Professionals
├── Common Interview Questions in English
└── Work Experience Vocabulary
```

### Linking Don'ts

- Don't create random links everywhere — Google can't identify topical relationships.
- Don't use generic anchors like "click here" or "read more" — use descriptive anchors like "English for Software Developers".
- Don't orphan pages — every page must receive links from its hub + related articles + blog index.

### Ideal Numbers Per Article

**Incoming links:** 1 hub page + 2–4 related articles
**Outgoing links:** 1 hub page + 2–4 related articles + 1 conversion page

---

## 5 Planned Hub Pairs

```text
/ingles-para-entrevistas-de-trabajo <-> /english-for-job-interviews
/ingles-para-desarrolladores-de-software <-> /english-for-software-developers
/ingles-para-trabajo-remoto <-> /english-for-remote-workers
/ingles-de-negocios-para-profesionales <-> /business-english-for-professionals
/mejorar-hablar-ingles <-> /improve-english-speaking
```

Build 5–10 supporting articles under each hub pair for ~30–50 pages total, with the Spanish versions prioritized for LATAM discovery.

---

## Content Quality Requirements

Each article should:

- Be **1200–2500 words**.
- Include examples.
- Include practical usage.
- Include real workplace scenarios.
- Include natural English.

Avoid:

- Thin content.
- Keyword stuffing.
- Generic AI-generated filler.
- Rewritten dictionary definitions.

---

## Calls to Action

At the end of each article, invite readers to book tutoring sessions. Link to existing conversion pages. Do not create new conversion funnels. Use the site's existing funnel.

---

## On-Page SEO (for new pages only)

### 1. Pick One Primary Search Intent Per Page

Each new page should target one intent and one primary phrase. Do not split the same intent across multiple URLs.

**Page structure:**

```html
<title>English for Software Developers | Tu Tutor de Inglés</title>

<h1>English for Software Developers</h1>
```

Mention the primary phrase naturally in the first 100 words, the H1, one early subheading, and the body copy where it fits.

### 2. Align Title, H1, and Snippet Signals

Google and Bing both use the title element, the visible H1, prominent headings, anchor text, and on-page copy when deciding how to represent a page.

Rules:

- Make the title unique and descriptive.
- Put the primary intent first.
- Keep the H1 close to the title.
- Write a unique meta description that mirrors the page value.
- Avoid keyword stuffing and avoid vague titles like "Guide" or "Resources" alone.

### 3. Control the Snippet

The meta description should be a short, unique summary. Use the body copy to reinforce the same message so Google and Bing have enough clear text to generate a good snippet.

### 4. Use Breadcrumbs

Add visible breadcrumb navigation and `BreadcrumbList` structured data for:

- Hub pages
- Landing pages
- Blog posts

Breadcrumbs help users understand site hierarchy and give Google/Bing a cleaner topical map.

### 5. Add FAQ Schema Only When the Questions Are Visible

Questions to include on relevant pages:

- ¿Cuánto cuesta una clase?
- ¿Las clases son individuales?
- ¿Necesito conocimientos previos?
- ¿Utilizan Google Meet?

FAQ schema should match on-page text exactly. Do not use it on pages that do not visibly answer those questions.

### 6. Add Real Proof

Google values unique content and evidence of expertise.

| ❌ Bad | ✅ Good |
|--------|---------|
| "Excelente profesor." | "Conseguí un empleo remoto después de mejorar mi inglés durante 6 meses." |

Add:

- Real examples
- Real scenarios
- Specific outcomes
- Tutor credentials or About-page context
- Clear links to conversion pages near the end

### 7. Keep Pages Substantial

Word count is not a ranking factor by itself, but thin pages usually fail to satisfy intent. Aim for complete coverage of the query rather than a fixed word count. The old 1200–2500 number is only a rough planning range.

### 8. Optimize Media When Media Exists

If you use images or video:

- Use descriptive alt text.
- Put media near relevant text.
- Do not use decorative media just to fill space.
- Make filenames, captions, and surrounding copy support the page topic.

### 9. Prevent Duplicate Content

Avoid:

- Multiple pages targeting the same query with nearly identical structure
- Copy-paste intros across landing pages
- Blog duplicates of landing-page content
- Repeated FAQ text across unrelated pages

If a page is the hub for a topic, it should own that topic. Supporting pages should narrow the angle, not repeat the same page.

### 10. Technical Checks for Every New Page

- Canonical points to the preferred URL.
- Page is indexable and not blocked by `robots.txt` or `noindex`.
- Sitemap includes the URL.
- Internal links use descriptive anchor text.
- Open Graph and Twitter metadata are present.
- Structured data validates cleanly.

### 11. AI Search / LLM Visibility

AI search and LLM answer systems usually work better when pages are easy to summarize, clearly scoped, and machine-readable. Treat this as an extension of on-page SEO, not a separate trick.

Do this:

- Put the answer up front.
- Use short intro paragraphs that state the page purpose immediately.
- Keep headings descriptive and specific.
- Use question-based subheadings when the query is naturally a question.
- Add visible summaries, examples, and concrete takeaways.
- Keep the same entity names, page titles, and anchor text across the site.
- Use canonical URLs, sitemap coverage, and structured data consistently.
- Make sure important content is server-rendered and crawlable.
- Publish and maintain a concise `/llms.txt` file that points AI systems to the most important pages.

For this site, the pages most likely to get quoted by AI systems are:

- English for Job Interviews
- STAR Method Interview Answers
- Interview Vocabulary for Professionals
- How to Describe Work Experience in English
- How to Answer Tell Me About Yourself in English

These pages should have:

- Strong intros
- Answer-first paragraphs
- Breadcrumbs
- FAQ schema when relevant
- Concrete examples from real interview contexts
- Clear links to the hub page and the conversion page

Important note:

- `robots.txt` is a crawl preference file, not security by itself.
- If bot load becomes a real problem, pair crawl controls with CDN/WAF rules, rate limiting, and edge caching.

---

## Off-Page SEO

### 1. Google Search Console

Set up Search Console, submit the sitemap, and monitor:

- Index coverage
- Search queries
- Page experience
- Rich result reports
- Manual actions

### 2. Bing Webmaster Tools + IndexNow

Use Bing Webmaster Tools for crawl diagnostics and keyword data. Use IndexNow so Bing and participating search engines get notified when URLs are created or updated.

### 3. Google Business Profile

Even if the business is online-first, create and maintain a profile if the service area supports it.

Include:

- Business name
- Website
- Description
- Service area
- Contact method

Reviews are one of the highest-ROI trust signals.

### 4. Local and Niche Directories

Use only directories that people would realistically trust:

- Yelp Mexico
- Hotfrog
- Cylex
- Local business directories
- Chamber of commerce directories

Avoid spammy directories.

### 5. LinkedIn

Publish content that maps to the site's real clusters:

- English for job interviews
- English for software developers
- English for remote workers
- Business English for professionals

Link back to the relevant hub page, not to random pages.

### 6. Medium

Rewrite your best educational pieces and link back naturally to the canonical page on the site. Do not syndicate exact copies without a canonical strategy.

### 7. Guest Posts and Partnerships

Target:

- Career blogs
- Remote work blogs
- Expat blogs
- Technology communities
- LATAM professional newsletters

Offer tightly relevant pieces like "English for software engineers" or "Preparing for US job interviews." Include one contextual link back to the most relevant hub page.

### 8. Reddit and Communities

Answer questions naturally. Do not spam links. Build trust first; link only when it genuinely solves the problem.

### 9. YouTube

Create videos for:

- English interview practice
- Common business English mistakes
- English for programmers

Link to the relevant page in descriptions and pinned comments.

### 10. Facebook Groups and Community Channels

Join groups for remote workers, programmers, job seekers, and English learners in Mexico/LATAM. Be helpful first.

---

## Keywords to Target First

### Commercial Intent

- tutor de inglés online
- clases de inglés online
- inglés para profesionistas
- inglés para programadores
- inglés para entrevistas de trabajo
- business english online

### Informational

- cuánto tiempo toma aprender inglés
- cómo mejorar mi speaking
- cómo prepararme para entrevista en inglés
- preguntas de entrevista en inglés

---

## Publishing Schedule

| Phase | Content | Timeline |
|-------|---------|----------|
| **1** | 5 hub pages + 10 supporting pages | — |
| **2** | 10–20 more supporting pages | — |
| **3** | Expand based on Search Console and Bing query data | — |
| **Total** | 30–50 high-intent content pages | — |

---

## 30-Day Action Plan

| Week | Actions |
|------|---------|
| **1** | Set up Google Search Console, Bing Webmaster Tools, sitemap submission, and IndexNow |
| **2** | Add breadcrumb structured data and strengthen About/trust signals |
| **3** | Publish 2–3 high-intent hub or landing pages for the strongest cluster |
| **4** | Get 5 Google reviews, 3–5 legitimate directory listings, and 1 relevant guest mention |

---

**Bottom line:** strong intent alignment, clear internal structure, unique content, and trustworthy external mentions will move the needle more than chasing volume. The biggest opportunity is to become the site that specifically serves **Mexican professionals seeking English for better jobs**.
