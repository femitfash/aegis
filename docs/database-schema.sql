-- Aegis GRC Platform - Database Schema
-- PostgreSQL with Supabase (includes RLS)

-- Enable extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================================
-- ORGANIZATION & USERS
-- ============================================================================

CREATE TABLE organizations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    settings JSONB DEFAULT '{}',
    subscription_tier VARCHAR(50) DEFAULT 'trial',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL,
    full_name VARCHAR(255),
    role VARCHAR(50) DEFAULT 'member', -- admin, risk_manager, control_owner, viewer, auditor
    permissions JSONB DEFAULT '[]',
    last_active_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_users_org ON users(organization_id);
CREATE INDEX idx_users_email ON users(email);

-- ============================================================================
-- COMPLIANCE FRAMEWORKS
-- ============================================================================

CREATE TABLE compliance_frameworks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(50) UNIQUE NOT NULL,  -- 'SOC2', 'ISO27001', 'NIST_CSF'
    name VARCHAR(255) NOT NULL,
    version VARCHAR(20),
    description TEXT,
    structure JSONB NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE framework_requirements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    framework_id UUID REFERENCES compliance_frameworks(id) ON DELETE CASCADE,
    parent_id UUID REFERENCES framework_requirements(id),
    code VARCHAR(100) NOT NULL,        -- 'CC1.1', 'A.5.1'
    title VARCHAR(500) NOT NULL,
    description TEXT,
    guidance TEXT,
    level INTEGER DEFAULT 0,
    sort_order INTEGER DEFAULT 0,
    metadata JSONB DEFAULT '{}',
    UNIQUE(framework_id, code)
);

CREATE INDEX idx_framework_req_framework ON framework_requirements(framework_id);
CREATE INDEX idx_framework_req_parent ON framework_requirements(parent_id);

-- ============================================================================
-- CONTROL LIBRARY
-- ============================================================================

CREATE TABLE control_library (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    code VARCHAR(100) NOT NULL,
    title VARCHAR(500) NOT NULL,
    description TEXT,
    implementation_guidance TEXT,
    control_type VARCHAR(50),          -- preventive, detective, corrective
    automation_level VARCHAR(50),      -- manual, semi-automated, automated
    owner_id UUID REFERENCES users(id),
    status VARCHAR(50) DEFAULT 'draft', -- draft, active, deprecated
    effectiveness_rating INTEGER CHECK (effectiveness_rating BETWEEN 1 AND 5),
    evidence_requirements JSONB DEFAULT '[]',
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(organization_id, code)
);

CREATE INDEX idx_control_org ON control_library(organization_id);
CREATE INDEX idx_control_owner ON control_library(owner_id);
CREATE INDEX idx_control_status ON control_library(status);

-- Control to Framework Requirement mapping
CREATE TABLE control_requirement_mappings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    control_id UUID REFERENCES control_library(id) ON DELETE CASCADE,
    requirement_id UUID REFERENCES framework_requirements(id) ON DELETE CASCADE,
    coverage_level VARCHAR(50) DEFAULT 'full', -- full, partial, supports
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(control_id, requirement_id)
);

CREATE INDEX idx_ctrl_req_control ON control_requirement_mappings(control_id);
CREATE INDEX idx_ctrl_req_requirement ON control_requirement_mappings(requirement_id);

-- ============================================================================
-- RISK MANAGEMENT
-- ============================================================================

CREATE TABLE risk_categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    parent_id UUID REFERENCES risk_categories(id),
    color VARCHAR(7),
    sort_order INTEGER DEFAULT 0
);

