-- ============================================================
-- Vision-AIoT Defense Surveillance System - Supabase SQL Schema
-- Paste this script directly into your Supabase SQL Editor:
-- https://supabase.com/dashboard/project/qrpedhptgihapolvziil/sql/new
-- ============================================================

-- 1. Create Enums
CREATE TYPE "Role" AS ENUM ('ADMIN', 'OPERATOR', 'VIEWER');
CREATE TYPE "Severity" AS ENUM ('LOW', 'MEDIUM', 'CRITICAL');

-- 2. Create User Table
CREATE TABLE IF NOT EXISTS "User" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "name" TEXT NOT NULL,
    "email" TEXT UNIQUE NOT NULL,
    "password" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'VIEWER',
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Create Camera Table
CREATE TABLE IF NOT EXISTS "Camera" (
    "id" TEXT PRIMARY KEY,
    "name" TEXT NOT NULL,
    "zone" TEXT NOT NULL,
    "lat" DOUBLE PRECISION,
    "lng" DOUBLE PRECISION,
    "status" TEXT NOT NULL DEFAULT 'offline',
    "streamUrl" TEXT,
    "fps" INTEGER NOT NULL DEFAULT 30,
    "resolution" TEXT NOT NULL DEFAULT '1080p',
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Create Alert Table
CREATE TABLE IF NOT EXISTS "Alert" (
    "id" TEXT PRIMARY KEY DEFAULT ('evt_' || floor(extract(epoch from now()) * 1000)::text),
    "cameraId" TEXT NOT NULL REFERENCES "Camera"("id") ON DELETE CASCADE,
    "type" TEXT NOT NULL,
    "severity" "Severity" NOT NULL DEFAULT 'MEDIUM',
    "confidence" DOUBLE PRECISION NOT NULL DEFAULT 0.85,
    "imageUrl" TEXT,
    "timestamp" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    "status" TEXT NOT NULL DEFAULT 'Pending',
    "operatorNotes" TEXT
);

-- 5. Enable Row Level Security (RLS) & Public Read Access
ALTER TABLE "User" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Camera" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Alert" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access on Camera" ON "Camera" FOR SELECT USING (true);
CREATE POLICY "Allow public read access on Alert" ON "Alert" FOR SELECT USING (true);
CREATE POLICY "Allow authenticated full access on Alert" ON "Alert" FOR ALL USING (true);

-- 6. Insert Seed Data
INSERT INTO "Camera" ("id", "name", "zone", "lat", "lng", "status", "resolution", "fps")
VALUES 
    ('CAM-01', 'Main Gate', 'Perimeter Security', 28.6139, 77.2090, 'online', '4K Ultra HD', 60),
    ('CAM-02', 'Perimeter Fence A', 'Perimeter Security', 28.6186, 77.2153, 'online', '1080p Full HD', 30),
    ('CAM-03', 'Parking Structure', 'Municipal Parking', 28.6100, 77.2000, 'offline', '1080p Full HD', 0),
    ('CAM-04', 'Live AI Camera Feed', 'Perimeter Security', 28.6200, 77.2100, 'online', '4K Ultra HD', 60)
ON CONFLICT ("id") DO NOTHING;
