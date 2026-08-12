'use client';

import React, { useState } from 'react';
import { notFound, usePathname } from 'next/navigation';
import {
  Lock, Sparkles, PlusCircle, RefreshCw, Trash2, CheckCircle2,
  BarChart3, FileText, Loader2, MapPin, Building2, Link2, Mail,
  Image as ImageIcon, AlignLeft, Clock, Users, Eye, Edit2,
  ChevronLeft, ChevronRight
} from 'lucide-react';
import { toast } from 'sonner';

type EntryMode = 'ai' | 'manual';
type ActiveTab = 'publish' | 'jobs' | 'analytics';

interface JobForm {
  title: string;
  companyName: string;
  logoUrl: string;
  locationLabel: string;
  lat: number;
  lng: number;
  experienceMin: number;
  experienceMax: number;
  jobType: string;
  description: string;
  applyLink: string;
  hrEmail: string;
}

const EMPTY_FORM: JobForm = {
  title: '',
  companyName: '',
  logoUrl: '',
  locationLabel: '',
  lat: 12.9716,
  lng: 77.5946,
  experienceMin: 0,
  experienceMax: 5,
  jobType: 'FULL_TIME',
  description: '',
  applyLink: '',
  hrEmail: '',
};

const INPUT = 'w-full rounded-xl border border-slate-700 bg-slate-950 p-2.5 text-xs text-white placeholder-slate-500 focus:border-brand-500 focus:outline-none transition-colors';
const LABEL = 'block text-xs font-bold text-slate-300 mb-1';

