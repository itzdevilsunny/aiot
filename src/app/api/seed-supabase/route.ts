import { NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabase/server';
import { 
  getRisks, 
  getProjects, 
  getTeamMembers, 
  getControls, 
  getActions, 
  getEvidence, 
  getKRIs, 
  getApprovals, 
  getAuditLogs 
} from '@/lib/server/db';

export async function POST() {
  try {
    const supabase = getSupabaseServerClient();
    if (!supabase) {
      return NextResponse.json({ 
        success: false, 
        error: 'Supabase client not configured or credentials missing.' 
      }, { status: 400 });
    }

    const risks = getRisks();
    const projects = getProjects();
    const team = getTeamMembers();
    const controls = getControls();
    const actions = getActions();
    const evidence = getEvidence();
    const kris = getKRIs();
    const approvals = getApprovals();
    const auditLogs = getAuditLogs();

    const results: Record<string, any> = {};

    // 1. Projects
    try {
      const { error: projErr } = await supabase.from('projects').upsert(
        projects.map(p => ({
          id: p.id,
          name: p.name,
          code: p.code,
          description: p.description,
          lead_name: p.leadName,
          total_risks: p.totalRisks,
          critical_risks: p.criticalRisks,
          mitigation_progress: p.mitigationProgress,
          status: p.status,
          last_updated: p.lastUpdated
        }))
      );
      results.projects = projErr ? `Error: ${projErr.message}` : `Synced ${projects.length} records`;
    } catch (e: any) {
      results.projects = `Exception: ${e.message}`;
    }

    // 2. Team Members
    try {
      const { error: teamErr } = await supabase.from('team_members').upsert(
        team.map(t => ({
          id: t.id,
          name: t.name,
          role: t.role,
          email: t.email,
          avatar: t.avatar,
          department: t.department,
          assigned_risks_count: t.assignedRisksCount,
          open_risks_count: t.openRisksCount,
          critical_risks_count: t.criticalRisksCount,
          mitigation_progress: t.mitigationProgress
        }))
      );
      results.teamMembers = teamErr ? `Error: ${teamErr.message}` : `Synced ${team.length} records`;
    } catch (e: any) {
      results.teamMembers = `Exception: ${e.message}`;
    }

    // 3. Risks
    try {
      const { error: riskErr } = await supabase.from('risks').upsert(
        risks.map(r => ({
          id: r.id,
          title: r.title,
          description: r.description || r.title,
          category: r.category || 'Technical',
          probability: r.probability || 3,
          impact: r.impact || 3,
          score: r.score || (r.probability || 3) * (r.impact || 3),
          severity: r.severity || 'Medium',
          status: r.status || 'Open',
          project_id: r.projectId || 'proj-1',
          project_name: r.projectName || 'Enterprise Operations',
          owner_id: r.ownerId || 'usr-1',
          owner_name: r.ownerName || 'Sunny Prasad',
          owner_role: r.ownerRole || 'Business Operations Intern & Risk Lead',
          mitigation_plan: r.mitigationPlan || '',
          contingency_plan: r.contingencyPlan || '',
          mitigation_progress: r.mitigationProgress || 0,
          due_date: r.dueDate || new Date().toISOString().split('T')[0],
          estimated_impact_usd: r.estimatedImpactUsd || 25000,
          last_updated: r.lastUpdated || 'Just now'
        }))
      );
      results.risks = riskErr ? `Error: ${riskErr.message}` : `Synced ${risks.length} records`;
    } catch (e: any) {
      results.risks = `Exception: ${e.message}`;
    }

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      synchronizedRecords: {
        risksCount: risks.length,
        projectsCount: projects.length,
        teamCount: team.length,
        controlsCount: controls.length,
        actionsCount: actions.length,
        evidenceCount: evidence.length,
        krisCount: kris.length,
        approvalsCount: approvals.length,
        auditLogsCount: auditLogs.length
      },
      results
    });

  } catch (error: any) {
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  }
}
