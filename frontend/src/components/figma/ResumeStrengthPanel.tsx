"use client";

import { useMemo } from "react";
import { Crown, Loader2, RefreshCw, Sparkles, TrendingUp } from "lucide-react";
import { toast } from "sonner";
import { RadarChart } from "./RadarChart";
import { SKILL_MATRIX_DIMENSIONS, useSkillMatrix } from "@/src/hooks/useSkillMatrix";
import { useSubscription } from "@/src/context/SubscriptionContext";

interface ResumeStrengthPanelProps {
  resumeId: string | null | undefined;
}

const TARGET = 90;

function scoreColorClass(score: number): string {
  if (score >= 75) return "text-green-600 bg-green-50 border-green-200";
  if (score >= 40) return "text-yellow-600 bg-yellow-50 border-yellow-200";
  return "text-red-600 bg-red-50 border-red-200";
}

function scoreLabel(score: number): string {
  if (score >= 85) return "Excellent";
  if (score >= 70) return "Strong";
  if (score >= 50) return "Solid";
  if (score >= 30) return "Needs work";
  return "Weak";
}

export function ResumeStrengthPanel({ resumeId }: ResumeStrengthPanelProps) {
  const { isPro, loading: subLoading } = useSubscription();
  const { matrix, loading, error, compute } = useSkillMatrix(resumeId || null);

  const radarData = useMemo(() => {
    if (!matrix) return [];
    return SKILL_MATRIX_DIMENSIONS.map(({ key, label }) => ({
      category: label,
      current: Number(matrix[key]) || 0,
      target: TARGET,
    }));
  }, [matrix]);

  // Hidden completely while we don't know the user's tier yet — avoids a flash.
  if (subLoading) return null;
  // Free users see a small upgrade nudge instead of the panel.
  if (!isPro) {
    return (
      <div className="mt-8 p-6 rounded-2xl bg-gradient-to-br from-yellow-50 to-orange-50 border border-yellow-200 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-yellow-400 to-orange-400 flex items-center justify-center flex-shrink-0">
            <Crown size={18} className="text-white" />
          </div>
          <div>
            <p className="font-semibold">Resume Strength is a Pro feature</p>
            <p className="text-sm text-foreground/70">
              See an 8-dimension score of your resume — experience, skills, keywords, achievements, formatting, and more.
            </p>
          </div>
        </div>
        <a
          href="/pricing"
          className="inline-flex items-center gap-2 px-5 py-2 bg-[#088395] text-white rounded-lg font-semibold hover:shadow-lg transition-all flex-shrink-0"
        >
          <Crown size={14} className="text-yellow-300" />
          Upgrade — from €3.99/week
        </a>
      </div>
    );
  }

  // Pro user but no resume_id yet (haven't saved yet)
  if (!resumeId) {
    return (
      <div className="mt-8 p-6 rounded-2xl bg-white border border-gray-200">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-full bg-[#088395]/10 flex items-center justify-center flex-shrink-0">
            <TrendingUp size={18} className="text-[#088395]" />
          </div>
          <div>
            <p className="font-semibold mb-1 flex items-center gap-2">
              Resume Strength
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-gradient-to-r from-yellow-400 to-orange-400 text-white rounded text-[10px] font-bold">
                <Crown size={8} />
                PRO
              </span>
            </p>
            <p className="text-sm text-foreground/70">
              Save your resume first, then we&apos;ll score it across 8 dimensions and show you exactly where to improve.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const handleCompute = async () => {
    const r = await compute();
    if (r) toast.success(`Resume strength: ${r.overall}%`);
  };

  // Pro + has resumeId but hasn't computed yet
  if (!matrix && !loading) {
    return (
      <div className="mt-8 p-6 rounded-2xl bg-white border border-gray-200">
        <div className="flex items-start gap-4 flex-wrap">
          <div className="w-10 h-10 rounded-full bg-[#088395]/10 flex items-center justify-center flex-shrink-0">
            <TrendingUp size={18} className="text-[#088395]" />
          </div>
          <div className="flex-1 min-w-[200px]">
            <p className="font-semibold mb-1 flex items-center gap-2">
              Resume Strength
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-gradient-to-r from-yellow-400 to-orange-400 text-white rounded text-[10px] font-bold">
                <Crown size={8} />
                PRO
              </span>
            </p>
            <p className="text-sm text-foreground/70">
              Click below to score this resume across 8 dimensions (experience, skills, keywords, achievements, formatting, soft skills, education, job relevance).
            </p>
            {error && <p className="text-sm text-red-600 mt-2">{error}</p>}
          </div>
          <button
            type="button"
            onClick={handleCompute}
            className="flex items-center gap-2 px-5 py-2.5 bg-[#088395] text-white rounded-lg font-semibold hover:shadow-lg transition-all"
          >
            <Sparkles size={16} />
            Analyze Resume Strength
          </button>
        </div>
      </div>
    );
  }

  if (loading && !matrix) {
    return (
      <div className="mt-8 p-8 rounded-2xl bg-white border border-gray-200 flex items-center justify-center gap-3 text-foreground/70">
        <Loader2 size={20} className="animate-spin text-[#088395]" />
        Scoring your resume…
      </div>
    );
  }

  if (!matrix) return null;

  return (
    <div className="mt-8 p-6 rounded-2xl bg-white border border-gray-200">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-[#088395] flex items-center justify-center">
            <TrendingUp size={22} className="text-white" />
          </div>
          <div>
            <h3 className="text-xl font-bold flex items-center gap-2">
              Resume Strength
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-gradient-to-r from-yellow-400 to-orange-400 text-white rounded text-[10px] font-bold">
                <Crown size={8} />
                PRO
              </span>
            </h3>
            <p className="text-sm text-foreground/70">AI-scored across 8 dimensions</p>
          </div>
        </div>
        <button
          type="button"
          onClick={handleCompute}
          disabled={loading}
          className={`flex items-center gap-2 px-4 py-2 border-2 border-gray-200 rounded-lg hover:bg-gray-50 transition-colors ${
            loading ? "opacity-60 cursor-wait" : ""
          }`}
        >
          <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
          {loading ? "Re-analyzing…" : "Re-analyze"}
        </button>
      </div>

      {/* Overall + radar */}
      <div className="grid md:grid-cols-2 gap-8 items-center mb-8">
        <div>
          <p className="text-sm text-foreground/60 mb-1">Overall score</p>
          <div className="flex items-baseline gap-2 mb-2">
            <span className="text-6xl font-bold text-[#088395]">{matrix.overall}</span>
            <span className="text-2xl text-foreground/50">/100</span>
            <span className={`ml-3 px-2 py-1 rounded-md text-sm font-semibold ${scoreColorClass(matrix.overall)}`}>
              {scoreLabel(matrix.overall)}
            </span>
          </div>
          <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[#088395] to-teal-500 rounded-full transition-all"
              style={{ width: `${Math.min(100, Math.max(0, matrix.overall))}%` }}
            />
          </div>
          <p className="mt-3 text-sm text-foreground/70">
            Strong points:{" "}
            <strong>{SKILL_MATRIX_DIMENSIONS.filter((d) => Number(matrix[d.key]) >= 75).length}</strong>{" "}
            · Needs improvement:{" "}
            <strong>{SKILL_MATRIX_DIMENSIONS.filter((d) => Number(matrix[d.key]) >= 40 && Number(matrix[d.key]) < 75).length}</strong>{" "}
            · Critical:{" "}
            <strong>{SKILL_MATRIX_DIMENSIONS.filter((d) => Number(matrix[d.key]) < 40).length}</strong>
          </p>
        </div>
        <div className="flex justify-center">
          {radarData.length > 0 && <RadarChart data={radarData} />}
        </div>
      </div>

      {/* Per-dimension cards */}
      <div className="grid sm:grid-cols-2 gap-3">
        {SKILL_MATRIX_DIMENSIONS.map(({ key, label }) => {
          const dim = matrix.dimensions?.[key] || { score: Number(matrix[key]) || 0, reason: "" };
          const score = Number(dim.score) || 0;
          return (
            <div
              key={String(key)}
              className={`p-3 rounded-lg border ${scoreColorClass(score)}`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-semibold text-sm">{label}</span>
                <span className="text-lg font-bold">{score}</span>
              </div>
              {dim.reason && (
                <p className="text-xs text-foreground/70 leading-relaxed">{dim.reason}</p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