export default function AdminConsolePage() {
  const pathname = usePathname();
  const configuredAdminPath = process.env.NEXT_PUBLIC_ADMIN_PATH || '/ops-7f3a9c2e';

  if (pathname !== configuredAdminPath && pathname !== configuredAdminPath + '/') {
    notFound();
  }

  const [authenticated, setAuthenticated] = useState(false);
  const [passcode, setPasscode] = useState('');
  const [authLoading, setAuthLoading] = useState(false);

  // Tab state
  const [activeTab, setActiveTab] = useState<ActiveTab>('publish');
  const [entryMode, setEntryMode] = useState<EntryMode>('ai');

  // Data state
  const [jobs, setJobs] = useState<any[]>([]);
  const [metrics, setMetrics] = useState({ totalJobs: 0, activeCount: 0, expiredCount: 0, applicationsCount: 0, usersCount: 0, visitorsCount: 0 });
  const [loadingJobs, setLoadingJobs] = useState(false);

  // Pagination state
  const [adminPage, setAdminPage] = useState(1);
  const adminPageSize = 8;
  const adminTotalPages = Math.max(1, Math.ceil((jobs?.length || 0) / adminPageSize));
  const paginatedAdminJobs = (jobs || []).slice((adminPage - 1) * adminPageSize, adminPage * adminPageSize);

  // AI paste state
  const [rawText, setRawText] = useState('');
  const [extracting, setExtracting] = useState(false);

  // Shared review/manual form
  const [form, setForm] = useState<JobForm | null>(null);
  const [editingJobId, setEditingJobId] = useState<string | null>(null);
  const [publishing, setPublishing] = useState(false);
  const [ingesting, setIngesting] = useState(false);

  const handleRunAutoIngest = async () => {
    setIngesting(true);
    toast.info('Fetching jobs from Arbeitnow/Remotive/Adzuna & executing 25-day cleanup...');
    try {
      const res = await fetch('/api/cron/ingest', { method: 'POST' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Auto-ingest failed');
      toast.success(`Ingestion Complete! Added: ${data.ingestedCount}, Skipped: ${data.skippedCount}, Deleted (>25d): ${data.cleanedCount}`);
      fetchAdminJobs();
    } catch (err: any) {
      toast.error(err.message || 'Auto-ingest failed');
    } finally {
      setIngesting(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);
    try {
      const res = await fetch('/api/admin/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ passcode }),
      });
      if (!res.ok) throw new Error('Incorrect admin passcode');
      setAuthenticated(true);
      toast.success('Welcome back, Admin!');
      fetchAdminJobs();
    } catch (err: any) {
      toast.error(err.message || 'Authentication failed');
    } finally {
      setAuthLoading(false);
    }
  };

  const fetchAdminJobs = async () => {
    setLoadingJobs(true);
    try {
      const res = await fetch('/api/admin/jobs');
      if (res.ok) {
        const data = await res.json();
        setJobs(data.jobs || []);
        if (data.metrics) setMetrics(data.metrics);
      }
    } catch { toast.error('Failed to load jobs'); }
    finally { setLoadingJobs(false); }
  };

  // AI extraction
  const handleExtractText = async () => {
    if (!rawText.trim()) { toast.error('Paste job text first!'); return; }
    setExtracting(true);
    toast.info('AI is reading your job text…');
    try {
      const res = await fetch('/api/jobs/extract', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rawText }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error?.message || 'Extraction failed');
      const ext = data.extracted;
      setEditingJobId(null);
      setForm({
        title: ext.title || '',
        companyName: ext.companyName || '',
        logoUrl: ext.logoUrl || '',
        locationLabel: ext.locationLabel || '',
        lat: ext.lat || 12.9716,
        lng: ext.lng || 77.5946,
        experienceMin: ext.experienceMin || 0,
        experienceMax: ext.experienceMax || 5,
        jobType: ext.jobType || 'FULL_TIME',
        description: ext.description || rawText,
        applyLink: ext.applyLink || '',
        hrEmail: ext.hrEmail || '',
      });
      toast.success('Fields extracted! Review and publish.');
    } catch (err: any) {
      toast.error(err.message || 'AI extraction failed');
    } finally { setExtracting(false); }
  };

  const handleEditClick = (job: any) => {
    setEditingJobId(job.id);
    setForm({
      title: job.title || '',
      companyName: job.company?.name || '',
      logoUrl: job.company?.logoUrl || '',
      locationLabel: job.locationLabel || '',
      lat: job.lat || 12.9716,
      lng: job.lng || 77.5946,
      experienceMin: job.experienceMin || 0,
      experienceMax: job.experienceMax || 5,
      jobType: job.jobType || 'FULL_TIME',
      description: job.description || '',
      applyLink: job.applyLink || '',
      hrEmail: job.hrEmail || '',
    });
    setEntryMode('manual');
    setActiveTab('publish');
    toast.info(`Editing job: ${job.title}`);
  };

  const handlePublish = async () => {
    if (!form) return;
    if (!form.title || !form.companyName || !form.locationLabel) {
      toast.error('Title, company name, and location are required.');
      return;
    }
    setPublishing(true);
    try {
      const endpoint = '/api/admin/jobs';
      const method = editingJobId ? 'PUT' : 'POST';
      const payload = editingJobId
        ? { id: editingJobId, action: 'update', ...form }
        : form;

      const res = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error('Action failed');
      toast.success(editingJobId ? 'Job updated successfully!' : 'Job published to live map! 🎉');
      setForm(null);
      setEditingJobId(null);
      setRawText('');
      fetchAdminJobs();
      setActiveTab('jobs');
    } catch (err: any) {
      toast.error(err.message || 'Save failed');
    } finally { setPublishing(false); }
  };

  const handleRenewJob = async (id: string) => {
    try {
      await fetch('/api/admin/jobs', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, action: 'renew' }) });
      toast.success('Renewed 30 days!');
      fetchAdminJobs();
    } catch { toast.error('Renew failed'); }
  };

  const handleDeleteJob = async (id: string) => {
    if (!confirm('Delete this job permanently?')) return;
    try {
      await fetch(`/api/admin/jobs?id=${id}`, { method: 'DELETE' });
      toast.success('Job deleted.');
      fetchAdminJobs();
    } catch { toast.error('Delete failed'); }
  };

  // ── Auth Screen ──
  if (!authenticated) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
        <div className="w-full max-w-md rounded-3xl border border-slate-800 bg-slate-900 p-8 shadow-2xl space-y-6 text-slate-100">
          <div className="text-center space-y-2">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-900 border border-brand-700 text-coral-400">
              <Lock className="h-7 w-7" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight">Pinhire Admin Console</h1>
            <p className="text-xs text-slate-400 font-mono">{configuredAdminPath}</p>
          </div>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className={LABEL}>Admin Passcode</label>
              <input
                type="password" required value={passcode}
                onChange={e => setPasscode(e.target.value)}
                placeholder="Enter admin passcode"
                className={INPUT}
              />
              <p className="text-[11px] text-slate-500 mt-1">Default: admin123</p>
            </div>
            <button type="submit" disabled={authLoading}
              className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-brand-600 hover:bg-brand-700 font-bold text-sm text-white shadow-pin transition-all">
              {authLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Lock className="h-4 w-4" />}
              Unlock Console
            </button>
          </form>
        </div>
      </div>
    );
  }

  // ── Admin Dashboard ──
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-8">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
          <div>
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <h1 className="text-2xl font-extrabold tracking-tight text-white">Admin Console</h1>
              <span className="px-2 py-0.5 rounded bg-slate-800 text-[11px] font-mono text-emerald-400 border border-slate-700">
                {configuredAdminPath}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">Publish jobs, edit existing roles, and monitor real candidate metrics.</p>
          </div>

          {/* Tabs */}
          <div className="flex rounded-xl bg-slate-900 p-1 border border-slate-800 gap-1">
            {([
              { id: 'publish', label: editingJobId ? 'Edit Job' : 'Publish Job', icon: <PlusCircle className="h-4 w-4" /> },
              { id: 'jobs', label: `Jobs (${metrics.totalJobs})`, icon: <FileText className="h-4 w-4" /> },
              { id: 'analytics', label: 'Metrics', icon: <BarChart3 className="h-4 w-4" /> },
            ] as const).map(tab => (
              <button
                key={tab.id}
                onClick={() => { setActiveTab(tab.id); if (tab.id === 'jobs') fetchAdminJobs(); }}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold transition-colors ${
                  activeTab === tab.id ? 'bg-brand-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                {tab.icon} {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Dynamic Real Metrics Summary Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
          {[
            { label: 'Active Jobs', value: metrics.activeCount, color: 'text-emerald-400' },
            { label: 'Expired', value: metrics.expiredCount, color: 'text-amber-400' },
            { label: 'Applications', value: metrics.applicationsCount, color: 'text-brand-400' },
            { label: 'Registered Users', value: metrics.usersCount || 0, color: 'text-indigo-400' },
            { label: 'Visitor Views', value: metrics.visitorsCount || 0, color: 'text-white' },
          ].map(m => (
            <div key={m.label} className="rounded-2xl border border-slate-800 bg-slate-900 p-5 space-y-1">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide">{m.label}</span>
              <div className={`text-2xl font-bold ${m.color}`}>{m.value}</div>
            </div>
          ))}
        </div>

        {/* ── TAB: Publish / Edit Job ── */}
        {activeTab === 'publish' && (
          <div className="space-y-6">

            {/* Mode switcher */}
            {!editingJobId && (
              <div className="flex items-center gap-2 p-1 rounded-xl bg-slate-900 border border-slate-800 w-fit">
                <button
                  onClick={() => { setEntryMode('ai'); setForm(null); }}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-colors ${
                    entryMode === 'ai' ? 'bg-brand-600 text-white shadow' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Sparkles className="h-4 w-4 text-coral-400" /> AI Paste-to-Publish
                </button>
                <button
                  onClick={() => { setEntryMode('manual'); setForm({ ...EMPTY_FORM }); setEditingJobId(null); }}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-colors ${
                    entryMode === 'manual' ? 'bg-slate-700 text-white shadow' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <PlusCircle className="h-4 w-4" /> Manual Entry
                </button>
              </div>
            )}

            {/* AI Mode */}
            {entryMode === 'ai' && !form && !editingJobId && (
              <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6 sm:p-8 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-950 text-coral-400 border border-brand-800">
                    <Sparkles className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-white">AI Paste-to-Publish</h2>
                    <p className="text-xs text-slate-400">Paste raw job text from any source. AI extracts all fields into the form.</p>
                  </div>
                </div>
                <textarea
                  rows={7}
                  value={rawText}
                  onChange={e => setRawText(e.target.value)}
                  placeholder={`Paste unformatted job text here…\n\nExample:\n"Stripe is hiring a Senior Full-Stack Engineer in Koramangala, Bangalore. 4–8 years experience. Apply at stripe.com/careers or email careers-in@stripe.com"`}
                  className="w-full rounded-2xl border border-slate-700 bg-slate-950 p-4 text-xs font-mono text-slate-200 placeholder-slate-600 focus:border-brand-500 outline-none resize-none"
                />
                <button
                  onClick={handleExtractText}
                  disabled={extracting}
                  className="flex items-center gap-2 px-6 py-3 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs shadow-pin transition-all hover:scale-105"
                >
                  {extracting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4 text-coral-400" />}
                  {extracting ? 'Extracting with AI…' : 'Run AI Extractor'}
                </button>
              </div>
            )}

            {/* Shared Form (AI Review, Manual Entry, or Job Editing) */}
            {form && (
              <div className="rounded-3xl border border-brand-500/40 bg-slate-900 p-6 sm:p-8 space-y-6 shadow-2xl">
                <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    {editingJobId
                      ? <><Edit2 className="h-5 w-5 text-indigo-400" /> Edit Job Details</>
                      : entryMode === 'ai'
                      ? <><CheckCircle2 className="h-5 w-5 text-emerald-400" /> Review Extracted Fields</>
                      : <><PlusCircle className="h-5 w-5 text-brand-400" /> New Job — Manual Entry</>
                    }
                  </h3>
                  <span className="text-[11px] text-slate-500">All fields fully editable</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                  {/* Job Title */}
                  <div>
                    <label className={LABEL}><FileText className="inline h-3 w-3 mr-1" />Job Title *</label>
                    <input type="text" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })}
                      placeholder="Senior Full-Stack Engineer" className={INPUT} />
                  </div>

                  {/* Company Name */}
                  <div>
                    <label className={LABEL}><Building2 className="inline h-3 w-3 mr-1" />Company Name *</label>
                    <input type="text" value={form.companyName} onChange={e => setForm({ ...form, companyName: e.target.value })}
                      placeholder="Stripe Inc." className={INPUT} />
                  </div>

                  {/* Company Logo URL */}
                  <div className="md:col-span-2">
                    <label className={LABEL}><ImageIcon className="inline h-3 w-3 mr-1" />Company Logo URL</label>
                    <input type="url" value={form.logoUrl} onChange={e => setForm({ ...form, logoUrl: e.target.value })}
                      placeholder="https://company.com/logo.png" className={INPUT} />
                    {form.logoUrl && (
                      <div className="flex items-center gap-2 mt-2">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={form.logoUrl} alt="Logo preview" className="h-10 w-10 rounded-lg border border-slate-700 object-cover" onError={e => (e.currentTarget.style.display = 'none')} />
                        <span className="text-[11px] text-slate-500">Logo preview</span>
                      </div>
                    )}
                  </div>

                  {/* Location */}
                  <div>
                    <label className={LABEL}><MapPin className="inline h-3 w-3 mr-1 text-coral-500" />Hiring Location *</label>
                    <input type="text" value={form.locationLabel} onChange={e => setForm({ ...form, locationLabel: e.target.value })}
                      placeholder="Koramangala, Bangalore, India" className={INPUT} />
                  </div>

                  {/* Lat/Lng */}
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className={LABEL}>Latitude</label>
                      <input type="number" step="0.0001" value={form.lat} onChange={e => setForm({ ...form, lat: Number(e.target.value) })} className={INPUT} />
                    </div>
                    <div>
                      <label className={LABEL}>Longitude</label>
                      <input type="number" step="0.0001" value={form.lng} onChange={e => setForm({ ...form, lng: Number(e.target.value) })} className={INPUT} />
                    </div>
                  </div>

                  {/* Exp range */}
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className={LABEL}>Min Exp (yrs)</label>
                      <input type="number" value={form.experienceMin} onChange={e => setForm({ ...form, experienceMin: Number(e.target.value) })} className={INPUT} />
                    </div>
                    <div>
                      <label className={LABEL}>Max Exp (yrs)</label>
                      <input type="number" value={form.experienceMax} onChange={e => setForm({ ...form, experienceMax: Number(e.target.value) })} className={INPUT} />
                    </div>
                  </div>

                  {/* Job Type */}
                  <div>
                    <label className={LABEL}>Job Type</label>
                    <select value={form.jobType} onChange={e => setForm({ ...form, jobType: e.target.value })}
                      className={INPUT}>
                      <option value="FULL_TIME">Full-Time</option>
                      <option value="PART_TIME">Part-Time</option>
                      <option value="CONTRACT">Contract</option>
                      <option value="INTERNSHIP">Internship</option>
                      <option value="REMOTE">Remote</option>
                    </select>
                  </div>

                  {/* Apply Link */}
                  <div>
                    <label className={LABEL}><Link2 className="inline h-3 w-3 mr-1" />Apply Link URL</label>
                    <input type="url" value={form.applyLink} onChange={e => setForm({ ...form, applyLink: e.target.value })}
                      placeholder="https://company.com/careers/apply" className={INPUT} />
                  </div>

                  {/* HR Email */}
                  <div>
                    <label className={LABEL}><Mail className="inline h-3 w-3 mr-1 text-coral-500" />HR Contact Email</label>
                    <input type="email" value={form.hrEmail} onChange={e => setForm({ ...form, hrEmail: e.target.value })}
                      placeholder="hr@company.com" className={INPUT} />
                  </div>

                  {/* Description */}
                  <div className="md:col-span-2">
                    <label className={LABEL}><AlignLeft className="inline h-3 w-3 mr-1" />Job Description</label>
                    <textarea rows={5} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })}
                      placeholder="Describe the role, responsibilities, and requirements…"
                      className={`${INPUT} resize-none`} />
                  </div>

                </div>

                {/* Actions */}
                <div className="flex justify-between items-center gap-3 pt-2 border-t border-slate-800">
                  <button onClick={() => { setForm(null); setEditingJobId(null); setRawText(''); }}
                    className="px-4 py-2.5 rounded-xl border border-slate-700 text-xs font-semibold text-slate-300 hover:bg-slate-800 transition-colors">
                    Cancel
                  </button>
                  <button onClick={handlePublish} disabled={publishing}
                    className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-lg transition-transform hover:scale-105">
                    {publishing ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                    {editingJobId ? 'Save Changes' : 'Publish to Live Map'}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── TAB: Manage Jobs ── */}
        {activeTab === 'jobs' && (
          <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-white">All Job Listings ({jobs.length})</h2>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleRunAutoIngest}
                  disabled={ingesting}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold transition-all shadow"
                >
                  {ingesting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5 text-coral-400" />}
                  {ingesting ? 'Syncing...' : 'Auto-Ingest & Clean (>25d)'}
                </button>
                <button onClick={fetchAdminJobs} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-700 text-xs font-semibold text-slate-300 hover:bg-slate-800">
                  <RefreshCw className="h-3.5 w-3.5" /> Refresh
                </button>
              </div>
            </div>

            {loadingJobs ? (
              <div className="py-8 text-center text-xs text-slate-500 flex items-center justify-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" /> Loading jobs…
              </div>
            ) : jobs.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-500">No jobs published yet. Use the Publish tab to add your first job.</div>
            ) : (
              <div className="space-y-3">
                <div className="space-y-2">
                  {paginatedAdminJobs.map(job => (
                    <div key={job.id}
                      className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-slate-950 border border-slate-800 hover:border-slate-700 transition-colors">
                      <div className="flex items-center gap-3">
                        {job.company?.logoUrl && (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={job.company.logoUrl} alt={job.company.name} className="h-8 w-8 rounded-md border border-slate-700 object-cover flex-shrink-0" />
                        )}
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-sm text-white">{job.title}</span>
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              job.status === 'ACTIVE'
                                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                            }`}>{job.status}</span>
                            <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-800 text-slate-400 border border-slate-700">
                              {job.source || 'manual'}
                            </span>
                          </div>
                          <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-1">
                            <Building2 className="h-3 w-3" /> {job.company?.name} &nbsp;|&nbsp;
                            <MapPin className="h-3 w-3 text-coral-500" /> {job.locationLabel}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <button onClick={() => handleEditClick(job)}
                          className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-indigo-950 text-indigo-300 border border-indigo-800 text-xs font-semibold hover:bg-indigo-900 transition-colors">
                          <Edit2 className="h-3.5 w-3.5" /> Edit Job
                        </button>
                        <button onClick={() => handleRenewJob(job.id)}
                          className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-800 text-xs font-semibold text-slate-200 hover:bg-brand-600 transition-colors">
                          <Clock className="h-3.5 w-3.5" /> Renew 30d
                        </button>
                        <button onClick={() => handleDeleteJob(job.id)}
                          className="p-1.5 rounded-lg bg-slate-800 text-rose-400 hover:bg-rose-950 transition-colors">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Admin Pagination */}
                {adminTotalPages > 1 && (
                  <div className="flex items-center justify-between pt-3 border-t border-slate-800 text-xs">
                    <span className="text-slate-400 font-medium">
                      Page <strong className="text-white">{adminPage}</strong> of <strong className="text-white">{adminTotalPages}</strong> ({jobs.length} total jobs)
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setAdminPage(p => Math.max(1, p - 1))}
                        disabled={adminPage === 1}
                        className="p-1.5 rounded-lg border border-slate-800 bg-slate-950 text-slate-300 disabled:opacity-40 hover:bg-slate-800 transition-colors"
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => setAdminPage(p => Math.min(adminTotalPages, p + 1))}
                        disabled={adminPage === adminTotalPages}
                        className="p-1.5 rounded-lg border border-slate-800 bg-slate-950 text-slate-300 disabled:opacity-40 hover:bg-slate-800 transition-colors"
                      >
                        <ChevronRight className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* ── TAB: Analytics Metrics ── */}
        {activeTab === 'analytics' && (
          <div className="rounded-3xl border border-slate-800 bg-slate-900 p-8 space-y-6">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-brand-400" /> Real Candidate & Platform Metrics
            </h2>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
              {[
                { label: 'Active Map Jobs', value: metrics.activeCount, icon: <CheckCircle2 className="h-4 w-4 text-emerald-400" /> },
                { label: 'Expired Jobs', value: metrics.expiredCount, icon: <Clock className="h-4 w-4 text-amber-400" /> },
                { label: 'Applications Logged', value: metrics.applicationsCount, icon: <FileText className="h-4 w-4 text-brand-400" /> },
                { label: 'Candidate Signups', value: metrics.usersCount || 0, icon: <Users className="h-4 w-4 text-indigo-400" /> },
                { label: 'Visitor Views', value: metrics.visitorsCount || 0, icon: <Eye className="h-4 w-4 text-white" /> },
              ].map(m => (
                <div key={m.label} className="rounded-xl bg-slate-950 border border-slate-800 p-4 flex items-center gap-3">
                  {m.icon}
                  <div>
                    <div className="text-lg font-bold text-white">{m.value}</div>
                    <div className="text-[10px] text-slate-400">{m.label}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
