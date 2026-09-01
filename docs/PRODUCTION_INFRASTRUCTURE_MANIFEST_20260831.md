# Production Infrastructure Manifest - 2026-08-31

## Decision

Jadel Tech RD should evolve from a static commercial site into a gated production platform in phases. The public site can use PayPal-hosted checkout immediately for supported services. Backend intake, payment reconciliation, agent jobs and customer operations must be introduced through audited APIs, not browser automation or exposed VPS controls.

## Target architecture

- Frontend: current `jadeltechrd.com` static site.
- Backend: Cloudflare Workers or Supabase Edge Functions for intake, payment webhooks and agent job orchestration.
- Database: Postgres/Supabase for customers, requests, approvals, payments, evidence and audit logs.
- Queue: Cloudflare Queues, Upstash/QStash or Redis for durable async work.
- Durable state: Durable Objects or Postgres state machines for per-request coordination.
- Payments: PayPal Payment Links first; PayPal API after business credentials, webhook validation and secret management are ready.
- Agents: OpenAI Agents SDK plus private Nexus control plane with scoped tools, guardrails, handoffs and traces.
- Security: OWASP ASVS and OWASP GenAI Top 10 mapped into CI and runtime gates.
- AI governance: NIST AI RMF lifecycle for Govern, Map, Measure and Manage.
- Observability: OpenTelemetry traces/metrics/logs plus Sentry/Grafana dashboards and alerts.
- Secrets: GitHub Secrets, Supabase Secrets, Cloudflare Secrets or Vault. No raw secrets in prompts, docs, logs or client JavaScript.

## Production blockers

- P1 backend scaffold exists in the canonical repository; production deploy still requires Cloudflare runtime credentials plus PayPal/admin secrets.
- PayPal webhook ledger schema and handler exist; reconciliation remains human-gated until provider events are matched to project scope.
- Admin approval console exists as a bearer-token protected operator surface; customer identity is still out of scope for P1.
- No durable job queue is connected to Nexus.
- No service-specific fulfillment evidence is attached to completed purchases.
- No SLO, alerting, backup/restore or incident runbook evidence exists for dynamic production services.

## Phased execution

1. P0 static revenue: publish verified PayPal Payment Links for supported services.
2. P1 intake API: add signed request capture, spam protection, schema validation and audit log.
3. P2 payment ledger: add PayPal webhook validation, idempotent payment records and reconciliation.
4. P3 approval console: add human approval for scope, payment evidence, fulfillment, external messages and production jobs.
5. P4 Nexus queue: enqueue only approved jobs with least-privilege tool scopes and deterministic policy gates.
6. P5 observability: export structured logs, traces, metrics, SLOs and error-budget alerts.
7. P6 production promotion: each agent graduates only with service-specific tests, evidence, rollback and human sign-off.

## Implemented P1 surfaces

- `/solicitar-proyecto.html`: governed intake form that submits to `https://intake.jadeltechrd.com/api/v1/project-requests`.
- `/approval-console.html`: noindex operator console for pending scope decisions and payment ledger review.
- `/project-intake-bridge.js`: routes configurable service CTAs to governed intake while preserving hosted PayPal checkout links.
- Required backend secrets: `PAYPAL_CLIENT_ID`, `PAYPAL_CLIENT_SECRET`, `PAYPAL_WEBHOOK_ID`, `ADMIN_API_TOKEN`, `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID`, `TURNSTILE_SECRET_KEY`.

## Fail-closed rules

- No payment evidence, no fulfillment automation.
- No approved scope, no Nexus job.
- No verified connector, no external side effect.
- No risk evidence, no production promotion.
- No human capital gate, no trading or financial execution.
