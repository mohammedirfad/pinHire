'use client';

import React, { useState } from 'react';
import { UploadCloud, FileText, CheckCircle, Sparkles, Loader2 } from 'lucide-react';
import { ParsedResume } from '@/lib/resumeParser';
import { toast } from 'sonner';

interface ResumeUploaderProps {
  onParsed: (parsed: ParsedResume, matchedJobs?: any[]) => void;
}

export function ResumeUploader({ onParsed }: ResumeUploaderProps) {
  const [loading, setLoading] = useState(false);
  const [pastedText, setPastedText] = useState('');
  const [mode, setMode] = useState<'upload' | 'paste'>('upload');

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    toast.info('Reading resume file...');

    try {
      const text = await file.text();
      const res = await fetch('/api/resume/parse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resumeText: text }),
      });

      if (!res.ok) throw new Error('Failed to parse resume');

      const data = await res.json();
      toast.success('Resume parsed successfully!');
      onParsed(data.parsedResume, data.matchedJobs);
    } catch (err) {
      console.error(err);
      toast.error('Could not extract file. Try pasting resume text directly below!');
    } finally {
      setLoading(false);
    }
  };

  const handleTextSubmit = async () => {
    if (!pastedText.trim()) {
      toast.error('Please paste resume text first!');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/resume/parse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resumeText: pastedText }),
      });

      const data = await res.json();
      toast.success('Resume parsed & matched with map jobs!');
      onParsed(data.parsedResume, data.matchedJobs);
    } catch (err) {
      toast.error('Failed to parse resume text');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xl dark:border-slate-800 dark:bg-slate-900">
      
      {/* Mode Switcher */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4 dark:border-slate-800">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-coral-500" />
            Resume-First Job Discovery
          </h2>
          <p className="text-xs text-slate-500">
            Upload your resume once — Pinhire reads it and pins matching roles near your location.
          </p>
        </div>
        <div className="flex rounded-lg bg-slate-100 p-1 dark:bg-slate-800">
          <button
            onClick={() => setMode('upload')}
            className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${
              mode === 'upload' ? 'bg-white text-slate-900 shadow-sm dark:bg-slate-900 dark:text-white' : 'text-slate-500'
            }`}
          >
            File Upload
          </button>
          <button
            onClick={() => setMode('paste')}
            className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${
              mode === 'paste' ? 'bg-white text-slate-900 shadow-sm dark:bg-slate-900 dark:text-white' : 'text-slate-500'
            }`}
          >
            Paste Text
          </button>
        </div>
      </div>

      {/* Upload Drop Zone */}
      {mode === 'upload' ? (
        <label className="relative flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-300 p-8 text-center hover:border-brand-500 dark:border-slate-700 dark:hover:border-brand-400 cursor-pointer bg-slate-50/50 dark:bg-slate-950/50 transition-colors">
          <input
            type="file"
            accept=".pdf,.docx,.txt"
            onChange={handleFileUpload}
            disabled={loading}
            className="sr-only"
          />
          {loading ? (
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="h-8 w-8 text-brand-600 animate-spin" />
              <p className="text-sm font-semibold text-slate-700">AI Parsing Resume Skills...</p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-50 text-brand-600 dark:bg-brand-950 dark:text-brand-400">
                <UploadCloud className="h-6 w-6" />
              </div>
              <p className="text-sm font-bold text-slate-800 dark:text-slate-200">
                Click to upload resume (PDF, DOCX, TXT)
              </p>
              <p className="text-xs text-slate-500">Maximum file size 5MB</p>
            </div>
          )}
        </label>
      ) : (
        <div className="space-y-3">
          <textarea
            rows={5}
            value={pastedText}
            onChange={(e) => setPastedText(e.target.value)}
            placeholder="Paste your resume work summary, skills, or experience here..."
            className="w-full rounded-xl border border-slate-300 p-3 text-xs text-slate-900 focus:border-brand-500 outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
          />
          <button
            onClick={handleTextSubmit}
            disabled={loading}
            className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs shadow-md transition-colors"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4 text-coral-400" />}
            Extract Skills & Match Map Jobs
          </button>
        </div>
      )}
    </div>
  );
}
