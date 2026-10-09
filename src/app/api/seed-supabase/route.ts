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
          description: r.description,
          category: r.category,
          probability: r.probability || 3,
          impact: r.impact || 3,
          score: r.score || 9,
          severity: r.severity || 'Medium',
          inherent_probability: r.inherentProbability || r.probability || 3,
          inherent_impact: r.inherentImpact || r.impact || 3,
          inherent_score: r.inherentScore || r.score || 9,
          inherent_severity: r.inherentSeverity || r.severity || 'Medium',
          residual_probability: r.residualProbability || 2,
          residual_impact: r.residualImpact || 2,
          residual_score: r.residualScore || 4,
          residual_severity: r.residualSeverity || 'Low',
          status: r.status,
          project_id: r.projectId,
          project_name: r.projectName,
          owner_id: r.ownerId,
          owner_name: r.ownerName,
          owner_role: r.ownerRole,
          mitigation_plan: r.mitigationPlan,
          contingency_plan: r.contingencyPlan,
          mitigation_progress: r.mitigationProgress || 0,
          due_date: r.dueDate,
          estimated_impact_usd: r.estimatedImpactUsd || 0,
          last_updated: r.lastUpdated
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
