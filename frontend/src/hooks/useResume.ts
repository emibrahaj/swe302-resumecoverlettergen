"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { api, ApiError } from "@/src/lib/api";

export interface ResumeRow {
  id: string;
  user_id?: string | null;
  template_id?: string | null;
  target_job_title?: string | null;
  raw_content?: Record<string, unknown> | null;
  polished_content?: Record<string, unknown> | null;
  premium_analysis?: boolean | null;
  created_at?: string | null;
}

interface UseResumeState {
  resume: ResumeRow | null;
  loading: boolean;
  error: string | null;
}

export function useResume(resumeId: string | null | undefined): UseResumeState & { reload: () => void } {
  const [state, setState] = useState<UseResumeState>({ resume: null, loading: !!resumeId, error: null });

  const load = useCallback(async () => {
    if (!resumeId) {
      setState({ resume: null, loading: false, error: null });
      return;
    }
    setState((s) => ({ ...s, loading: true, error: null }));
    try {
      const r = await api.get<ResumeRow>(`/resume/my-resumes/${resumeId}`);
      setState({ resume: r, loading: false, error: null });
    } catch (e) {
      const msg = e instanceof ApiError ? e.message : "Failed to load resume";
      setState({ resume: null, loading: false, error: msg });
    }
  }, [resumeId]);

  useEffect(() => {
    load();
  }, [load]);

  return { ...state, reload: load };
}

interface SavePayload {
  resume_id?: string;
  raw_content: Record<string, unknown>;
  target_job_title?: string;
  template_id?: string;
}

export interface SaveResult {
  status: string;
  resume_id: string;
  resume: ResumeRow;
}

export function useSaveResume() {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const save = useCallback(async (payload: SavePayload): Promise<SaveResult | null> => {
    setSaving(true);
    setError(null);
    try {
      const result = await api.post<SaveResult>("/resume/save", payload);
      return result;
    } catch (e) {
      const msg = e instanceof ApiError ? e.message : "Failed to save resume";
      setError(msg);
      return null;
    } finally {
      setSaving(false);
    }
  }, []);

  return { save, saving, error };
}

export function useUserResumes() {
  const [resumes, setResumes] = useState<ResumeRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const rows = await api.get<ResumeRow[]>("/resume/my-resumes");
      setResumes(rows || []);
    } catch (e) {
      const msg = e instanceof ApiError ? e.message : "Failed to load resumes";
      setError(msg);
      setResumes([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  return { resumes, loading, error, reload };
}

export function useAutoSave<T>(
  value: T,
  onSave: (value: T) => Promise<unknown>,
  delayMs = 1500,
  enabled = true,
) {
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastRef = useRef<T>(value);
  const firstRef = useRef(true);

  useEffect(() => {
    if (!enabled) return;
    if (firstRef.current) {
      firstRef.current = false;
      lastRef.current = value;
      return;
    }
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      lastRef.current = value;
      onSave(value);
    }, delayMs);
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, [value, onSave, delayMs, enabled]);
}
