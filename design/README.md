# Austin Whyte Web Design
Standalone static page at /design/. No edits to the mission homepage.

## Setup
1. Review the pull request and preview the page on a local static server (e.g. python3 -m http.server 8000 from repository root, then /design/). Keep inquiries disabled until privacy, client communications and business arrangements have been reviewed with a parent/guardian where necessary.
2. Create a private Google spreadsheet; copy its ID from the URL between /d/ and /edit. Do not share it publicly.
3. Open Extensions > Apps Script. Replace Code.gs with this directory's Code.gs.
4. In Project Settings > Script Properties set SHEET_ID to the spreadsheet ID, NOTIFY_EMAIL to the private notification destination, and ACCEPT_INQUIRIES to false. Never put those values in GitHub.
5. Run setup() in the Apps Script editor and approve permissions. Verify the Inquiries sheet has the generated header. Set ACCEPT_INQUIRIES to true when ready to test.
6. Deploy > New deployment > Web app. Execute as the owner; access Anyone (if your account permits). Copy the deployed /exec URL, not the /dev URL.
7. Edit design/config.js and set inquiryUrl to that URL. Commit the change only after testing. The URL is public, not a secret.
8. Test with fictional contact details and verify the browser receives a reference ID, the private sheet receives exactly one row, and the email alert arrives. Test retry/duplicate behavior and invalid input. If Apps Script access or cross-origin response fails, keep the form disabled by clearing inquiryUrl and troubleshoot deployment permissions. Never treat an opaque response as success.
9. Review privacy wording and establish a retention/deletion policy before collecting real inquiries. Set ACCEPT_INQUIRIES to false to pause server-side collection; clear config.js to disable the frontend as well.
10. After changing Apps Script, update the existing deployment to a new version. Check the page on mobile and desktop.

## Checks
- All seven design options; desktop/mobile preview; three full-width style samples.
- Live website price estimator: $50 setup + $40/hour, first page 3 hours, each additional page 2 hours. Verify 1 page = $170, 2 = $250, 5 = $490, 10 = $890.
- Website design is featured as the primary service. Secondary offerings include graphic design (posters, business cards, flyers, brochures and event graphics), logo creation, branding, domain assistance, ongoing web/tech support and custom short links. Support is $40/hour; graphic design, branding, logo creation and short links are individually quoted. Verify graphic design is selectable in inquiries.
- Complimentary QR generator access is advertised as a client benefit; access is provided separately by the business owner. No generator is implemented or hosted by this website.
- Five inquiry steps, required fields, consent, disabled submission without configuration, confirmed success only.
- Google Fonts requires network access. Design previews do not collect submissions.
- Basic honeypot, field limits, spreadsheet formula escaping, locking, deduplication and rate limiting are included. Cache-based limits are best effort, not a guarantee against spam; consider stronger bot protection before high-volume launch.
- No browser or live Apps Script testing is implied by committing files. Confirm end-to-end operation before enabling public collection.
