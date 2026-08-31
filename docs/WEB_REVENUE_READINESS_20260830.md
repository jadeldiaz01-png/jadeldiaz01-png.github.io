# Jadel Tech RD Web Revenue Readiness - 2026-08-30

## Decision

Jadel Tech RD can present Nexus AI Automation v0.3.0 as a governed service engine for public commercial offerings, but the public website must not expose admin APIs, secrets, direct worker controls, payment automation, marketplace actions, social publishing, contract acceptance, or financial execution.

## Implemented public surfaces

- Homepage: `https://jadeltechrd.com/`
- Services catalog: `https://jadeltechrd.com/#servicios`
- Pricing: `https://jadeltechrd.com/#precios`
- PayPal payment section: `https://jadeltechrd.com/#pagos`
- Privacy policy: `https://jadeltechrd.com/?view=privacy`
- Terms of service: `https://jadeltechrd.com/?view=terms`
- Direct privacy page: `https://jadeltechrd.com/privacy.html`
- Direct terms page: `https://jadeltechrd.com/terms.html`

## Nexus service mapping

- AI automation and agentic architecture
- Support and ticketing agents
- Sales and lead intelligence
- Social trend intelligence
- CineForge video pipeline
- Meta/Facebook app integration and review readiness
- Dashboards and decision intelligence
- Revenue opportunity intelligence
- Quant research and trading risk systems
- AI governance and production readiness
- Multi-agent orchestration

## Payment control

PayPal receiving account authorized by owner: `darklife_jadel@hotmail.com`.

Current implementation opens PayPal and instructs customers to confirm scope first. This avoids an unsafe custom checkout and avoids pretending a verified hosted PayPal link exists.

Recommended next payment upgrade:

1. Create an official PayPal Payment Link, Button, or PayPal.Me URL inside PayPal.
2. Test a low-value transaction.
3. Replace the generic PayPal link in `index.html` and `app.js` with the verified URL.
4. Keep payment confirmation and delivery scope human-reviewed.

## External evidence used

- GitHub Pages custom domains require repository Pages configuration plus DNS records for the apex domain and optional `www`; DNS propagation can take up to 24 hours. Source: https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/managing-a-custom-domain-for-your-github-pages-site
- PayPal recommends Payment Links and Buttons for no-code online payment acceptance. Source: https://developer.paypal.com/payment-links-buttons/overview
- PayPal.Me lets customers send money through a PayPal.Me link without sharing email, but the handle must be created and verified by the account owner. Source: https://www.paypal.com/us/cshelp/article/paypalme-frequently-asked-questions-help432

## Open production gate

Do not mark the site as fully automated payment-ready until:

- `jadeltechrd.com` serves the new payment section after CDN/cache propagation.
- `www.jadeltechrd.com` is configured or intentionally omitted.
- GitHub Pages/CDN serves the site over HTTPS.
- PayPal link is official and verified.
- Any Nexus admin endpoint remains private behind authentication and network controls.
