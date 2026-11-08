# Spheres Zimbabwe — founding community MVP

A lightweight, mobile-first brochure site and working Netlify Forms registration workflow. Built deliberately without an application framework, database server, subscription billing or invented event schedules.

## What's in the MVP

- Landing page with three experience categories: Social, Business, Adventures.
- 2-step progressive-enhancement membership application: required name, WhatsApp, city, motivation and interests; optional email; age band and personal preferences only with an explicit separate opt-in.
- Netlify Forms (`spheres-members`) with spam honeypot, static HTML detection, and a dedicated thank-you page.
- Separate privacy requests form (`privacy-requests`) with honeypot.
- Simple first-party referral and campaign attribution using `?utm_source=instagram&utm_campaign=launch` or `?ref=friendname`.
- Privacy notice, accessibility features, SEO/share metadata and a visual identity.

## One-time publication steps

1. Create an **empty** GitHub repository `Shumba1/sphereszimbabwe`. Avoid initialising it with a README or other files if importing this package via git. Keep it private or public as you prefer; the site itself will be public when deployed.
2. Commit all files in this folder to the repository's default branch. If you want to use the GitHub-connected assistant to do this, creating the empty repository enables that workflow.
3. In Netlify, choose **Add new project > Import an existing project > GitHub**, select `Shumba1/sphereszimbabwe`, and connect it. No build command is needed; build command is `node scripts/build.mjs`; publish directory is `dist`. Netlify will use `netlify.toml`.
4. In Netlify **Site configuration > Domain management**, set the site name to `sphereszimbabwe`, *if that subdomain is available*. If unavailable, pick a variant and update `og:url`, `og:image`, `robots.txt`, `sitemap.xml`, and any shared links. Do not assume the suggested address is reserved.
5. In **Forms**, confirm **form detection** is enabled, then trigger a production deploy. Check that `spheres-members` and `privacy-requests` appear as active forms. (Detection occurs on deploy.)
6. Under **Forms > Submission notifications**, add a verified member-team email address to receive registrations. Test with a genuine test registration and verify the submission is listed, the redirect works and the notification arrives. Delete the test data afterwards.
7. Before accepting real members, replace the launch privacy notice's provisional operating identity with the actual controller identity and contact particulars, and confirm compliance with applicable Zimbabwean data-controller/licensing and sensitive-data consent obligations.
8. Create Facebook, Instagram and TikTok accounts, then replace any `launching soon` social references/links with real ones. Put `https://sphereszimbabwe.netlify.app/?utm_source=facebook` etc. in social bios. (The initial site deliberately contains no dead social links.)

## Form data and limitations

Netlify stores submissions in the project's Forms dashboard; this is the MVP's member list, **not** an interactive CRM. Manage duplicate applicants by reviewing the WhatsApp number, and manually tag/curate for the first 50–100 genuine applications. Export CSV when you need to review preferences. Netlify does not automatically verify WhatsApp numbers or confirm identity. A form entry does **not** by itself establish a unique real member.

Once the initial community exceeds manual management, a CRM or structured database can be added without replacing the brochure site.

## MVP acceptance criteria

- On mobile and desktop, all primary CTAs reach the membership form.
- Form step 1 requires valid basics and at least one interest.
- Optional personal fields are not enabled or sent without separate sensitive-information consent.
- Form step 2 requires adult confirmation and acknowledgement of the privacy notice.
- Successful registration appears in Netlify Forms, not only the confirmation screen.
- Both form notifications are set up and a tested submission reaches the correct authorised address.
- Each social platform's bio points to the site and uses a tagged URL.
- Measure **valid unique registrations** by WhatsApp/contact rather than raw submissions.

## Early traction scorecard

- 50: first validation checkpoint for the founding member list.
- 100: candidate threshold to expand event experiments, *provided registrations are genuine and event response is encouraging*.
- Also track invitation-to-attendance conversion, repeat attendance, paid ticket demand and event contribution margins before scaling costs.

## Local preview

Run `node scripts/build.mjs`, then serve `dist` using a static HTTP server. A local POST will not store submissions; storage only works on an appropriately configured **deployed** Netlify site.


## Verified release workflow

See [docs/OPERATIONS.md](docs/OPERATIONS.md) for review, deduplication, privacy requests, consent, exports and weekly counts. Source and operations notes are excluded from the deployed CDN by the build allowlist. Do not commit member exports.

The form uses browser validation and waits for a successful Netlify POST response before showing confirmation. Failed submissions preserve entries and allow retry. Confirmation pages opened directly do not claim a new submission. Netlify stores unvalidated raw POSTs, so an entry needs operator review before acceptance. No WhatsApp number ownership verification is automated.