CREATE TABLE risks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    risk_id VARCHAR(50) NOT NULL,      -- Human-readable: RISK-001
    title VARCHAR(500) NOT NULL,
    description TEXT NOT NULL,
    category_id UUID REFERENCES risk_categories(id),

    -- Risk Assessment (inherent)
    inherent_likelihood INTEGER CHECK (inherent_likelihood BETWEEN 1 AND 5),
    inherent_impact INTEGER CHECK (inherent_impact BETWEEN 1 AND 5),
    inherent_score INTEGER GENERATED ALWAYS AS (inherent_likelihood * inherent_impact) STORED,

    -- Risk Assessment (residual)
    residual_likelihood INTEGER CHECK (residual_likelihood BETWEEN 1 AND 5),
    residual_impact INTEGER CHECK (residual_impact BETWEEN 1 AND 5),
    residual_score INTEGER GENERATED ALWAYS AS (residual_likelihood * residual_impact) STORED,

    -- Risk Response
    risk_response VARCHAR(50),         -- accept, mitigate, transfer, avoid
    risk_appetite VARCHAR(50),         -- low, medium, high

    -- Ownership & Status
    owner_id UUID REFERENCES users(id),
    status VARCHAR(50) DEFAULT 'identified', -- identified, assessed, mitigated, accepted, closed
    due_date DATE,

    -- AI-Assisted Fields
    ai_suggestions JSONB DEFAULT '{}',
    ai_confidence JSONB DEFAULT '{}',

    -- Metadata
    tags TEXT[] DEFAULT '{}',
    metadata JSONB DEFAULT '{}',
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    UNIQUE(organization_id, risk_id)
);

CREATE INDEX idx_risks_org ON risks(organization_id);
CREATE INDEX idx_risks_status ON risks(status);
CREATE INDEX idx_risks_owner ON risks(owner_id);
CREATE INDEX idx_risks_score ON risks(inherent_score DESC);

-- Risks linked to controls
CREATE TABLE risk_control_mappings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    risk_id UUID REFERENCES risks(id) ON DELETE CASCADE,
    control_id UUID REFERENCES control_library(id) ON DELETE CASCADE,
    effectiveness VARCHAR(50),         -- high, medium, low
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(risk_id, control_id)
);

CREATE INDEX idx_risk_ctrl_risk ON risk_control_mappings(risk_id);
CREATE INDEX idx_risk_ctrl_control ON risk_control_mappings(control_id);

-- ============================================================================
-- EVIDENCE MANAGEMENT
-- ============================================================================

CREATE TABLE evidence (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    evidence_id VARCHAR(50) NOT NULL,  -- Human-readable: EVD-001
    title VARCHAR(500) NOT NULL,
    description TEXT,

    -- File/Content
    file_path VARCHAR(1000),
    file_hash VARCHAR(128),            -- SHA-512
    file_size_bytes BIGINT,
    mime_type VARCHAR(100),

    -- Source & Provenance
    source_type VARCHAR(50),           -- manual, integration, automated
    source_integration_id UUID,
    source_metadata JSONB DEFAULT '{}',

    -- Validity
    collected_at TIMESTAMPTZ NOT NULL,
    valid_from DATE,
    valid_to DATE,

    -- Status
    status VARCHAR(50) DEFAULT 'pending', -- pending, approved, rejected, expired
    reviewed_by UUID REFERENCES users(id),
    reviewed_at TIMESTAMPTZ,

    -- Metadata
    tags TEXT[] DEFAULT '{}',
    metadata JSONB DEFAULT '{}',
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),

    UNIQUE(organization_id, evidence_id)
);

CREATE INDEX idx_evidence_org ON evidence(organization_id);
CREATE INDEX idx_evidence_status ON evidence(status);
CREATE INDEX idx_evidence_source ON evidence(source_type);

-- Link evidence to controls
CREATE TABLE control_evidence_mappings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    control_id UUID REFERENCES control_library(id) ON DELETE CASCADE,
    evidence_id UUID REFERENCES evidence(id) ON DELETE CASCADE,
    period_start DATE,
    period_end DATE,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(control_id, evidence_id, period_start)
);

-- ============================================================================
-- ASSESSMENTS & AUDITS
-- ============================================================================

