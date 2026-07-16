-- ══════════════════════════════════════════════
-- SA9 Enterprise Database Initialization
-- Creates databases for all enterprise services
-- ══════════════════════════════════════════════

-- PostHog analytics database
CREATE DATABASE posthog;

-- Twenty CRM database
CREATE DATABASE twenty_crm;

-- Listmonk email database
CREATE DATABASE listmonk;

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE posthog TO sa9;
GRANT ALL PRIVILEGES ON DATABASE twenty_crm TO sa9;
GRANT ALL PRIVILEGES ON DATABASE listmonk TO sa9;

-- SA9 Main Database Schema
\c sa9_main;

-- Enable extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Products table
CREATE TABLE IF NOT EXISTS products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    slug VARCHAR(100) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    tagline TEXT,
    description TEXT,
    type VARCHAR(50) NOT NULL,
    design_system VARCHAR(50) NOT NULL DEFAULT 'neon',
    status VARCHAR(50) NOT NULL DEFAULT 'development',
    subdomain VARCHAR(100),
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Contact submissions
CREATE TABLE IF NOT EXISTS contact_submissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'new',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- VAULT: Learning patterns
CREATE TABLE IF NOT EXISTS vault_patterns (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    category VARCHAR(100) NOT NULL,
    pattern_type VARCHAR(100) NOT NULL,
    content TEXT NOT NULL,
    confidence FLOAT DEFAULT 0.0,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- PULSE: CI/CD events
CREATE TABLE IF NOT EXISTS pulse_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_type VARCHAR(100) NOT NULL,
    product_slug VARCHAR(100),
    payload JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- BROADCAST: Social media queue
CREATE TABLE IF NOT EXISTS social_queue (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    platform VARCHAR(50) NOT NULL,
    content TEXT NOT NULL,
    media_urls TEXT[],
    scheduled_at TIMESTAMPTZ,
    published_at TIMESTAMPTZ,
    status VARCHAR(50) NOT NULL DEFAULT 'draft',
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- RADAR: Competitive intelligence
CREATE TABLE IF NOT EXISTS radar_signals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    source VARCHAR(255) NOT NULL,
    signal_type VARCHAR(100) NOT NULL,
    content TEXT NOT NULL,
    relevance_score FLOAT DEFAULT 0.0,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Job queue
CREATE TABLE IF NOT EXISTS job_queue (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    queue_name VARCHAR(100) NOT NULL,
    payload JSONB NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'pending',
    attempts INTEGER NOT NULL DEFAULT 0,
    max_attempts INTEGER NOT NULL DEFAULT 3,
    scheduled_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    error TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_products_slug ON products(slug);
CREATE INDEX idx_products_status ON products(status);
CREATE INDEX idx_job_queue_status ON job_queue(status, scheduled_at);
CREATE INDEX idx_pulse_events_type ON pulse_events(event_type, created_at);
CREATE INDEX idx_social_queue_status ON social_queue(status, scheduled_at);
CREATE INDEX idx_radar_signals_type ON radar_signals(signal_type, created_at);
CREATE INDEX idx_vault_patterns_category ON vault_patterns(category);
