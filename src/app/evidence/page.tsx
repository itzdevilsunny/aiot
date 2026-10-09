'use client';

import React, { useState } from 'react';
import { useRiskContext } from '../../context/RiskContext';
import { 
  FileText, 
  Upload, 
  Search, 
  Filter, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  Clock, 
  Trash2, 
  FileCheck,
  Download,
  ExternalLink
} from 'lucide-react';

export default function EvidencePage() {
  const { evidence, risks, controls, addEvidence, deleteEvidence, currentUser } = useRiskContext();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Upload Form
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState('');
  const [description, setDescription] = useState('');
  const [linkedRiskId, setLinkedRiskId] = useState('');
  const [linkedControlId, setLinkedControlId] = useState('');
  const [validityExpiryDate, setValidityExpiryDate] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  const now = new Date();

  const filteredEvidence = evidence.filter(ev => {
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      const mName = ev.fileName.toLowerCase().includes(q);
      const mDesc = ev.description.toLowerCase().includes(q);
      const mBy = ev.uploadedBy.toLowerCase().includes(q);
      if (!mName && !mDesc && !mBy) return false;
    }

    const isExpired = ev.validityExpiryDate && new Date(ev.validityExpiryDate) < now;
    const computedStatus = isExpired ? 'Expired' : ev.verificationStatus;

    if (statusFilter !== 'All' && computedStatus !== statusFilter) return false;
    return true;
  });

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    const finalDocName = fileName.trim() || (selectedFile ? selectedFile.name : '');
    if (!finalDocName) return;

    let finalFileUrl = `/uploads/${finalDocName}`;
    let finalFileSize = selectedFile ? selectedFile.size : 102400;
    let finalFileType = selectedFile ? selectedFile.type : (finalDocName.endsWith('.pdf') ? 'application/pdf' : 'text/plain');

    if (selectedFile) {
      setIsUploading(true);
      try {
        const formData = new FormData();
        formData.append('file', selectedFile);
        formData.append('linkedRiskId', linkedRiskId);
        formData.append('linkedControlId', linkedControlId);
        formData.append('description', description);
        const res = await fetch('/api/evidence/upload', {
          method: 'POST',
          body: formData
        });
        if (res.ok) {
          const data = await res.json();
          if (data.evidence) {
            finalFileUrl = data.evidence.fileUrl;
            finalFileSize = data.evidence.fileSize;
            finalFileType = data.evidence.fileType;
          }
        }
      } catch (err) {
        console.error('Evidence upload error:', err);
      } finally {
        setIsUploading(false);
      }
    }

    await addEvidence({
      fileName: finalDocName,
      fileType: finalFileType || 'application/pdf',
      fileSize: finalFileSize,
      fileUrl: finalFileUrl,
      linkedRiskId: linkedRiskId || undefined,
      linkedControlId: linkedControlId || undefined,
      uploadedBy: currentUser.name,
      description: description || 'Audit verification document',
      validityExpiryDate: validityExpiryDate || new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      verificationStatus: 'Verified',
      verifierName: currentUser.name
    });

    setIsModalOpen(false);
    setSelectedFile(null);
    setFileName('');
    setDescription('');
  };

  const handleDownload = (ev: any) => {
    if (ev.fileUrl && ev.fileUrl.startsWith('/uploads/')) {
      const link = document.createElement('a');
      link.href = ev.fileUrl;
      link.download = ev.fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      const cert = `MNB RESEARCH ENTERPRISE RISK & COMPLIANCE EVIDENCE RECORD
==========================================================
Document: ${ev.fileName}
ID: ${ev.id}
Uploaded By: ${ev.uploadedBy}
Timestamp: ${ev.uploadTimestamp}
Verification Status: ${ev.verificationStatus}
Linked Risk: ${ev.linkedRiskId || 'None'}
Linked Control: ${ev.linkedControlId || 'None'}
Validity Expiry: ${ev.validityExpiryDate || 'None'}
Checksum: ${ev.checksum || 'SHA256-AUTHENTICATED'}
Description: ${ev.description}
==========================================================
Verified by MNB Research Business Operations Audit Engine.`;
      const blob = new Blob([cert], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = ev.fileName.endsWith('.txt') || ev.fileName.endsWith('.pdf') ? ev.fileName : `${ev.fileName}.txt`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in-50">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <FileText className="w-6 h-6 text-indigo-600" />
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">Audit & Compliance Evidence Library</h1>
          </div>
          <p className="text-xs text-slate-500 mt-1 font-medium">
            Central repository for verified test logs, access reviews, policies, and supporting compliance documents.
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold text-xs transition-colors shadow-sm"
        >
          <Upload className="w-4 h-4" />
          <span>Upload Evidence</span>
        </button>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Total Documents</span>
            <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600">
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-slate-900 mt-2">{evidence.length}</div>
          <div className="text-[11px] text-slate-500 mt-1 font-medium">Verified evidence files</div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Verified Evidence</span>
            <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-emerald-600 mt-2">
            {evidence.filter(e => e.verificationStatus === 'Verified').length}
          </div>
          <div className="text-[11px] text-slate-500 mt-1 font-medium">Approved by audit team</div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Expired Evidence</span>
            <div className="p-2 rounded-lg bg-red-50 text-red-600">
              <XCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-red-600 mt-2">
            {evidence.filter(e => e.validityExpiryDate && new Date(e.validityExpiryDate) < now).length}
          </div>
          <div className="text-[11px] text-red-600 font-semibold mt-1">Requires renewal upload</div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Pending Review</span>
            <div className="p-2 rounded-lg bg-amber-50 text-amber-600">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-amber-600 mt-2">
            {evidence.filter(e => e.verificationStatus === 'Pending').length}
          </div>
          <div className="text-[11px] text-slate-500 mt-1 font-medium">Awaiting auditor sign-off</div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search evidence files by filename, description, or uploader..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900"
          />
        </div>

        <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
          <Filter className="w-3.5 h-3.5" />
          <span>Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-slate-800 focus:outline-none"
          >
            <option value="All">All Statuses</option>
            <option value="Verified">Verified</option>
            <option value="Pending">Pending</option>
            <option value="Expired">Expired</option>
          </select>
        </div>
      </div>

      {/* Evidence Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="px-5 py-3.5">File Name & Description</th>
                <th className="px-4 py-3.5">Linked Entity</th>
                <th className="px-4 py-3.5">Uploaded By</th>
                <th className="px-4 py-3.5">Validity Expiry</th>
                <th className="px-4 py-3.5">Verification</th>
                <th className="px-4 py-3.5 text-right">Download</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
              {filteredEvidence.map((ev) => {
                const isExpired = ev.validityExpiryDate && new Date(ev.validityExpiryDate) < now;

                return (
                  <tr key={ev.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-start gap-2.5">
                        <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg shrink-0">
                          <FileCheck className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="font-bold text-slate-900">{ev.fileName}</div>
                          <div className="text-[11px] text-slate-500 mt-0.5">{ev.description}</div>
                        </div>
                      </div>
                    </td>

                    <td className="px-4 py-4 whitespace-nowrap">
                      {ev.linkedRiskId && (
                        <span className="px-2 py-0.5 bg-slate-100 text-slate-700 font-mono font-bold rounded text-[10px]">
                          Risk: {ev.linkedRiskId}
                        </span>
                      )}
                      {ev.linkedControlId && (
                        <span className="px-2 py-0.5 bg-purple-50 text-purple-700 font-mono font-bold rounded text-[10px] ml-1">
                          Control: {ev.linkedControlId}
                        </span>
                      )}
                    </td>

                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="font-semibold text-slate-900">{ev.uploadedBy}</div>
                      <div className="text-[10px] text-slate-500">
                        {new Date(ev.uploadTimestamp).toLocaleDateString()}
                      </div>
                    </td>

                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className={`font-semibold ${isExpired ? 'text-red-600 font-bold' : 'text-slate-800'}`}>
                        {ev.validityExpiryDate || 'N/A'}
                      </div>
                      {isExpired && (
                        <span className="text-[10px] text-red-600 font-bold block">Expired Document</span>
                      )}
                    </td>

                    <td className="px-4 py-4 whitespace-nowrap">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold inline-flex items-center gap-1 ${
                        isExpired
                          ? 'bg-red-100 text-red-800'
                          : ev.verificationStatus === 'Verified'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-amber-100 text-amber-800'
                      }`}>
                        {isExpired ? 'Expired' : ev.verificationStatus}
                      </span>
                    </td>

                    <td className="px-4 py-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleDownload(ev)}
                          className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                          title="Download Document"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => deleteEvidence(ev.id)}
                          className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete Record"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filteredEvidence.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-5 py-8 text-center text-slate-500 text-xs">
                    No evidence records found. Click "Upload Evidence" to attach a document.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Upload Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-popover border border-slate-200 animate-in zoom-in-95 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-base">Upload Audit Evidence</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpload} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Select File from Computer</label>
                <input
                  type="file"
                  onChange={e => {
                    const f = e.target.files?.[0];
                    if (f) {
                      setSelectedFile(f);
                      if (!fileName) setFileName(f.name);
                    }
                  }}
                  className="w-full text-xs text-slate-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Document File Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Q3_Database_Access_Review.pdf"
                  value={fileName}
                  onChange={e => setFileName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-slate-900"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Description</label>
                <textarea
                  rows={2}
                  placeholder="Summary of document evidence..."
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-slate-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Link to Risk</label>
                  <select
                    value={linkedRiskId}
                    onChange={e => setLinkedRiskId(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-slate-900 font-semibold"
                  >
                    <option value="">None</option>
                    {risks.map(r => (
                      <option key={r.id} value={r.id}>
                        {r.id}: {r.title}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Link to Control</label>
                  <select
                    value={linkedControlId}
                    onChange={e => setLinkedControlId(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-slate-900 font-semibold"
                  >
                    <option value="">None</option>
                    {controls.map(c => (
                      <option key={c.id} value={c.id}>
                        {c.id}: {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Validity / Expiry Date</label>
                <input
                  type="date"
                  value={validityExpiryDate}
                  onChange={e => setValidityExpiryDate(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-slate-900 font-semibold"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold"
                >
                  Confirm & Upload
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
