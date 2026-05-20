"use client";

import { useCallback, useEffect, useState } from "react";
import { api, ApiError } from "@/src/lib/api";

export interface DimensionDetail {
  score: number;
  reason: string;
}

export interface CourseRecommendation {
  id?: string | null;
  title?: string | null;
  provider?: string | null;
  skill_category?: string | null;
  duration?: string | null;
  price?: string | null;
  url?: string | null;
  relevance?: number | null;
}

export interface SkillMatrix {
  resume_id: string;
  overall: number;
  experience: number;
  education: number;
  technical_skills: number;
  soft_skills: number;
  achievements: number;
  keywords: number;
  formatting: number;
  job_relevance: number;
  dimensions: Record<string, DimensionDetail>;
  feedback_id?: string | null;
  created_at?: string | null;
  missing_skills?: string[];
  matching_skills?: string[];
  recommended_courses?: CourseRecommendation[];
  target_job_title?: string | null;
}

export const SKILL_MATRIX_DIMENSIONS: Array<{ key: keyof SkillMatrix; label: string }> = [
  { key: "experience", label: "Experience" },
  { key: "education", label: "Education" },
  { key: "technical_skills", label: "Technical Skills" },
  { key: "soft_skills", label: "Soft Skills" },
  { key: "achievements", label: "Achievements" },
  { key: "keywords", label: "Keywords" },
  { key: "formatting", label: "Formatting" },
  { key: "job_relevance", label: "Job Relevance" },
];

interface State {
  matrix: SkillMatrix | null;
  loading: boolean;
  error: string | null;
}

export function useSkillMatrix(resumeId: string | null | undefined) {
  const [state, setState] = useState<State>({ matrix: null, loading: false, error: null });

  const loadLatest = useCallback(async () => {
    if (!resumeId) {
      setState({ matrix: null, loading: false, error: null });
      return;
    }
    setState((s) => ({ ...s, loading: true, error: null }));
    try {
      const m = await api.get<SkillMatrix>(`/resume/${resumeId}/skill-matrix/latest`);
      setState({ matrix: m, loading: false, error: null });
    } catch (e) {
      const msg = e instanceof ApiError ? e.message : "Failed to load skill matrix";
      const status = e instanceof ApiError ? e.status : 0;
      // 404 = no scores yet (not an actual error)
      setState({ matrix: null, loading: false, error: status === 404 ? null : msg });
    }
  }, [resumeId]);

  const compute = useCallback(async (): Promise<SkillMatrix | null> => {
    if (!resumeId) return null;
    setState((s) => ({ ...s, loading: true, error: null }));
    try {
      const m = await api.post<SkillMatrix>(`/resume/${resumeId}/skill-matrix`);
      setState({ matrix: m, loading: false, error: null });
      return m;
    } catch (e) {
      // Surface the actual cause — ApiError carries the server's "detail",
      // a TypeError likely means the backend is unreachable, anything else
      // shows its own message so we never blanket-mask the real reason.
      let msg: string;
      if (e instanceof ApiError) {
        msg = e.message;
      } else if (e instanceof TypeError) {
        msg = "Could not reach the analysis service. Is the backend running?";
      } else if (e instanceof Error) {
        msg = e.message;
      } else {
        msg = "Failed to compute skill matrix";
      }
      setState((s) => ({ ...s, loading: false, error: msg }));
      return null;
    }
  }, [resumeId]);

  useEffect(() => {
    loadLatest();
  }, [loadLatest]);

  return { ...state, compute, reload: loadLatest };
}
