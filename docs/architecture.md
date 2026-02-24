# System Architecture - Aegis GRC Platform

**Version:** 1.0
**Date:** February 20, 2026

---

## 1. Overview

Aegis is a **copilot-first** GRC platform built with a modern, scalable architecture designed for multi-cloud deployment.

### Design Principles
1. **Copilot-Native**: AI is the core, not bolted on
2. **API-First**: All functionality via API
3. **Multi-Tenant**: Secure isolation via RLS
4. **Event-Driven**: Real-time updates
5. **Immutable Audit**: Cryptographic verification

---

## 2. High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                           CLIENT LAYER                               │
│  ┌─────────────────┐  ┌─────────────────┐  ┌───────────────────┐   │
│  │  Copilot Panel  │  │   Dashboard     │  │   Auditor Portal  │   │
│  │  (PRIMARY UX)   │  │   (Secondary)   │  │   (Read-only)     │   │
│  └────────┬────────┘  └────────┬────────┘  └─────────┬─────────┘   │
└───────────┼────────────────────┼────────────────────┼───────────────┘
            │                    │                    │
            └────────────────────┼────────────────────┘
                                 ▼
┌─────────────────────────────────────────────────────────────────────┐
│                          API GATEWAY                                 │
│        Kong / Traefik (Rate Limiting, Auth, Routing, TLS)           │
└─────────────────────────────────────────────────────────────────────┘
                                 │
         ┌───────────────────────┼───────────────────────┐
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│ COPILOT SERVICE │    │  CORE SERVICE   │    │ INTEGRATION SVC │
│                 │    │                 │    │                 │
│ - Claude API    │    │ - Risk Mgmt     │    │ - AWS Connector │
│ - Tool Calling  │    │ - Controls      │    │ - GitHub        │
│ - Streaming     │    │ - Evidence      │    │ - Jira          │
│ - Conversation  │    │ - Frameworks    │    │ - Webhooks      │
│ - Actions       │    │ - Assessments   │    │ - Sync Engine   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 ▼
┌─────────────────────────────────────────────────────────────────────┐
│                           DATA LAYER                                 │
│  ┌───────────────┐  ┌───────────────┐  ┌───────────────────────┐   │
│  │  PostgreSQL   │  │    Redis      │  │    S3 / Blob          │   │
│  │  (via Supabase│  │  (Cache/Queue)│  │    (Evidence Files)   │   │
│  │  with RLS)    │  │               │  │                       │   │
│  └───────────────┘  └───────────────┘  └───────────────────────┘   │
│                                                                      │
│  ┌───────────────────────────────────────────────────────────────┐  │
│  │               IMMUTABLE AUDIT LOG (Hash Chain)                 │  │
│  │    [Entry N-2] ──SHA512──▶ [Entry N-1] ──SHA512──▶ [Entry N]  │  │
│  └───────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────────┐
│                      EXTERNAL INTEGRATIONS                           │
│  ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐ │
│  │  AWS   │ │ Azure  │ │  GCP   │ │  Jira  │ │ GitHub │ │  Okta  │ │
│  └────────┘ └────────┘ └────────┘ └────────┘ └────────┘ └────────┘ │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 3. Component Details

### 3.1 Frontend (Next.js 14+)

```
src/
├── app/                      # App Router
│   ├── (auth)/              # Auth routes
│   │   ├── login/
│   │   └── register/
│   ├── (dashboard)/         # Protected routes
│   │   ├── layout.tsx       # Dashboard shell + Copilot
│   │   ├── page.tsx         # Dashboard home
│   │   ├── risks/
│   │   ├── controls/
│   │   ├── evidence/
│   │   └── settings/
│   ├── api/                 # API routes
│   │   ├── copilot/
│   │   │   └── route.ts     # Streaming endpoint
│   │   ├── risks/
│   │   ├── controls/
│   │   └── webhooks/
│   └── auditor/             # External auditor portal
├── features/                # Feature modules
│   ├── copilot/
│   │   ├── components/
│   │   │   ├── CopilotPanel.tsx
│   │   │   ├── MessageThread.tsx
│   │   │   └── ActionPreview.tsx
│   │   ├── hooks/
│   │   │   └── useCopilot.ts
│   │   └── actions/
│   ├── risks/
│   ├── controls/
│   └── evidence/
└── shared/
    ├── components/ui/       # shadcn/ui
    ├── lib/
    │   ├── supabase/
    │   └── utils/
    └── hooks/
```

### 3.2 Copilot Service

The copilot uses Claude's tool calling to execute GRC actions.

#### Tool Definitions

```typescript
const GRCTools = [
  {
    name: 'create_risk',
    description: 'Create a risk from natural language description',
    input_schema: {
      type: 'object',
      properties: {
        description: { type: 'string' },
        // AI extracts other fields
      },
      required: ['description']
    }
  },
  {
    name: 'search_controls',
    description: 'Find controls matching criteria',
    input_schema: {
      type: 'object',
      properties: {
        query: { type: 'string' },
        framework: { type: 'string' }
      }
    }
  },
  {
    name: 'generate_compliance_report',
    description: 'Generate compliance status report',
    input_schema: {
      type: 'object',
      properties: {
        framework: { type: 'string' },
        format: { type: 'string', enum: ['summary', 'detailed'] }
      }
    }
  },
  // ... more tools
];
```

