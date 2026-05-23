"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { JobBoard, Job } from "@/src/components/figma/JobBoard";
import { AuthAwareNav } from "@/src/components/figma/AuthAwareNav";
import { api } from "@/src/lib/api";
import { useSubscription } from "@/src/context/SubscriptionContext";

interface ApiJob {
  id: string;
  job_title: string;
  company_name: string | null;
  job_location: string | null;
  employment_type: string | null;
  salary: string | null;
  description: string | null;
  required_skills: string[];
  created_at: string;
}

function formatPostedDate(createdAt: string): string {
  const days = Math.floor((Date.now() - new Date(createdAt).getTime()) / 86_400_000);

  if (days === 0) return "today";
  if (days === 1) return "1 day ago";
  if (days < 7) return `${days} days ago`;

  const weeks = Math.floor(days / 7);
  return weeks === 1 ? "1 week ago" : `${weeks} weeks ago`;
}

function mapApiJob(j: ApiJob): Job {
  return {
    id: j.id,
    title: j.job_title,
    company: j.company_name ?? "Unknown Company",
    location: j.job_location ?? "Remote",
    type: (j.employment_type as Job["type"]) ?? "full-time",
    salary: j.salary ?? "Not specified",
    postedDate: formatPostedDate(j.created_at),
    description: j.description ?? "",
    requirements: j.required_skills ?? [],
  };
}

export default function JobBoardPage() {
  const router = useRouter();

  // Live subscription state, so Pro gates update immediately after checkout.
  const { isPro } = useSubscription();

  const [jobs, setJobs] = useState<Job[]>([]);
  const [forYouJobs, setForYouJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get<ApiJob[]>("/jobs/browse"),
      api.get<ApiJob[]>("/jobs/for-me").catch(() => []),
    ])
      .then(([allJobs, forMeJobs]) => {
        setJobs(allJobs.map(mapApiJob));
        setForYouJobs(forMeJobs.map(mapApiJob));
      })
      .catch(() => {
        setJobs([]);
        setForYouJobs([]);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      <AuthAwareNav
        currentPage="job-board"
        publicCurrentPage="job-board"
        onBack={() => router.back()}
      />

      <main className="pt-16">
        <JobBoard
          isPro={isPro}
          jobs={jobs}
          forYouJobs={forYouJobs}
          loading={loading}
          onUpgrade={() => router.push("/pricing?from=job-board")}
        />
      </main>
    </>
  );
}