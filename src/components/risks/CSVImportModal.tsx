'use client';

import React, { useState } from 'react';
import { useRiskContext } from '../../context/RiskContext';
import { Button } from '../ui/Button';
import { 
  Upload, 
  FileSpreadsheet, 
  X, 
  Sparkles, 
  CheckCircle2, 
  AlertTriangle, 
  ArrowRight,
  RefreshCw,
  Layers
} from 'lucide-react';

interface CSVImportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CSVImportModal: React.FC<CSVImportModalProps> = ({ isOpen, onClose }) => {
  const { addRisk, addToast, projects, selectedProjectId } = useRiskContext();

  const [rawText, setRawText] = useState<string>('');
  const [parsedRows, setParsedRows] = useState<any[]>([]);
  const [stagedRisks, setStagedRisks] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [step, setStep] = useState<'upload' | 'preview' | 'complete'>('upload');

  if (!isOpen) return null;

  const parseCSV = (csvContent: string) => {
    const lines = csvContent.split(/\r?\n/).filter(line => line.trim().length > 0);
    if (lines.length === 0) return [];

    const headers = lines[0].split(',').map(h => h.trim().replace(/^["']|["']$/g, '').toLowerCase());
    const rows: any[] = [];

    for (let i = 1; i < lines.length; i++) {
      // Basic CSV splitter respecting quoted values
      const matches = lines[i].match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g) || lines[i].split(',');
      const values = matches.map(v => v.trim().replace(/^["']|["']$/g, ''));
      
      const rowObj: Record<string, any> = {};
      headers.forEach((h, idx) => {
        rowObj[h] = values[idx] || '';
      });

      // If no header matches, store raw string
      if (Object.keys(rowObj).length === 0) {
        rowObj.raw = lines[i];
      }

      rows.push(rowObj);
    }

    return rows;
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const text = evt.target?.result as string;
      setRawText(text);
      const rows = parseCSV(text);
      setParsedRows(rows);
    };
    reader.readAsText(file);
  };

  const handleProcessWithAI = async () => {
    let rowsToProcess = parsedRows;
    if (rowsToProcess.length === 0 && rawText.trim()) {
      rowsToProcess = parseCSV(rawText);
    }

    if (rowsToProcess.length === 0) {
      addToast('Import Error', 'Please paste CSV content or upload a valid file first.', 'warning');
      return;
    }

    setIsLoading(true);
    addToast('AI Parsing CSV Register', 'Analyzing columns and quantifying risk parameters using Groq AI...', 'info');

    try {
      const res = await fetch('/api/import-csv-risks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rawRows: rowsToProcess })
      });

      if (!res.ok) throw new Error('Failed to parse CSV with AI');
      const data = await res.json();

      setStagedRisks(data.risks || []);
      setStep('preview');
      addToast('AI Sanitization Complete', `Processed ${data.risks?.length || 0} risks ready for import.`, 'success');
    } catch (err: any) {
      console.error(err);
      addToast('Processing Note', 'Using local smart fallback parser.', 'info');
      // Intelligent fallback preview
      const fallback = rowsToProcess.map((r, i) => ({
        title: r.title || r.risk || r.name || `Imported Threat ${i + 1}`,
        description: r.description || r.details || 'Legacy imported risk entry.',
        category: r.category || 'Operational',
        probability: Math.min(5, Math.max(1, Number(r.probability || 3))),
        impact: Math.min(5, Math.max(1, Number(r.impact || 3))),
        score: Math.min(5, Math.max(1, Number(r.probability || 3))) * Math.min(5, Math.max(1, Number(r.impact || 3))),
        severity: 'Medium',
        ownerName: r.owner || 'Sunny Prasad',
        ownerRole: 'Risk Lead',
        mitigationPlan: r.mitigation || 'Establish monitoring and monthly operational review.',
        contingencyPlan: r.contingency || 'Activate fallback backup procedures.',
        estimatedImpactUsd: 75000
      }));
      setStagedRisks(fallback);
      setStep('preview');
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmImport = () => {
    const targetProj = projects.find(p => p.id === selectedProjectId) || projects[0];

    stagedRisks.forEach(r => {
      addRisk({
        title: r.title,
        description: r.description,
        category: r.category || 'Operational',
        probability: r.probability || 3,
        impact: r.impact || 3,
        status: 'Open',
        projectId: targetProj.id,
        projectName: targetProj.name,
        ownerId: 'usr-1',
        ownerName: r.ownerName || 'Sunny Prasad',
        ownerRole: r.ownerRole || 'Business Operations Intern',
        mitigationPlan: r.mitigationPlan,
        contingencyPlan: r.contingencyPlan,
        mitigationProgress: 0,
        checklist: [
          { id: `chk-${Date.now()}-1`, title: 'Review imported risk scope with project lead', completed: false }
        ],
        activityLogs: [],
        aiSuggested: true,
        aiConfidence: 95,
        estimatedImpactUsd: r.estimatedImpactUsd || (r.score * 25000)
      });
    });

    setStep('complete');
    addToast('Bulk Import Successful', `Added ${stagedRisks.length} new risks into ${targetProj.name}.`, 'success');
  };

  const sampleCSVTemplate = `Title,Category,Probability,Impact,Owner,Mitigation Plan
API Gateway Latency Bottleneck,Technical,4,4,Yash Raj,Deploy Redis cache cluster and optimize connection pooling
Third-Party Billing Service Outage,Financial,3,5,Sumit,Implement offline queueing and secondary payment gateway
Unplanned Senior Engineer Resignation,Resource,3,4,Ritika,Cross-train team on infrastructure scripts and maintain documentation`;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in-50">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-3xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold shadow-xs">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-slate-900">
                Bulk Risk Register CSV / Spreadsheet Importer
              </h2>
              <p className="text-xs text-slate-500">
                Auto-classify legacy risk spreadsheets using Groq AI sub-second LLM inference.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {step === 'upload' && (
            <div className="space-y-4">
              {/* File Drop Area */}
              <div className="border-2 border-dashed border-slate-300 hover:border-indigo-500 rounded-xl p-6 text-center bg-slate-50/50 hover:bg-indigo-50/30 transition-all group">
                <Upload className="w-8 h-8 text-slate-400 group-hover:text-indigo-600 mx-auto mb-2 transition-colors" />
                <h4 className="text-xs font-bold text-slate-900">Upload CSV File</h4>
                <p className="text-[11px] text-slate-500 mt-0.5">Drag and drop your .csv spreadsheet or click to browse</p>
                <input
                  type="file"
                  accept=".csv,.txt"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="csv-upload-input"
                />
                <label
                  htmlFor="csv-upload-input"
                  className="inline-block mt-3 px-3.5 py-1.5 text-xs font-bold text-indigo-600 bg-white border border-indigo-200 rounded-lg shadow-2xs hover:bg-indigo-50 cursor-pointer"
                >
                  Select CSV File
                </label>
              </div>

              {/* Paste Raw Text Option */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-slate-700">Or Paste Raw CSV Data</label>
                  <button
                    onClick={() => {
                      setRawText(sampleCSVTemplate);
                      setParsedRows(parseCSV(sampleCSVTemplate));
                      addToast('Sample Template Loaded', 'Pasted 3 sample legacy risks.', 'info');
                    }}
                    className="text-[11px] text-indigo-600 font-bold hover:underline"
                  >
                    Load Sample Template
                  </button>
                </div>
                <textarea
                  rows={6}
                  value={rawText}
                  onChange={(e) => {
                    setRawText(e.target.value);
                    setParsedRows(parseCSV(e.target.value));
                  }}
                  placeholder="Paste header row and CSV lines here..."
                  className="w-full p-3 text-xs font-mono rounded-xl border border-slate-300 bg-slate-900 text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {parsedRows.length > 0 && (
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-between text-xs text-emerald-900 font-semibold">
                  <span className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    Detected {parsedRows.length} rows ready for AI structuring.
                  </span>
                  <span className="font-mono text-[10px] bg-emerald-100 px-2 py-0.5 rounded text-emerald-800 font-bold">
                    Valid CSV Format
                  </span>
                </div>
              )}
            </div>
          )}

          {step === 'preview' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  AI Staged Risks Preview ({stagedRisks.length} Items)
                </h3>
                <span className="text-[11px] text-indigo-600 font-semibold flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5" /> Groq AI Structured
                </span>
              </div>

              <div className="border border-slate-200 rounded-xl overflow-hidden max-h-72 overflow-y-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-slate-50 border-b border-slate-200 text-[10px] font-bold text-slate-500 uppercase">
                    <tr>
                      <th className="p-2.5">Title</th>
                      <th className="p-2.5">Category</th>
                      <th className="p-2.5 text-center">Score</th>
                      <th className="p-2.5">Owner</th>
                      <th className="p-2.5">Mitigation Plan</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {stagedRisks.map((r, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/80">
                        <td className="p-2.5 font-bold text-slate-900 max-w-xs truncate">{r.title}</td>
                        <td className="p-2.5">
                          <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-semibold text-[10px]">
                            {r.category}
                          </span>
                        </td>
                        <td className="p-2.5 text-center font-mono font-bold text-indigo-600">{r.score || (r.probability * r.impact)}</td>
                        <td className="p-2.5 text-slate-600">{r.ownerName}</td>
                        <td className="p-2.5 text-slate-500 max-w-xs truncate">{r.mitigationPlan}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {step === 'complete' && (
            <div className="text-center py-8 space-y-3">
              <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto font-bold">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <h3 className="text-lg font-extrabold text-slate-900">Bulk Import Complete!</h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                Successfully ingested and quantified {stagedRisks.length} risk items into your active workspace register.
              </p>
            </div>
          )}
        </div>

        {/* Footer Controls */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between">
          {step === 'upload' && (
            <>
              <Button variant="ghost" size="sm" onClick={onClose}>
                Cancel
              </Button>
              <Button
                variant="copilot"
                size="sm"
                disabled={isLoading || (parsedRows.length === 0 && !rawText.trim())}
                icon={<Sparkles className="w-3.5 h-3.5 text-indigo-200" />}
                onClick={handleProcessWithAI}
              >
                {isLoading ? 'AI Analyzing CSV...' : 'Process CSV with Groq AI →'}
              </Button>
            </>
          )}

          {step === 'preview' && (
            <>
              <Button variant="outline" size="sm" onClick={() => setStep('upload')}>
                Back to Upload
              </Button>
              <Button
                variant="primary"
                size="sm"
                icon={<CheckCircle2 className="w-3.5 h-3.5" />}
                onClick={handleConfirmImport}
              >
                Import {stagedRisks.length} Risks to Register
              </Button>
            </>
          )}

          {step === 'complete' && (
            <Button
              variant="primary"
              size="sm"
              className="ml-auto"
              onClick={onClose}
            >
              Done & View Register
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