#### System Prompt (Core)

```
You are the GRC Copilot, the PRIMARY interface for Aegis.
Users interact conversationally instead of filling forms.

Principles:
1. PROACTIVE: Infer fields, ask only for ambiguous items
2. CONVERSATIONAL: Natural dialogue, not form fields
3. RISK-CENTRIC: Frame everything around risk
4. ACTION-ORIENTED: Offer to execute when ready

When a user describes a risk, extract:
- Title, Description, Category
- Likelihood (1-5), Impact (1-5)
- Suggested controls from library
- Owner if mentioned

Preview actions before execution.
```

### 3.3 Core Service

Handles business logic for GRC operations:

| Domain | Responsibilities |
|--------|------------------|
| **Risks** | CRUD, scoring, treatment tracking |
| **Controls** | Library management, mapping |
| **Evidence** | Collection, verification, expiration |
| **Frameworks** | SOC 2, ISO 27001, NIST CSF data |
| **Assessments** | Audits, findings, remediation |

### 3.4 Integration Service

Manages external connections:

```typescript
interface Connector {
  provider: string;
  connect(): Promise<void>;
  fetchResources(type: string): Promise<Resource[]>;
  subscribeToChanges?(callback: Function): Promise<void>;
}

// Example: AWS Connector
class AWSConnector implements Connector {
  async fetchResources(type: 'ec2' | 's3' | 'iam') {
    // Use AWS SDK to fetch and transform
  }
}
```

---

## 4. Database Schema

See `docs/database-schema.sql` for full schema.

### Core Entities

```
organizations ─┬─ users
               ├─ risks ──── risk_control_mappings ──── control_library
               ├─ control_library ──── control_requirement_mappings
               ├─ compliance_frameworks ──── framework_requirements
               ├─ evidence ──── control_evidence_mappings
               ├─ assessments ──── assessment_findings
               ├─ copilot_conversations ──── copilot_messages
               └─ audit_log (immutable, hash-chained)
```

### Row Level Security

```sql
-- All tables use RLS for multi-tenant isolation
ALTER TABLE risks ENABLE ROW LEVEL SECURITY;

CREATE POLICY org_isolation ON risks
  USING (organization_id = (
    SELECT organization_id FROM users WHERE id = auth.uid()
  ));
```

---

## 5. Security Architecture

### 5-Layer Security Model

```
┌─────────────────────────────────────────────────────────────────────┐
│ LAYER 1: EDGE         WAF, DDoS Protection, Bot Management         │
├─────────────────────────────────────────────────────────────────────┤
│ LAYER 2: NETWORK      TLS 1.3, mTLS (service-to-service)           │
├─────────────────────────────────────────────────────────────────────┤
│ LAYER 3: APPLICATION  Supabase Auth (JWT), RBAC, Input Validation  │
├─────────────────────────────────────────────────────────────────────┤
│ LAYER 4: DATA         RLS, Column Encryption, Secrets Management   │
├─────────────────────────────────────────────────────────────────────┤
│ LAYER 5: AUDIT        Immutable Log, Hash Chain, Evidence Provenance│
└─────────────────────────────────────────────────────────────────────┘
```

### Authentication (Supabase Auth)

- OAuth 2.0 (Google, Microsoft, GitHub)
- Magic link email
- MFA support
- JWT tokens with custom claims

### Authorization (RBAC)

| Role | Permissions |
|------|-------------|
| **Admin** | Full access |
| **Risk Manager** | CRUD risks, controls; read all |
| **Control Owner** | Update assigned controls |
| **Viewer** | Read-only access |
| **Auditor** | Read + evidence verification |

---

## 6. Kubernetes Deployment

### Multi-Cloud Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                     GLOBAL TRAFFIC (CloudFlare)                      │
└───────────────────────────────┬─────────────────────────────────────┘
                                │
        ┌───────────────────────┼───────────────────────┐
        ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   AWS (EKS)     │    │  Azure (AKS)    │    │   GCP (GKE)     │
