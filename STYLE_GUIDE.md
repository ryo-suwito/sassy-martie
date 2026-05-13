# SassyMartie Component Styles Guide
A living reference for anyone building inside the SassyMartie universe. Every colour, type size, button state, and copy pattern — all in one place.

Built with heart, chaos, and caffeine ♡
Version 1.0 — May 2026

## 01 — Brand Foundation

### Color Palette
Warm and grounded. Built around the tension between cream paper and burnt red. Charcoal anchors everything without going cold.

**Primary Palette**
- Brand Red: `#C0392B` (CTAs · Identity · Tags)
- Charcoal: `#2C2C2C` (Headlines · Body text)
- Cream: `#FAF7F2` (Page backgrounds)
- White: `#FFFFFF` (Card · Panel surfaces)

**Extended Palette**
- Deep Red: `#922B21` (Hover · Depth)
- Coral: `#E8776F` (Accents · Secondary actions)
- Warm Peach: `#F5E6D3` (Card bgs · Highlights)
- Mid Grey: `#6B6B6B` (Meta · Helper text)

## 02 — Brand Foundation

### Typography
Georgia for warmth and readability. Arial for labels and UI. Never more than two typefaces in one layout.

- **Display (Logo only):** Caveat 600, 2.8rem, Brand Red
- **Heading 1:** Georgia Bold, 2.5rem, Charcoal
- **Heading 2:** Arial Bold, 1.75rem, Charcoal
- **Heading 3:** Arial Bold, 1.375rem, Charcoal
- **Body:** Georgia Regular, 1.1rem, Line-height 1.6, Charcoal
- **UI Label:** Arial Bold, 0.875rem, ALL CAPS, Charcoal
- **Caption:** Arial Regular, 0.8rem, Mid Grey
- **Pull Quote:** Georgia Italic, 1.25rem, Red border

## 03 — Brand Foundation

### Logo Rules
The logo is the wordmark. Never distort, recolour, or separate "Sassy" from "Martie".

- ✅ **Do Correct:** Use on cream or white backgrounds. Maintain clear space equal to the height of the "M".
- ✅ **Do Scale proportionally:** Digital min: 120px wide. Print min: 1.5 inches.
- ❌ **Never distort or rotate:** Never skew, stretch, or add shadows, bevels, or glows.
- ❌ **Never unapproved colours:** Never separate "Sassy" from "Martie". Never recolour to off-brand tones.

## 04 — Components

### Buttons & CTAs
Verb-first, short, purposeful. Primary is Brand Red. Secondary is outlined. Never "Click here".

- **Primary:** `.btn-primary` (Brand Red background, White text)
- **Secondary:** `.btn-secondary` (Outline, Charcoal text)
- **Ghost:** `.btn-ghost` (Transparent, Charcoal hover)
- **Coral:** `.btn-coral` (Coral background)
- **Destructive:** `.btn-danger` (Deep Red or specific styling)
- **Disabled:** `.btn-disabled` (Greyed out)

## 05 — Components

### Tags & Badges
Used for categories, statuses, and metadata. Short, never more than 2–3 words.

- **Filled:** `.tag-red`, `.tag-coral`, `.tag-peach`, `.tag-charcoal`, `.tag-grey`
- **Outline:** `.tag-outline`

## 06 — Components

### Form Elements
Placeholders give a real hint — not just a repeated field label. The user is smart. Trust them.
- Standard Inputs with honest placeholders.
- Error states and Success states with inline validation messages.

## 07 — Components

### Cards
Tool listing cards, featured cards, and callout cards — all warm and grounded.
- Cards use White background with Charcoal text.
- Featured cards can have badges.
- Callout cards can use Warm Peach background.

## 08 — Components

### State Messages
Empty, error, success, loading — all honest, calm, and never over-dramatic.
- Empty states, Error states, Success states, 404 pages.

## 09 — Components

### Inline Banners
Honest, calm, helpful. Never alarming for its own sake.

## 10 — Components

### Navigation
Clear and purposeful. No buried links. No labyrinthine menus.

## 11 — Components

### Controls
Toggles, tooltips, avatars. Keep interactions simple and obvious.

## 12 — Voice & Tone
Talk like the friendly senior who remembers what it felt like to be new — warm, direct, no fluff, occasionally funny but never trying hard.

- ✅ **Do:** "Hey, glad you're here."
- ❌ **Never:** "Welcome to our AMAZING community of INCREDIBLE creators!!!"
- ✅ **Do:** "List your tool. Tell people what it does. Done."
- ❌ **Never:** "Our platform facilitates the seamless submission and discoverability of your software product."

## 13 — Voice & Tone

### Word Bank
- **Use Freely:** ship, build, tool, scrappy, real, honest, indie, solo, founder, chaos, get seen, discover, heart, weird, wild, built different, lemme in.
- **Never Use:** leverage, utilize, seamless, frictionless, robust, world-class, synergy, ecosystem, monetize, users, stakeholders, disruptive, industry-leading.

**One rule to remember:** "Users" → "people" or "builders". "Monetize" → "make money" or "get paid". Treat builders as humans, not metrics.

## 14 — Voice & Tone

### Copy Patterns
Real hints over repeated labels. Placeholders that actually help.

- **Good Placeholder:** "What do people call it?"
- **Bad Placeholder:** "Name"