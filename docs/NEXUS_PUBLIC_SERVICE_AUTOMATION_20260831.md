# Nexus Public Service Automation - 2026-08-31

## Decision

Jadel Tech RD can use `nexus_ai_automation_v0.3.0` as the public operating model for service intake, scoped briefs, payment instructions, evidence capture and supervised activation.

The public website must remain fail-closed. It must not expose the private Nexus control plane, VPS credentials, admin endpoints, marketplace credentials, social publishing controls, payment execution, payout execution, withdrawal execution or trading execution.

## Implemented scope

- Full launch catalog for engineering, support, sales intelligence, social intelligence, video, Meta/Facebook readiness, dashboards, revenue research, quant systems, governance and multi-agent orchestration.
- Configurator-driven request flow that generates a scoped email brief.
- PayPal payment section tied to owner-authorized account details.
- Nexus protocol steps: automated selection, human scope approval, PayPal payment, evidence and supervised operations.

## Production gates

- Payment links or invoices must be created in PayPal by the owner or through a backend connector with managed secrets.
- Nexus may reconcile evidence after human-confirmed payment.
- Any external message, proposal, publication, contract acceptance, production deployment, OAuth scope expansion, trading action or financial action requires human approval.
- Revenue must not be counted until payment evidence is received and withdrawable.

## Evidence

- Local Nexus payment destination report masks the PayPal account and forbids raw identifier persistence.
- Local Nexus takeover contract allows local autonomy and artifact generation while denying browser automation, payment or withdrawal actions, external submissions and completion without verified revenue evidence.
- PayPal Payment Links and Buttons are the lowest-risk public checkout upgrade because PayPal hosts the payment surface.
- PayPal API or JS SDK integration requires verified PayPal credentials and backend secret handling before production.