│   US Region     │    │   EU Region     │    │   APAC Region   │
│                 │    │                 │    │                 │
│  ┌───────────┐  │    │  ┌───────────┐  │    │  ┌───────────┐  │
│  │  Ingress  │  │    │  │  Ingress  │  │    │  │  Ingress  │  │
│  └─────┬─────┘  │    │  └─────┬─────┘  │    │  └─────┬─────┘  │
│        │        │    │        │        │    │        │        │
│  ┌─────▼─────┐  │    │  ┌─────▼─────┐  │    │  ┌─────▼─────┐  │
│  │ Namespace │  │    │  │ Namespace │  │    │  │ Namespace │  │
│  │grc-system │  │    │  │grc-system │  │    │  │grc-system │  │
│  │           │  │    │  │           │  │    │  │           │  │
│  │ Frontend  │  │    │  │ Frontend  │  │    │  │ Frontend  │  │
│  │ Copilot   │  │    │  │ Copilot   │  │    │  │ Copilot   │  │
│  │ Core      │  │    │  │ Core      │  │    │  │ Core      │  │
│  │ Integr.   │  │    │  │ Integr.   │  │    │  │ Integr.   │  │
│  └───────────┘  │    │  └───────────┘  │    │  └───────────┘  │
│                 │    │                 │    │                 │
│  ┌───────────┐  │    │  ┌───────────┐  │    │  ┌───────────┐  │
│  │ PostgreSQL│  │    │  │ PostgreSQL│  │    │  │ PostgreSQL│  │
│  │ (RDS)     │  │    │  │ (Azure)   │  │    │  │ (CloudSQL)│  │
│  └───────────┘  │    │  └───────────┘  │    │  └───────────┘  │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Helm Values (Sample)

```yaml
# values.yaml
global:
  imageRegistry: ghcr.io/aegis

frontend:
  replicaCount: 3
  resources:
    requests: { cpu: 500m, memory: 512Mi }
  autoscaling:
    enabled: true
    minReplicas: 3
    maxReplicas: 20

copilot:
  replicaCount: 3
  nodeSelector:
    workload: copilot
  resources:
    requests: { cpu: 1000m, memory: 2Gi }
  env:
    ANTHROPIC_API_KEY:
      secretKeyRef:
        name: grc-secrets
        key: anthropic-api-key

coreService:
  replicaCount: 5
  autoscaling:
    enabled: true
```

---

## 7. API Design

### REST Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/copilot` | Streaming chat endpoint |
| GET | `/api/risks` | List risks |
| POST | `/api/risks` | Create risk |
| GET | `/api/risks/:id` | Get risk details |
| PATCH | `/api/risks/:id` | Update risk |
| GET | `/api/controls` | List controls |
| POST | `/api/controls/map` | Map control to framework |
| GET | `/api/evidence` | List evidence |
| POST | `/api/evidence` | Upload evidence |
| GET | `/api/frameworks/:id/status` | Compliance status |
| GET | `/api/audit-log` | Query audit log |
| GET | `/api/audit-log/verify` | Verify chain integrity |

### Copilot Streaming Response

```typescript
// POST /api/copilot
interface CopilotRequest {
  message: string;
  conversationId?: string;
  context?: {
    page: string;
    entityId?: string;
  };
}

// Response: Server-Sent Events
// event: text
// data: {"content": "I'll help you create..."}

// event: tool_call
// data: {"name": "create_risk", "input": {...}}

// event: action_preview
// data: {"type": "create", "entity": "risk", "preview": {...}}
```

---

## 8. Data Flow

### Risk Creation via Copilot

```
User Input: "Our S3 buckets might be publicly accessible"
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────────┐
│                        COPILOT SERVICE                               │
│  1. Parse natural language                                           │
│  2. Call Claude with create_risk tool                                │
│  3. Extract: category=security, likelihood=4, impact=5              │
│  4. Search control library for related controls                      │
│  5. Generate action preview                                          │
└───────────────────────────────┬─────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────────┐
│                        ACTION PREVIEW                                │
│  "I'll create a risk with:"                                          │
│  - Title: S3 Public Access Exposure                                  │
│  - Category: Security                                                │
│  - Likelihood: 4, Impact: 5, Score: 20                              │
│  - Suggested controls: [S3-001, S3-002]                             │
│  "Should I proceed?"                                                 │
└───────────────────────────────┬─────────────────────────────────────┘
                                │
                    User confirms: "Yes"
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────────┐
│                         CORE SERVICE                                 │
│  1. Validate input                                                   │
│  2. Insert into risks table                                          │
│  3. Create risk_control_mappings                                     │
│  4. Emit risk.created event                                          │
└───────────────────────────────┬─────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────────┐
│                         AUDIT LOG                                    │
│  - Action: risk.create                                               │
│  - Entity: risk:uuid                                                 │
│  - New values: {...}                                                 │
│  - Hash: sha512(previous_hash + entry_data)                         │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 9. Scalability Strategy

| Component | Strategy |
|-----------|----------|
| **Frontend** | HPA on CPU, CDN for static assets |
| **Copilot** | HPA on active conversations, dedicated node pool |
| **Core Service** | HPA on request rate |
| **Integration** | Job-based scaling, message queue |
| **PostgreSQL** | Read replicas + PgBouncer |
| **Redis** | Cluster for sharding |

---

## 10. Monitoring & Observability

- **Metrics**: Prometheus + Grafana
- **Logging**: Structured JSON, aggregated to Loki
- **Tracing**: OpenTelemetry
- **Alerts**: PagerDuty integration

### Key Metrics
- Copilot response latency
- Tool call success rate
- Evidence collection freshness
- Audit log chain integrity
- API error rates