CREATE TABLE assessments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    assessment_id VARCHAR(50) NOT NULL,
    title VARCHAR(500) NOT NULL,
    assessment_type VARCHAR(50),       -- internal, external, self
    framework_id UUID REFERENCES compliance_frameworks(id),

    -- Period
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,

    -- Status
    status VARCHAR(50) DEFAULT 'planned', -- planned, in_progress, completed, cancelled
    progress_percentage INTEGER DEFAULT 0,

    -- Auditor
    auditor_firm VARCHAR(255),
    lead_auditor_email VARCHAR(255),

    -- Results
    findings_count INTEGER DEFAULT 0,
    exceptions_count INTEGER DEFAULT 0,
    opinion VARCHAR(50),               -- unqualified, qualified, adverse

    metadata JSONB DEFAULT '{}',
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ,

    UNIQUE(organization_id, assessment_id)
);

CREATE TABLE assessment_findings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    assessment_id UUID REFERENCES assessments(id) ON DELETE CASCADE,
    finding_id VARCHAR(50) NOT NULL,
    requirement_id UUID REFERENCES framework_requirements(id),
    control_id UUID REFERENCES control_library(id),

    severity VARCHAR(50),              -- critical, high, medium, low
    finding_type VARCHAR(50),          -- gap, exception, observation
    title VARCHAR(500) NOT NULL,
    description TEXT NOT NULL,
    recommendation TEXT,

    -- Remediation
    remediation_plan TEXT,
    remediation_owner_id UUID REFERENCES users(id),
    remediation_due_date DATE,
    remediation_status VARCHAR(50) DEFAULT 'open', -- open, in_progress, resolved, accepted

    created_at TIMESTAMPTZ DEFAULT NOW(),
    resolved_at TIMESTAMPTZ
);

-- ============================================================================
-- IMMUTABLE AUDIT LOG (Cryptographic Hash Chain)
-- ============================================================================

CREATE TABLE audit_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    sequence_number BIGSERIAL UNIQUE,

    -- Event Details
    organization_id UUID REFERENCES organizations(id),
    user_id UUID REFERENCES users(id),
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(100) NOT NULL,
    entity_id UUID NOT NULL,

    -- Change Data
    old_values JSONB,
    new_values JSONB,

    -- Context
    ip_address INET,
    user_agent TEXT,
    session_id UUID,
    request_id UUID,

    -- Cryptographic Chain
    previous_hash VARCHAR(128),
    entry_hash VARCHAR(128) NOT NULL,

    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_audit_log_sequence ON audit_log(sequence_number);
CREATE INDEX idx_audit_log_entity ON audit_log(entity_type, entity_id);
CREATE INDEX idx_audit_log_org_time ON audit_log(organization_id, created_at);
CREATE INDEX idx_audit_log_action ON audit_log(action);

-- Function to insert audit entry with hash chain
CREATE OR REPLACE FUNCTION insert_audit_log(
    p_org_id UUID,
    p_user_id UUID,
    p_action VARCHAR,
    p_entity_type VARCHAR,
    p_entity_id UUID,
    p_old_values JSONB,
    p_new_values JSONB,
    p_ip INET DEFAULT NULL,
    p_user_agent TEXT DEFAULT NULL,
    p_session_id UUID DEFAULT NULL,
    p_request_id UUID DEFAULT NULL
) RETURNS UUID AS $$
DECLARE
    v_id UUID;
    v_prev_hash VARCHAR(128);
    v_entry_hash VARCHAR(128);
    v_entry_data TEXT;
