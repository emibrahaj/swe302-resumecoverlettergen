import React, {useState} from 'react';
import {ArrowLeft, Briefcase, MapPin, DollarSign, Clock, Star, Building2, TrendingUp, FileUser} from 'lucide-react';

interface Job {
    id: string;
    title: string;
    company: string;
    location: string;
    salary: string;
    postedDate: string;
    type: 'full-time' | 'part-time' | 'contract';
    matchScore: number;
    matchingSkills: string[];
    description: string;
    requirements: string[];
}

interface MatchedJobBoardProps {
    onBack: () => void;
    onApply?: (jobId: string) => void;
    onViewApplications?: () => void;

}

export function MatchedJobBoard({onBack, onApply, onViewApplications}: MatchedJobBoardProps) {
    const [jobs] = useState<Job[]>([
        {
            id: '1',
            title: 'Senior Frontend Developer',
            company: 'Tech Innovations Inc.',
            location: 'Remote',
            salary: '$120k - $160k',
            postedDate: '2 days ago',
            type: 'full-time',
            matchScore: 95,
            matchingSkills: ['React', 'TypeScript', 'Node.js', 'AWS'],
            description: 'We are looking for a Senior Frontend Developer to join our dynamic team and build cutting-edge web applications.',
            requirements: ['5+ years of React experience', 'Strong TypeScript skills', 'Experience with AWS', 'Team player']
        },
        {
            id: '2',
            title: 'Full Stack Engineer',
            company: 'StartupXYZ',
            location: 'San Francisco, CA',
            salary: '$130k - $170k',
            postedDate: '1 day ago',
            type: 'full-time',
            matchScore: 92,
            matchingSkills: ['React', 'Node.js', 'MongoDB', 'Docker'],
            description: 'Join our fast-growing startup and help build the next generation of SaaS products.',
            requirements: ['4+ years full stack experience', 'Proficiency in React and Node.js', 'Startup experience preferred']
        },
        {
            id: '3',
            title: 'Frontend Developer',
            company: 'Digital Solutions Co.',
            location: 'New York, NY',
            salary: '$110k - $140k',
            postedDate: '3 days ago',
            type: 'full-time',
            matchScore: 88,
            matchingSkills: ['React', 'JavaScript', 'CSS', 'REST APIs'],
            description: 'Build responsive and performant web applications for our enterprise clients.',
            requirements: ['3+ years frontend development', 'Strong JavaScript fundamentals', 'Experience with modern CSS']
        },
        {
            id: '4',
            title: 'React Developer',
            company: 'Creative Labs',
            location: 'Austin, TX',
            salary: '$100k - $130k',
            postedDate: '5 days ago',
            type: 'full-time',
            matchScore: 85,
            matchingSkills: ['React', 'Redux', 'TypeScript'],
            description: 'Work on exciting projects for Fortune 500 companies using the latest React ecosystem.',
            requirements: ['3+ years React experience', 'Redux or similar state management', 'Excellent communication skills']
        },
        {
            id: '5',
            title: 'Software Engineer - Frontend',
            company: 'Enterprise Corp',
            location: 'Remote',
            salary: '$115k - $145k',
            postedDate: '1 week ago',
            type: 'contract',
            matchScore: 82,
            matchingSkills: ['React', 'JavaScript', 'GraphQL'],
            description: 'Contract position for 6 months with potential for full-time conversion.',
            requirements: ['Strong React skills', 'GraphQL experience', 'Available for 6-month contract']
        }
    ]);

    const [selectedJob, setSelectedJob] = useState<Job | null>(null);

    const getMatchColor = (score: number) => {
        if (score >= 90) return 'text-green-600 bg-green-100';
        if (score >= 85) return 'text-[#088395] bg-[#088395]/10';
        return 'text-yellow-600 bg-yellow-100';
    };


    return (
        <div className="min-h-screen bg-gray-50">
            <div className="bg-[#088395] text-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <button
                        onClick={onBack}
                        className="flex items-center gap-2 text-white/80 hover:text-white mb-6"
                    >
                        <ArrowLeft size={20}/>
                        Back to Dashboard
                    </button>

                    {/* ← flex row: title left, button right */}
                    <div className="flex items-start justify-between gap-6">

                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <TrendingUp size={32}/>
                                <h1 className="text-3xl font-bold">Matched Jobs for You</h1>
                            </div>
                            <p className="text-cyan-100">These jobs are selected based on your resume, skills, and experience. Higher match scores indicate
              better compatibility.</p>
                        </div>




                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="grid md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                                <Star size={24} className="text-green-600"/>
                            </div>
                            <div>
                                <p className="text-foreground/70 text-sm">High Match (90%+)</p>
                                <p className="text-2xl font-bold">{jobs.filter(j => j.matchScore >= 90).length}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-[#088395]/10 rounded-lg flex items-center justify-center">
                                <TrendingUp size={24} className="text-[#088395]"/>
                            </div>
                            <div>
                                <p className="text-foreground/70 text-sm">Good Match (85-89%)</p>
                                <p className="text-2xl font-bold">{jobs.filter(j => j.matchScore >= 85 && j.matchScore < 90).length}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                                <Briefcase size={24} className="text-yellow-600"/>
                            </div>
                            <div>
                                <p className="text-foreground/70 text-sm">Total Matches</p>
                                <p className="text-2xl font-bold">{jobs.length}</p>
                            </div>
                        </div>
                    </div>
                </div>


                <div
                    className="relative bg-gradient-to-br mb-8 from-slate-900 to-slate-800 rounded-xl p-6 text-white flex flex-col justify-between overflow-hidden">
                    <div
                        className="absolute top-0 right-0 w-32 h-32 bg-[#088395]/20 rounded-full -translate-y-8 translate-x-8 pointer-events-none"/>
                    <div
                        className="absolute bottom-0 left-0 w-20 h-20 bg-[#088395]/10 rounded-full translate-y-6 -translate-x-6 pointer-events-none"/>
                    <div className="relative">

                        <div
                            className="flex items-center gap-2 mb-1">
                            <FileUser size={22}
                                      className="text-[#088395]"/>
                            <h3 className="text-xl font-bold">Your
                                Applications</h3>
                        </div>
                        <p className="text-white/60 text-xs mb-4">See all the jobs you have applied to.</p>

                    </div>
                    <button
                        onClick={onViewApplications}
                        className="flex items-center justify-center gap-2 px-6 py-3 bg-[#088395] text-white rounded-lg font-semibold hover:shadow-xl transition-all mt-4"
                    >
                        <Briefcase size={16}/>
                        View My Applications
                    </button>
                </div>


                <div>
                    <h2 className="text-2xl font-bold mb-6">Recommended Jobs ({jobs.length})</h2>

                    <div className="space-y-4">
                        {jobs.map((job) => (
                            <div
                                key={job.id}
                                className="bg-white rounded-xl shadow-sm border-2 border-gray-200 p-6 hover:border-[#088395] hover:shadow-lg transition-all"
                            >
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <h3 className="text-xl font-semibold">{job.title}</h3>
                                            <div
                                                className={`flex items-center gap-1 px-3 py-1 rounded-full ${getMatchColor(job.matchScore)}`}>
                                                <Star size={14} className="fill-current"/>
                                                <span className="text-sm font-semibold">{job.matchScore}% Match</span>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2 mb-3">
                                            <div className="flex items-center gap-2 text-foreground/70">
                                                <Building2 size={16}/>
                                                <span className="font-medium">{job.company}</span>
                                            </div>
                                        </div>

                                        <div className="flex flex-wrap gap-4 text-sm text-foreground/70 mb-3">
                                            <div className="flex items-center gap-1">
                                                <MapPin size={14}/>
                                                {job.location}
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <DollarSign size={14}/>
                                                {job.salary}
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <Briefcase size={14}/>
                                                {job.type.charAt(0).toUpperCase() + job.type.slice(1)}
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <Clock size={14}/>
                                                Posted {job.postedDate}
                                            </div>
                                        </div>

                                        <p className="text-foreground/80 text-sm mb-4">{job.description}</p>

                                        <div className="mb-4">
                                            <h4 className="text-sm font-semibold text-foreground/70 mb-2">
                                                Your Matching Skills:
                                            </h4>
                                            <div className="flex flex-wrap gap-2">
                                                {job.matchingSkills.map((skill, index) => (
                                                    <span
                                                        key={index}
                                                        className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium"
                                                    >
                            {skill}
                          </span>
                                                ))}
                                            </div>
                                        </div>

                                        {selectedJob?.id === job.id && (
                                            <div className="mb-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                                                <h4 className="text-sm font-semibold mb-2">Requirements:</h4>
                                                <ul className="list-disc list-inside text-sm text-foreground/80 space-y-1">
                                                    {job.requirements.map((req, index) => (
                                                        <li key={index}>{req}</li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="flex gap-3">
                                    <button
                                        onClick={() => {
                                            onApply?.(job.id);
                                            alert(`Applied to ${job.title} at ${job.company}!`);
                                        }}
                                        className="flex items-center gap-2 px-6 py-3 bg-[#088395] text-white rounded-lg font-semibold hover:shadow-lg transition-all"
                                    >
                                        <Briefcase size={16}/>
                                        Apply Now
                                    </button>
                                    <button
                                        onClick={() => setSelectedJob(selectedJob?.id === job.id ? null : job)}
                                        className="px-6 py-3 border-2 border-gray-200 rounded-lg hover:border-[#088395] hover:text-[#088395] transition-colors"
                                    >
                                        {selectedJob?.id === job.id ? 'Hide Details' : 'View Details'}
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
