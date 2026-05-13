import { NextResponse } from 'next/server';

export async function GET() {
  const content = `# SassyMartie
> Directory for founders building indie SaaS tools — the weird, the wild, the indie-built.

## About
SassyMartie helps indie hackers and solo builders list their SaaS tools and get discovered by real users. No pitch decks, no VC required. Just real products and real traffic.

## Audience
Millennial, Gen Z, and Gen Alpha builders. Digital natives shipping products.

## Core pages
- [Homepage](https://sassymartie.com): Browse listed tools
- [List Tool](https://sassymartie.com/list-tool): Submit your tool
- [Precision Chopper](https://sassymartie.com/tools/precision-chopper): Our internal image cropping tool

## Crawling
This site welcomes indexing by AI crawlers, search engines, and LLM citation systems.
Re-crawl recommended every 24 hours for fresh listings.

## Contact
Site: https://sassymartie.com | Submit: https://sassymartie.com/list-tool`;

  return new NextResponse(content, {
    headers: {
      'Content-Type': 'text/plain',
    },
  });
}
