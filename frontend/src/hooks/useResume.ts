"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { api, ApiError } from "@/src/lib/api";

export interface ResumeRow {
  id: string;
  user_id?: string | null;
  template_id?: string | null;
  name?: string | null;
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

export function useDeleteResume() {
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const deleteResume = useCallback(async (resumeId: string): Promise<boolean> => {
    setDeleting(true);
    setError(null);
    try {
      await api.delete(`/resume/my-resumes/${resumeId}`);
      return true;
    } catch (e) {
      const msg = e instanceof ApiError ? e.message : "Failed to delete resume";
      setError(msg);
      return false;
    } finally {
      setDeleting(false);
    }
  }, []);

  return { deleteResume, deleting, error };
}

export function useRenameResume() {
  const [renaming, setRenaming] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const renameResume = useCallback(async (resumeId: string, title: string): Promise<boolean> => {
    setRenaming(true);
    setError(null);
    try {
      await api.patch(`/resume/my-resumes/${resumeId}`, { target_job_title: title });
      return true;
    } catch (e) {
      const msg = e instanceof ApiError ? e.message : "Failed to rename resume";
      setError(msg);
      return false;
    } finally {
      setRenaming(false);
    }
  }, []);

  return { renameResume, renaming, error };
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

export interface CoverLetterRow {
  id: string;
  user_id?: string | null;
  resume_id?: string | null;
  title?: string | null;
  content?: string | null;
  type?: string | null;
  job_position?: string | null;
  created_at?: string | null;
}

export function useCoverLetters() {
  const [coverLetters, setCoverLetters] = useState<CoverLetterRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const rows = await api.get<CoverLetterRow[]>("/cover-letters/");
      setCoverLetters(rows || []);
    } catch (e) {
      const msg = e instanceof ApiError ? e.message : "Failed to load cover letters";
      setError(msg);
      setCoverLetters([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  return { coverLetters, loading, error, reload };
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