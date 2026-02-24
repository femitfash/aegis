# Product Requirements Document - Aegis GRC Platform

**Version:** 1.0
**Date:** February 20, 2026
**Status:** Approved

---

## 1. Executive Summary

Aegis is a copilot-first GRC platform designed to solve fundamental problems plaguing the industry:

| Problem | Current State | Aegis Solution |
|---------|---------------|----------------|
| Excessive Data Entry | 50+ fields before value | Zero-field natural language input |
| Poor UX | 6 dropdown menus for basic tasks | Conversational interface |
| Compliance-First | Tracks "policy exists" | Risk-centric outcome metrics |
| No Integration | Manual data population | Real-time API connectors |
| Auditor Distrust | Platform evidence unreliable | Immutable hash-chain audit logs |

---

## 2. Product Vision

**"Make security compliance invisible - embedded in existing workflows, measured by actual risk reduction, and managed through conversation rather than forms."**

### Target Market
- **Primary**: Mid-market companies (50-500 employees), Series A-C startups
- **Secondary**: Growing enterprises needing modern GRC tooling
- **Anti-target**: Large enterprises requiring extensive customization

---

## 3. Target Personas

### Primary: Security Manager Sarah
- **Role**: GRC Manager, Compliance Lead, Security Analyst
- **Pain Points**:
  - 60% time on audit prep
  - Tools create more work than they save
  - Cannot demonstrate ROI
- **Goals**: Pass SOC 2 without heroics, measurable security improvement

### Secondary: CISO Eric
- **Role**: Security leadership
- **Pain Points**:
  - No unified risk view
  - Board questions unanswerable quickly
  - Previous GRC investments failed
- **Goals**: Real-time dashboards, defensible audit trail

### Tertiary: Auditor Alice
- **Role**: External auditor (SOC 2, ISO 27001)
- **Pain Points**:
  - Distrusts auto-generated evidence
  - Needs clear evidence chains
- **Goals**: Transparent provenance, easy navigation

---

## 4. Core User Stories

### 4.1 Onboarding

#### US-001: Framework Quick Start
**As a** Compliance Manager
**I want to** initialize a compliance framework with a single command
**So that** I can start tracking compliance immediately

**Acceptance Criteria:**
- [ ] User types "Set up SOC 2 Type II for our company" in copilot
- [ ] System asks only essential clarifying questions
- [ ] Framework controls loaded with intelligent defaults
- [ ] Time from first interaction to working framework < 15 minutes
- [ ] No required fields beyond natural language description

**Priority:** P0 | **Complexity:** M

---

### 4.2 Risk Management

#### US-002: Natural Language Risk Registration
**As a** Security Analyst
**I want to** describe a risk in plain English
**So that** I can register risks without filling forms

**Acceptance Criteria:**
- [ ] User describes: "Our S3 buckets might be publicly accessible"
- [ ] Copilot extracts: category, likelihood, impact, affected assets
- [ ] Copilot suggests related controls and mitigations
- [ ] User confirms or adjusts with conversation
- [ ] Risk registered with full metadata
- [ ] System links to compliance controls automatically

**Priority:** P0 | **Complexity:** L

#### US-003: Risk Assessment Query
**As a** CISO
**I want to** ask "What are our top 5 risks right now?"
**So that** I get immediate answers without running reports

**Acceptance Criteria:**
- [ ] Response generated in < 3 seconds
- [ ] Risks ranked by calculated score (likelihood x impact x exposure)
- [ ] Each risk includes trend indicator
- [ ] Click-through to full risk details
- [ ] Exportable to executive summary

**Priority:** P0 | **Complexity:** M

#### US-004: Continuous Risk Monitoring
**As a** Security Manager
**I want** risks to update automatically from real-world data
**So that** risk scores reflect current reality

**Acceptance Criteria:**
- [ ] Integration data updates risk scores automatically
- [ ] Significant changes trigger notifications
- [ ] Historical risk scores tracked over time
- [ ] Anomaly detection flags unexpected increases

**Priority:** P1 | **Complexity:** L

---

### 4.3 Compliance Management

#### US-005: Control Mapping Assistance
**As a** Compliance Manager
**I want to** say "Map our existing controls to ISO 27001"
**So that** I can leverage existing work for new frameworks

**Acceptance Criteria:**
- [ ] System analyzes existing controls from other frameworks
- [ ] Suggests mappings with confidence scores
- [ ] Highlights gaps requiring new controls
- [ ] User accepts/rejects/modifies via conversation
- [ ] Mapping rationale documented for auditors

**Priority:** P1 | **Complexity:** L

#### US-006: Compliance Status Query
**As a** Security Manager
**I want to** ask "Are we ready for our SOC 2 audit next month?"
**So that** I understand gaps without generating reports

**Acceptance Criteria:**
- [ ] System returns overall readiness percentage
- [ ] Lists controls not yet evidenced
- [ ] Identifies evidence that will be stale by audit date
- [ ] Suggests prioritized remediation actions
- [ ] Includes estimated effort to close gaps

**Priority:** P0 | **Complexity:** M

---

### 4.4 Evidence Collection

#### US-007: Automated Evidence Collection
**As a** Compliance Manager
**I want** evidence collected automatically from integrations
**So that** I don't spend weeks on audit prep

**Acceptance Criteria:**
- [ ] System continuously collects from connected tools
- [ ] Evidence mapped to specific controls
- [ ] Metadata: source, timestamp, collection method
- [ ] Stale evidence flagged with refresh recommendations
- [ ] Evidence chain is auditor-verifiable

