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

- No public backend endpoint is deployed for secure intake.
- No PayPal webhook ledger exists yet.
- No customer/admin identity boundary exists yet.
- No production approval console exists yet.
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

## Fail-closed rules

- No payment evidence, no fulfillment automation.
- No approved scope, no Nexus job.
- No verified connector, no external side effect.
- No risk evidence, no production promotion.
- No human capital gate, no trading or financial execution.
