# Aegis - GRC Platform

## Project Overview

Aegis is a **copilot-first** Governance, Risk, and Compliance (GRC) platform that transforms how organizations manage security compliance.

**Vision**: Make security compliance invisible - embedded in workflows, measured by risk reduction, managed through conversation.

**Key Differentiators**:
1. **Copilot-First**: AI chat is the PRIMARY interface, not an add-on
2. **Zero-Field Forms**: Natural language input, AI extracts structured data
3. **Outcome Metrics**: Track actual risk reduction, not checkbox completion
4. **Auditor Trust**: Immutable audit logs with cryptographic hash chains
5. **Work Anywhere**: Jira/Slack integration, work in preferred tools

## Technology Stack

| Layer | Technology |
|-------|------------|
| Frontend | Next.js 14+ (App Router), TypeScript, shadcn/ui, Tailwind |
| State | TanStack Query (server), Zustand (client) |
| Backend | Next.js API routes, Supabase Edge Functions |
| Database | PostgreSQL via Supabase (with RLS) |
| Auth | Supabase Auth (OAuth, MFA) |
| AI | Claude API (claude-sonnet-4-20250514) |
| Storage | Supabase Storage |
| Deployment | Kubernetes (AKS/EKS/GKE) |

## Project Structure

```
aegis/
├── .claude/
│   ├── skills/           # Agent skills
│   │   ├── product-owner/
│   │   ├── architect/
│   │   ├── developer/
│   │   ├── security-reviewer/
│   │   └── qa-agent/
│   └── agents/           # Subagent configurations
├── docs/
│   ├── PRD.md           # Product requirements
│   ├── architecture.md  # System architecture
│   └── database-schema.sql
├── src/
│   ├── app/             # Next.js App Router
│   │   ├── (auth)/      # Auth routes (login, register)
│   │   ├── (dashboard)/ # Protected routes
│   │   │   ├── layout.tsx
│   │   │   ├── risks/
│   │   │   ├── controls/
│   │   │   ├── evidence/
│   │   │   └── settings/
│   │   ├── api/         # API routes
│   │   │   ├── copilot/
│   │   │   └── webhooks/
│   │   └── auditor/     # Auditor portal
│   ├── features/        # Feature modules
│   │   ├── copilot/     # AI copilot
│   │   ├── risks/       # Risk management
│   │   ├── controls/    # Control library
│   │   ├── evidence/    # Evidence collection
│   │   └── frameworks/  # Compliance frameworks
│   ├── shared/          # Shared code
│   │   ├── components/  # UI components
│   │   ├── lib/         # Utilities
│   │   └── hooks/       # Custom hooks
│   └── types/           # TypeScript types
├── tests/
│   ├── unit/
│   ├── integration/
│   └── e2e/
└── infrastructure/
    ├── terraform/
    └── helm/
```

## Code Conventions

### TypeScript

```typescript
// Always use explicit types
interface Risk {
  id: string;
  title: string;
  description: string;
  likelihood: number;
  impact: number;
  score: number;
  status: RiskStatus;
  ownerId: string;
  createdAt: Date;
}

// Use const assertions for union types
const RiskStatus = {
  IDENTIFIED: 'identified',
  ASSESSED: 'assessed',
  MITIGATED: 'mitigated',
  ACCEPTED: 'accepted',
} as const;

type RiskStatus = typeof RiskStatus[keyof typeof RiskStatus];

// Prefer interfaces for objects, types for unions/primitives
type RiskScore = number; // 1-25
interface RiskFilters {
  status?: RiskStatus;
  minScore?: number;
  ownerId?: string;
}
```

### React Components

```typescript
// Use function declarations for components
interface RiskCardProps {
  risk: Risk;
  onUpdate?: (risk: Risk) => void;
}

export function RiskCard({ risk, onUpdate }: RiskCardProps) {
  // Hooks at top
  const [isEditing, setIsEditing] = useState(false);

  // Event handlers
  const handleSave = useCallback(() => {
    // ...
  }, []);

  // JSX
  return (
    <Card>
      {/* ... */}
    </Card>
  );
}
```

### File Naming

- Components: `PascalCase.tsx` (e.g., `RiskCard.tsx`)
- Hooks: `use*.ts` (e.g., `useRisks.ts`)
- Utilities: `kebab-case.ts` (e.g., `risk-calculator.ts`)
- Types: `*.types.ts` (e.g., `risk.types.ts`)
- Tests: `*.test.ts` or `*.spec.ts`

### API Routes

```typescript
// app/api/risks/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/shared/lib/supabase/server';
import { riskSchema } from '@/features/risks/risk.schema';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const body = await request.json();

    // Validate input
    const validated = riskSchema.parse(body);

    // Execute
    const { data, error } = await supabase
      .from('risks')
      .insert(validated)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    // Handle errors appropriately
    return NextResponse.json(
      { error: 'Failed to create risk' },
      { status: 500 }
    );
  }
}
```

## Agent Collaboration

### Available Agent Skills

| Skill | Invoke | Purpose |
|-------|--------|---------|
| `/product-owner` | PRD, user stories, backlog | Product decisions |
| `/architect` | System design, database, APIs | Technical architecture |
| `/developer` | Implementation, code | Writing code |
| `/security-reviewer` | Security review, threats | Security validation |
| `/qa-agent` | Tests, quality | Quality assurance |

### Collaboration Patterns

1. **Feature Development Flow**:
   - `/product-owner` defines user story
   - `/architect` designs technical approach
   - `/developer` implements
   - `/security-reviewer` reviews security
   - `/qa-agent` writes tests

2. **Bug Fix Flow**:
   - `/developer` investigates and fixes
   - `/qa-agent` verifies fix
   - `/security-reviewer` checks if security-related

3. **Architecture Decision**:
   - `/architect` proposes design
   - `/developer` provides implementation feedback
   - `/security-reviewer` validates security

## Key Documentation

| Document | Path | Purpose |
|----------|------|---------|
| PRD | `docs/PRD.md` | Product requirements |
| Architecture | `docs/architecture.md` | System design |
| Database | `docs/database-schema.sql` | Schema definition |
| Plan | `.claude/plans/` | Current implementation plan |

## Development Commands

```bash
# Development
npm run dev          # Start dev server
npm run build        # Production build
npm run lint         # Run ESLint
npm run type-check   # TypeScript check

# Testing
npm run test         # Run unit tests
npm run test:watch   # Watch mode
npm run test:e2e     # Run Playwright tests
npm run test:coverage # Generate coverage

# Database
npx supabase start   # Start local Supabase
npx supabase db reset # Reset database
npx supabase gen types typescript # Generate types
```

## Environment Variables

```bash
# .env.local
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
ANTHROPIC_API_KEY=
```

## Compliance Frameworks (MVP)

- SOC 2 Type II (~60 Trust Services Criteria)
- ISO 27001:2022 (93 Annex A controls)
- NIST CSF (108 subcategories)

## Security Requirements

Since Aegis is a GRC platform, it must implement the controls it helps others implement:

1. **Authentication**: OAuth 2.0, MFA support
2. **Authorization**: RBAC with RLS in database
3. **Encryption**: At rest (AES-256), in transit (TLS 1.3)
4. **Audit**: Immutable log with hash chain
5. **Data Protection**: Input validation, output encoding

## Git Conventions

```bash
# Branch naming
feature/risk-management
fix/copilot-streaming
chore/update-deps

# Commit messages
feat: add risk creation via copilot
fix: resolve streaming timeout issue
docs: update architecture diagram
test: add e2e tests for evidence upload
```