BEGIN
    -- Get previous hash
    SELECT entry_hash INTO v_prev_hash
    FROM audit_log
    ORDER BY sequence_number DESC
    LIMIT 1;

    IF v_prev_hash IS NULL THEN
        v_prev_hash := encode(digest('GENESIS_BLOCK', 'sha512'), 'hex');
    END IF;

    v_id := uuid_generate_v4();

    -- Compute entry hash
    v_entry_data := concat(
        v_id::text,
        COALESCE(p_org_id::text, ''),
        COALESCE(p_user_id::text, ''),
        p_action,
        p_entity_type,
        p_entity_id::text,
        COALESCE(p_old_values::text, ''),
        COALESCE(p_new_values::text, ''),
        v_prev_hash,
        NOW()::text
    );
    v_entry_hash := encode(digest(v_entry_data, 'sha512'), 'hex');

    INSERT INTO audit_log (
        id, organization_id, user_id, action, entity_type, entity_id,
        old_values, new_values, ip_address, user_agent, session_id,
        request_id, previous_hash, entry_hash
    ) VALUES (
        v_id, p_org_id, p_user_id, p_action, p_entity_type, p_entity_id,
        p_old_values, p_new_values, p_ip, p_user_agent, p_session_id,
        p_request_id, v_prev_hash, v_entry_hash
    );

    RETURN v_id;
END;
$$ LANGUAGE plpgsql;

-- Prevent modifications to audit log
CREATE OR REPLACE FUNCTION prevent_audit_modification()
RETURNS TRIGGER AS $$
BEGIN
    RAISE EXCEPTION 'Audit log entries cannot be modified or deleted';
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER audit_log_prevent_update
    BEFORE UPDATE ON audit_log
    FOR EACH ROW EXECUTE FUNCTION prevent_audit_modification();

CREATE TRIGGER audit_log_prevent_delete
    BEFORE DELETE ON audit_log
    FOR EACH ROW EXECUTE FUNCTION prevent_audit_modification();

-- ============================================================================
-- COPILOT CONVERSATIONS
-- ============================================================================

CREATE TABLE copilot_conversations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id),
    title VARCHAR(255),
    context JSONB DEFAULT '{}',
    status VARCHAR(50) DEFAULT 'active', -- active, archived
    created_at TIMESTAMPTZ DEFAULT NOW(),
    last_message_at TIMESTAMPTZ
);

CREATE TABLE copilot_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    conversation_id UUID REFERENCES copilot_conversations(id) ON DELETE CASCADE,
    role VARCHAR(20) NOT NULL,         -- user, assistant, system
    content TEXT NOT NULL,
    tool_calls JSONB DEFAULT '[]',
    tool_results JSONB DEFAULT '[]',
    tokens_used INTEGER,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_copilot_conv_org ON copilot_conversations(organization_id);
CREATE INDEX idx_copilot_conv_user ON copilot_conversations(user_id);
CREATE INDEX idx_copilot_msg_conv ON copilot_messages(conversation_id);

CREATE TABLE copilot_actions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    conversation_id UUID REFERENCES copilot_conversations(id),
    message_id UUID REFERENCES copilot_messages(id),
    action_type VARCHAR(100) NOT NULL,
    target_entity_type VARCHAR(100),
    target_entity_id UUID,
    payload JSONB NOT NULL,
    status VARCHAR(50) DEFAULT 'pending', -- pending, approved, executed, rejected
    executed_at TIMESTAMPTZ,
    executed_by UUID REFERENCES users(id),
    result JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- INTEGRATIONS
-- ============================================================================

CREATE TABLE integrations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    provider VARCHAR(100) NOT NULL,    -- aws, azure, gcp, jira, github
    name VARCHAR(255) NOT NULL,
    config JSONB NOT NULL,             -- Encrypted reference
    status VARCHAR(50) DEFAULT 'inactive', -- inactive, active, error
    last_sync_at TIMESTAMPTZ,
    last_sync_status VARCHAR(50),
    sync_frequency_minutes INTEGER DEFAULT 60,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_integrations_org ON integrations(organization_id);
CREATE INDEX idx_integrations_provider ON integrations(provider);

CREATE TABLE integration_sync_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    integration_id UUID REFERENCES integrations(id) ON DELETE CASCADE,
    started_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    status VARCHAR(50),
    records_processed INTEGER DEFAULT 0,
    records_created INTEGER DEFAULT 0,
    records_updated INTEGER DEFAULT 0,
    errors JSONB DEFAULT '[]'
);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================

ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE risks ENABLE ROW LEVEL SECURITY;
ALTER TABLE control_library ENABLE ROW LEVEL SECURITY;
ALTER TABLE evidence ENABLE ROW LEVEL SECURITY;
ALTER TABLE assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE copilot_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;

