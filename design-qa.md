# Design QA

## Comparison Target

- Source URL: https://csume-v3.bs.designtocodes.com/
- Local visual source: `C:\Users\elvis\Documents\professional website\website\templates\website template.webp`
- Source desktop capture: `C:\Users\elvis\Documents\professional website\work\reference\desktop-00.png`
- Source mobile capture: `C:\Users\elvis\Documents\professional website\work\reference\reference-mobile-top.png`
- Implementation URL: http://127.0.0.1:4173/
- Implementation desktop capture: `C:\Users\elvis\Documents\professional website\cybersecurity-portfolio\qa\home-top-fixed.png`
- Implementation mobile capture: `C:\Users\elvis\Documents\professional website\cybersecurity-portfolio\qa\implementation-mobile.png`
- Desktop viewport: 1280 x 720
- Mobile viewport: 390 x 844
- State: homepage hero, closed navigation; mobile navigation also tested open

## Evidence

- Full-view desktop comparison: `qa/comparison-desktop.jpg`
- Full-view mobile comparison: `qa/comparison-mobile.jpg`
- Focused hero comparison: `qa/comparison-focused-hero.jpg`
- Project page: `qa/project-desktop-top.png`
- Wide inline evidence: `qa/project-evidence-inline.png`
- Full-size evidence viewer: `qa/project-lightbox.png`
- Mobile project page: `qa/project-mobile.png`
- Mobile menu: `qa/implementation-mobile-menu-final.png`

## Findings

No actionable P0, P1, or P2 findings remain.

- Typography: The implementation uses a robust system sans-serif stack rather than the
  source's Satoshi font. Weight, scale, contrast, and hierarchy preserve the intended
  character without copying a proprietary template asset.
- Spacing and layout: Desktop preserves the split hero, generous negative space, thin
  card borders, and long-form section rhythm. Mobile changes to a text-first stack so
  the professional message is visible before the portrait.
- Colors and tokens: Near-black navy, indigo-violet accents, low-opacity borders,
  muted secondary text, and cyan status details closely match the supplied direction.
- Image quality: Elvis's original portrait remains identity-accurate and receives only
  deterministic crop, contrast, color, sharpening, and WebP optimization. All 131
  project screenshots are preserved at their original resolution and open in a
  full-size evidence viewer.
- Copy and content: All public project cards map to repositories shown on the
  `elvis2121` GitHub profile. Recruiter-facing copy, experience, certifications,
  capabilities, availability, email, GitHub, and LinkedIn are present.
- Interaction and accessibility: Mobile navigation, project filters, evidence dialog,
  keyboard focus, skip link, reduced-motion behavior, and responsive overflow checks
  passed. Browser console showed no warnings or errors.

## Patches Made

1. Added global responsive image height handling after QA found the portrait height
   attribute was stretching the hero.
2. Expanded the mobile drawer to cover the full viewport below the header.
3. Added screen-reader-only navigation text and reduced-motion support.

## Follow-up Polish

- P3: A locally licensed display font could move typography even closer to the source
  in a future iteration.

final result: passed