**Priority:** P0 | **Complexity:** L

#### US-008: Evidence Request via Copilot
**As an** Auditor
**I want to** request specific evidence by description
**So that** I can verify controls quickly

**Acceptance Criteria:**
- [ ] Auditor asks "Show me evidence for quarterly access reviews"
- [ ] System returns relevant evidence with dates
- [ ] Evidence includes clear provenance
- [ ] Related evidence suggested
- [ ] Auditor can mark as reviewed/satisfactory

**Priority:** P1 | **Complexity:** M

---

### 4.5 Integration & Workflow

#### US-009: Jira Integration for Remediation
**As a** Security Manager
**I want** remediation tasks to sync with Jira
**So that** my team works in preferred tools

**Acceptance Criteria:**
- [ ] Risk remediation creates Jira ticket automatically
- [ ] Ticket includes control context, risk details, due date
- [ ] Status syncs bidirectionally
- [ ] Completion in Jira updates control status
- [ ] Link to Aegis embedded in Jira ticket

**Priority:** P1 | **Complexity:** M

#### US-010: Slack Notifications
**As a** Security Manager
**I want to** receive alerts and take actions in Slack
**So that** I don't context-switch to the GRC tool

**Acceptance Criteria:**
- [ ] Configurable notifications for risk changes, evidence expiration
- [ ] Interactive messages for quick actions
- [ ] Natural language queries via Slack bot
- [ ] Actions reflected in platform audit log

**Priority:** P2 | **Complexity:** M

---

## 5. Feature Specifications

### 5.1 Copilot Capabilities

The copilot is the **PRIMARY** interface - not an add-on feature.

#### Supported Actions
| Category | Example Utterances |
|----------|-------------------|
| **Risk** | "Register a risk about VPN being outdated" |
| **Compliance** | "How compliant are we with SOC 2?" |
| **Evidence** | "Show me our access review evidence" |
| **Policies** | "Generate an incident response policy" |
| **Reporting** | "Create an executive risk summary" |
| **Integration** | "Sync our AWS accounts" |

#### Intelligence Features
- Domain-specific understanding (GRC terminology)
- Context awareness (conversation history)
- Proactive suggestions ("3 controls have stale evidence")
- Multi-turn conversations with refinement

### 5.2 Risk Management Module

- **Risk Register**: Title, Description, Category, Likelihood, Impact, Score, Owner, Status
- **No required fields** - all extracted from natural language
- **Auto-categorization** with AI
- **Linked assets** from discovered infrastructure
- **Risk Treatment**: Accept, Mitigate, Transfer, Avoid

### 5.3 Compliance Management Module

- **Frameworks (MVP)**: SOC 2 Type II, ISO 27001, NIST CSF
- **Control Library**: Pre-built controls mapped to frameworks
- **Multi-framework mapping**: Single control satisfies multiple frameworks
- **Gap Analysis**: Coverage percentage, evidence gaps, testing gaps

### 5.4 Evidence Collection

| Integration | Evidence Types |
|-------------|---------------|
| **AWS** | CloudTrail, IAM policies, Security Hub, Config |
| **Azure** | Activity logs, RBAC, Security Center |
| **GitHub** | Branch protection, access controls, alerts |
| **Okta** | Access reviews, MFA status, provisioning |
| **Jira** | Change tickets, approvals |

### 5.5 Immutable Audit Log

- Cryptographic hash chain (SHA-512)
- Every entry references previous hash
- Database triggers prevent modification/deletion
- Auditor verification endpoint

---

## 6. MVP Scope (12 Weeks)

### In Scope
| Phase | Features |
|-------|----------|
| **Month 1** | Copilot core, risk register, SOC 2 framework, auth |
| **Month 2** | AWS/GitHub/Jira integrations, evidence collection |
| **Month 3** | ISO 27001, NIST CSF, gap analysis, auditor portal |

### Out of Scope (Post-MVP)
- Policy generation (Month 4)
- Azure/GCP integrations (Month 4)
- Vendor risk management (Month 5)
- Custom frameworks (Month 5)
- Mobile app (Month 6+)
- On-premise deployment (Month 6+)

---

## 7. Success Metrics

| Metric | Target (Month 3) | Target (Month 6) |
|--------|------------------|------------------|
| Time to first value | < 15 minutes | < 10 minutes |
| Fields for risk entry | 0 | 0 |
| Actions via copilot | 50% | 70% |
| Evidence automation | 40% | 70% |
| Audit prep time reduction | 30% | 50% |
| NPS | > 40 | > 50 |

---

## 8. Competitive Differentiation

| Competitor | Weakness | Aegis Advantage |
|------------|----------|-----------------|
| **Archer/ServiceNow** | $2M implementations | 15-minute setup |
| **Drata/Vanta** | Compliance-only | Full GRC scope |
| **Excel/SharePoint** | No intelligence | AI-powered copilot |
| **OneTrust** | Complex UX | Conversational interface |

---

## 9. Open Questions

1. Pricing model (per-user, per-framework, platform fee)?
2. Self-service vs. sales-led GTM?
3. On-premise requirement for enterprise?

---

## Appendix: Framework Control Counts

| Framework | Controls | MVP |
|-----------|----------|-----|
| SOC 2 Type II | ~60 TSC | Yes |
| ISO 27001:2022 | 93 (Annex A) | Yes |
| NIST CSF | 108 subcategories | Yes |
| PCI DSS 4.0 | 252 | Phase 2 |
| HIPAA | 54 | Phase 2 |
