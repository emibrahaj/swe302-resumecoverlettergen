-- 003_skill_matrix.sql
-- Add 7 new score dimensions to resume_feedback for the Skill Matrix feature.
-- Existing columns (overall_score, content_score, formatting_score, ats_compatibility_score) stay.

alter table public.resume_feedback
  add column if not exists experience_score integer check (experience_score is null or (experience_score >= 0 and experience_score <= 100)),
  add column if not exists education_score integer check (education_score is null or (education_score >= 0 and education_score <= 100)),
  add column if not exists technical_skills_score integer check (technical_skills_score is null or (technical_skills_score >= 0 and technical_skills_score <= 100)),
  add column if not exists soft_skills_score integer check (soft_skills_score is null or (soft_skills_score >= 0 and soft_skills_score <= 100)),
  add column if not exists achievements_score integer check (achievements_score is null or (achievements_score >= 0 and achievements_score <= 100)),
  add column if not exists keywords_score integer check (keywords_score is null or (keywords_score >= 0 and keywords_score <= 100)),
  add column if not exists job_relevance_score integer check (job_relevance_score is null or (job_relevance_score >= 0 and job_relevance_score <= 100)),
  add column if not exists dimensions jsonb;

create index if not exists idx_resume_feedback_resume_id
  on public.resume_feedback (resume_id);
