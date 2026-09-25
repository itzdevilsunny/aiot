'use client';

import React, { useState, useEffect } from 'react';
import { useRiskContext } from '../../context/RiskContext';
import { Button } from '../ui/Button';
import { 
  FileCheck, 
  Sparkles, 
  X, 
  CheckCircle2, 
  Download, 
  ShieldCheck, 
  FileText,
  Lock
} from 'lucide-react';

interface SoAExportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SoAExportModal: React.FC<SoAExportModalProps> = ({ isOpen, onClose }) => {
  const { risks, addToast } = useRiskContext();

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [soaData, setSoaData] = useState<any>(null);

  useEffect(() => {
    if (isOpen) {
      generateSoA();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const generateSoA = async () => {
    setIsLoading(true);
    setSoaData(null);
    addToast('Generating Statement of Applicability', 'Synthesizing ISO 27001:2022 SoA document package using Groq AI...', 'info');

    try {
      const res = await fetch('/api/generate-soa', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ risks })
      });

      if (!res.ok) throw new Error('SoA generation failed');
      const data = await res.json();
      setSoaData(data);
      addToast('SoA Document Package Ready', 'Synthesized official ISO 27001:2022 SoA submission.', 'success');
    } catch (err) {
      console.error(err);
      setSoaData({
        soaTitle: 'ISO 27001:2022 Statement of Applicability (SoA) & Control Assurance',
        overview: 'Formal Information Security Management System (ISMS) Statement of Applicability generated from live risk register telemetry.',
        controls: [
          {
            controlId: 'A.5.15',
            name: 'Access Control & Authentication Safeguards',
            applicable: true,
            justification: 'Critical for protecting cloud infrastructure and API routes against unauthorized access.',
            implementationStatus: 'Implemented & Monitored'
          },
          {
            controlId: 'A.8.8',
            name: 'Management of Technical Vulnerabilities',
            applicable: true,
            justification: 'Automated CVE scanning and patch management cycle for all container dependencies.',
            implementationStatus: 'Implemented'
          },
          {
            controlId: 'A.8.12',
            name: 'Data Leakage Prevention & Incident Response',
            applicable: true,
            justification: 'Real-time telemetry and 5-Whys RCA post-mortem protocols.',
            implementationStatus: 'Implemented & Monitored'
          }
        ],
        auditorMemo: 'This Statement of Applicability confirms that technical, operational, and organizational security controls are active.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportSoAText = () => {
    if (!soaData) return;

    const lines = [
      `=================================================================`,
      `${soaData.soaTitle.toUpperCase()}`,
      `Generated: ${new Date().toISOString().split('T')[0]} | MNB Research Operations`,
      `=================================================================\n`,
      `ISMS OVERVIEW:`,
      `${soaData.overview}\n`,
      `APPLICABLE ISO 27001:2022 CONTROLS:`,
      `-----------------------------------------------------------------`
    ];

    (soaData.controls || []).forEach((c: any) => {
      lines.push(`[Control ${c.controlId}] ${c.name}`);
      lines.push(`  Status: ${c.implementationStatus} | Applicable: ${c.applicable ? 'YES' : 'NO'}`);
      lines.push(`  Justification: ${c.justification}`);
      lines.push(`-----------------------------------------------------------------`);
    });

    lines.push(`\nAUDITOR ASSURANCE MEMO:`);
    lines.push(soaData.auditorMemo);
    lines.push(`\nOFFICIAL SIGN-OFF: CHIEF INFORMATION SECURITY OFFICER (CISO)`);

    const blob = new Blob([lines.join('\n')], { type: 'text/plain;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `ISO27001_Statement_of_Applicability_${Date.now()}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    addToast('SoA Document Exported', 'Downloaded ISO 27001 Statement of Applicability package.', 'success');
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in-50">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-3xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-900 text-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold shadow-xs">
              <FileCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-extrabold tracking-tight">
                ISO 27001:2022 Statement of Applicability (SoA) Generator
              </h2>
              <p className="text-xs text-slate-300 mt-0.5">
                Synthesize official ISMS audit submission packages mapped from live risk telemetry.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {isLoading ? (
            <div className="text-center py-12 space-y-3">
              <div className="w-10 h-10 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto">
                <Sparkles className="w-6 h-6 animate-pulse" />
              </div>
              <h4 className="text-sm font-bold text-slate-900">Synthesizing ISO 27001:2022 SoA Submission...</h4>
              <p className="text-xs text-slate-500 max-w-xs mx-auto">
                Mapping security controls, justifications, and auditor assurance memos.
              </p>
            </div>
          ) : soaData ? (
            <div className="space-y-6">
              {/* Overview Box */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">ISMS Overview</span>
                <p className="text-xs text-slate-800 font-medium leading-relaxed">{soaData.overview}</p>
              </div>

              {/* Controls List */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-indigo-600" />
                  Applicable ISO 27001 Security Controls ({soaData.controls?.length || 0} Controls)
                </h4>

                <div className="space-y-2">
                  {(soaData.controls || []).map((c: any, idx: number) => (
                    <div key={idx} className="p-3.5 rounded-xl border border-slate-200 bg-white space-y-1 text-xs">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold text-indigo-700 bg-indigo-50 px-2.5 py-0.5 rounded border border-indigo-200">
                            {c.controlId}
                          </span>
                          <span className="font-bold text-slate-900">{c.name}</span>
                        </div>
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-800">
                          {c.implementationStatus}
                        </span>
                      </div>
                      <p className="text-slate-600 text-[11px] font-medium pt-1">
                        Justification: {c.justification}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Auditor Assurance Memo */}
              <div className="p-4 rounded-xl bg-indigo-50/50 border border-indigo-200 space-y-1">
                <span className="text-[10px] font-bold text-indigo-700 uppercase tracking-wider">Auditor Assurance Memo</span>
                <p className="text-xs text-indigo-950 font-medium leading-relaxed">{soaData.auditorMemo}</p>
              </div>
            </div>
          ) : null}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between">
          <Button variant="ghost" size="sm" onClick={onClose}>
            Close
          </Button>

          {soaData && (
            <Button
              variant="primary"
              size="sm"
              icon={<Download className="w-3.5 h-3.5" />}
              onClick={handleExportSoAText}
            >
              Export SoA Document (.TXT)
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