-- Users can only see their organization's data
CREATE POLICY org_isolation_users ON users
    USING (organization_id = (
        SELECT organization_id FROM users WHERE id = auth.uid()
    ));

CREATE POLICY org_isolation_risks ON risks
    USING (organization_id = (
        SELECT organization_id FROM users WHERE id = auth.uid()
    ));

CREATE POLICY org_isolation_controls ON control_library
    USING (organization_id = (
        SELECT organization_id FROM users WHERE id = auth.uid()
    ));

CREATE POLICY org_isolation_evidence ON evidence
    USING (organization_id = (
        SELECT organization_id FROM users WHERE id = auth.uid()
    ));

CREATE POLICY org_isolation_assessments ON assessments
    USING (organization_id = (
        SELECT organization_id FROM users WHERE id = auth.uid()
    ));

CREATE POLICY org_isolation_conversations ON copilot_conversations
    USING (organization_id = (
        SELECT organization_id FROM users WHERE id = auth.uid()
    ));

CREATE POLICY org_isolation_integrations ON integrations
    USING (organization_id = (
        SELECT organization_id FROM users WHERE id = auth.uid()
    ));

CREATE POLICY org_isolation_audit ON audit_log
    FOR SELECT
    USING (organization_id = (
        SELECT organization_id FROM users WHERE id = auth.uid()
    ));

-- Auditors get read-only access to specific assessments
CREATE POLICY auditor_access_assessments ON assessments
    FOR SELECT
    USING (
        lead_auditor_email = (auth.jwt() ->> 'email')
        OR organization_id = (
            SELECT organization_id FROM users WHERE id = auth.uid()
        )
    );

-- ============================================================================
-- HELPER FUNCTIONS
-- ============================================================================

-- Generate sequential IDs (RISK-001, CTRL-001, etc.)
CREATE OR REPLACE FUNCTION generate_entity_id(
    p_org_id UUID,
    p_prefix VARCHAR,
    p_table_name VARCHAR
) RETURNS VARCHAR AS $$
DECLARE
    v_count INTEGER;
BEGIN
    EXECUTE format(
        'SELECT COUNT(*) + 1 FROM %I WHERE organization_id = $1',
        p_table_name
    ) INTO v_count USING p_org_id;

    RETURN p_prefix || '-' || LPAD(v_count::text, 3, '0');
END;
$$ LANGUAGE plpgsql;

-- Updated at trigger
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_risks_updated_at
    BEFORE UPDATE ON risks
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_controls_updated_at
    BEFORE UPDATE ON control_library
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_orgs_updated_at
    BEFORE UPDATE ON organizations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_integrations_updated_at
    BEFORE UPDATE ON integrations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================================
-- SEED DATA: FRAMEWORKS
-- ============================================================================

-- SOC 2 Type II Trust Services Criteria (sample)
INSERT INTO compliance_frameworks (code, name, version, description, structure)
VALUES (
    'SOC2',
    'SOC 2 Type II',
    '2017',
    'AICPA Trust Services Criteria',
    '{"categories": ["CC", "A", "PI", "C", "P"]}'
);

-- ISO 27001:2022 (sample)
INSERT INTO compliance_frameworks (code, name, version, description, structure)
VALUES (
    'ISO27001',
    'ISO/IEC 27001:2022',
    '2022',
    'Information Security Management System',
    '{"annexes": ["A.5", "A.6", "A.7", "A.8"]}'
);

-- NIST CSF (sample)
INSERT INTO compliance_frameworks (code, name, version, description, structure)
VALUES (
    'NIST_CSF',
    'NIST Cybersecurity Framework',
    '2.0',
    'Framework for Improving Critical Infrastructure Cybersecurity',
    '{"functions": ["Identify", "Protect", "Detect", "Respond", "Recover"]}'
);
