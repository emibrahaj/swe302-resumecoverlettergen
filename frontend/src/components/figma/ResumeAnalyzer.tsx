"use client";
import { TrendingUp, AlertCircle, CheckCircle, BookOpen, Star, Target, ArrowLeft, Zap } from 'lucide-react';

interface AnalyzerProps {
  onUpgrade: () => void;
  onBack?: () => void;
}

export function ResumeAnalyzer({ onUpgrade, onBack }: AnalyzerProps) {
  const score = 78;

  const weaknesses = [
    {
      area: 'Work Experience',
      issue: 'Lacks quantifiable achievements',
      suggestion: 'Add specific metrics: "Increased sales by 35%" instead of "Improved sales"',
      severity: 'high'
    },
    {
      area: 'Skills Section',
      issue: 'Missing industry-standard tools',
      suggestion: 'Add relevant technologies like Docker, Kubernetes, AWS to match job requirements',
      severity: 'high'
    },
    {
      area: 'Format & ATS',
      issue: 'Non-standard section headers',
      suggestion: 'Use "Work Experience" instead of "My Journey" for better ATS compatibility',
      severity: 'medium'
    },
    {
      area: 'Projects',
      issue: 'Limited technical depth',
      suggestion: 'Describe the technical challenges solved and technologies used in detail',
      severity: 'medium'
    },
    {
      area: 'Keywords',
      issue: 'Low keyword match rate (45%)',
      suggestion: 'Incorporate more job-specific keywords from target job descriptions',
      severity: 'high'
    }
  ];

  const skillsWithCourses = [
    {
      skill: {
        name: 'Cloud Architecture (AWS/Azure)',
        currentLevel: 40,
        targetLevel: 85,
        priority: 'Critical',
        reason: 'Required in 78% of target job postings'
      },
      course: {
        title: 'AWS Certified Solutions Architect',
        provider: 'AWS Training',
        duration: '20 hours',
        relevance: 98,
        price: 'Free'
      }
    },
    {
      skill: {
        name: 'System Design',
        currentLevel: 55,
        targetLevel: 90,
        priority: 'High',
        reason: 'Essential for senior-level positions'
      },
      course: {
        title: 'System Design Interview Masterclass',
        provider: 'Educative',
        duration: '15 hours',
        relevance: 95,
        price: '$59'
      }
    },
    {
      skill: {
        name: 'Microservices Architecture',
        currentLevel: 50,
        targetLevel: 80,
        priority: 'High',
        reason: 'Growing demand in your industry'
      },
      course: {
        title: 'Microservices with Node.js and Docker',
        provider: 'Udemy',
        duration: '12 hours',
        relevance: 92,
        price: '$19.99'
      }
    },
    {
      skill: {
        name: 'DevOps & CI/CD',
        currentLevel: 35,
        targetLevel: 75,
        priority: 'Medium',
        reason: 'Valuable complementary skill'
      },
      course: {
        title: 'Complete DevOps & CI/CD Pipeline',
        provider: 'Pluralsight',
        duration: '10 hours',
        relevance: 88,
        price: '$29/month'
      }
    },
    {
      skill: {
        name: 'TypeScript',
        currentLevel: 60,
        targetLevel: 85,
        priority: 'Medium',
        reason: 'Industry standard for modern frontend'
      },
      course: {
        title: 'TypeScript: The Complete Developer Guide',
        provider: 'Frontend Masters',
        duration: '8 hours',
        relevance: 85,
        price: '$39/month'
      }
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        {onBack && (
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-foreground/70 hover:text-foreground mb-4"
          >
            <ArrowLeft size={20} />
            Back to Dashboard
          </button>
        )}

        <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-200">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 bg-[#088395] rounded-full flex items-center justify-center">
              <TrendingUp size={32} className="text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">Resume Strength Analysis</h2>
              <p className="text-foreground/70">AI-powered insights for your resume</p>
            </div>
          </div>

        <div className="relative mb-8">
          <div className="flex items-end justify-between mb-2">
            <span className="text-foreground/70">Current Score</span>
            <span className="text-4xl font-bold text-[#088395]">{score}%</span>
          </div>
          <div className="h-4 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-[#088395] rounded-full transition-all"
              style={{ width: `${score}%` }}
            ></div>
          </div>
          <div className="flex justify-between text-xs text-foreground/50 mt-1">
            <span>Poor</span>
            <span>Good</span>
            <span>Excellent</span>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-4 mb-8">
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-3xl font-bold text-green-600 mb-1">12</div>
            <div className="text-sm text-foreground/70">Strong Points</div>
          </div>
          <div className="text-center p-4 bg-yellow-50 rounded-lg">
            <div className="text-3xl font-bold text-yellow-600 mb-1">5</div>
            <div className="text-sm text-foreground/70">Needs Improvement</div>
          </div>
          <div className="text-center p-4 bg-red-50 rounded-lg">
            <div className="text-3xl font-bold text-red-600 mb-1">2</div>
            <div className="text-sm text-foreground/70">Critical Issues</div>
          </div>
        </div>

        </div>

        <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-200">
          <div className="flex items-center gap-3 mb-6">
            <AlertCircle size={24} className="text-red-600" />
            <h3 className="text-xl font-semibold">Resume Weaknesses</h3>
          </div>
          <p className="text-foreground/70 mb-6">
            AI-identified areas that need improvement to increase your chances of landing interviews
          </p>
          <div className="space-y-4">
            {weaknesses.map((weakness, index) => (
              <div
                key={index}
                className={`p-5 rounded-lg border-l-4 ${
                  weakness.severity === 'high'
                    ? 'bg-red-50 border-red-500'
                    : weakness.severity === 'medium'
                    ? 'bg-yellow-50 border-yellow-500'
                    : 'bg-blue-50 border-blue-500'
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-semibold text-lg">{weakness.area}</h4>
                  <span className={`text-xs px-3 py-1 rounded-full font-semibold ${
                    weakness.severity === 'high'
                      ? 'bg-red-100 text-red-700'
                      : weakness.severity === 'medium'
                      ? 'bg-yellow-100 text-yellow-700'
                      : 'bg-blue-100 text-blue-700'
                  }`}>
                    {weakness.severity === 'high' ? 'Critical' : weakness.severity === 'medium' ? 'Medium' : 'Low'} Priority
                  </span>
                </div>
                <p className="text-sm text-foreground/90 mb-2">
                  <span className="font-semibold">Issue: </span>{weakness.issue}
                </p>
                <p className="text-sm text-foreground/70 flex items-start gap-2">
                  <Zap size={16} className="text-[#088395] flex-shrink-0 mt-0.5" />
                  <span><span className="font-semibold">AI Suggestion: </span>{weakness.suggestion}</span>
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-200">
          <div className="flex items-center gap-3 mb-6">
            <Target size={24} className="text-[#088395]" />
            <h3 className="text-xl font-semibold">Skills to Develop & Recommended Courses</h3>
          </div>
          <p className="text-foreground/70 mb-6">
            AI-matched skill gaps with targeted courses to help you reach your career goals
          </p>
          <div className="space-y-6">
            {skillsWithCourses.map((item, index) => (
              <div key={index} className="border-2 border-gray-200 rounded-xl overflow-hidden hover:border-[#088395] transition-colors">
                <div className="grid md:grid-cols-2 gap-0">
                  {/* Skill Section */}
                  <div className="p-6 bg-gray-50">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Target size={18} className="text-[#088395]" />
                          <h4 className="font-semibold text-lg">{item.skill.name}</h4>
                        </div>
                        <p className="text-sm text-foreground/70 mb-3">{item.skill.reason}</p>
                      </div>
                      <span className={`text-xs px-3 py-1 rounded-full font-semibold whitespace-nowrap ml-2 ${
                        item.skill.priority === 'Critical'
                          ? 'bg-red-100 text-red-700'
                          : item.skill.priority === 'High'
                          ? 'bg-orange-100 text-orange-700'
                          : 'bg-blue-100 text-blue-700'
                      }`}>
                        {item.skill.priority}
                      </span>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-foreground/70">Current Level</span>
                        <span className="font-semibold">{item.skill.currentLevel}%</span>
                      </div>
                      <div className="relative h-3 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="absolute h-full bg-gray-400 rounded-full"
                          style={{ width: `${item.skill.currentLevel}%` }}
                        ></div>
                        <div
                          className="absolute h-full bg-[#088395] rounded-full opacity-40"
                          style={{ width: `${item.skill.targetLevel}%` }}
                        ></div>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-foreground/70">Target Level</span>
                        <span className="font-semibold text-[#088395]">{item.skill.targetLevel}%</span>
                      </div>
                      <div className="text-sm font-semibold text-[#088395] bg-[#088395]/10 rounded-lg px-3 py-2 text-center">
                        Gap to close: {item.skill.targetLevel - item.skill.currentLevel}%
                      </div>
                    </div>
                  </div>

                  {/* Course Section */}
                  <div className="p-6 bg-white border-l-2 border-gray-200">
                    <div className="flex items-center gap-2 mb-3">
                      <BookOpen size={18} className="text-[#088395]" />
                      <h4 className="font-semibold">Recommended Course</h4>
                    </div>
                    <div className="mb-4">
                      <div className="flex items-start justify-between mb-2">
                        <h5 className="font-semibold text-lg text-[#088395]">{item.course.title}</h5>
                        <div className="flex items-center gap-1 ml-2">
                          <Star size={16} className="text-yellow-500 fill-yellow-500" />
                          <span className="font-semibold text-sm">{item.course.relevance}%</span>
                        </div>
                      </div>
                      <p className="text-sm text-foreground/70 mb-3">
                        {item.course.provider} • {item.course.duration}
                      </p>
                      <div className="mb-4">
                        <div className="text-xs text-foreground/70 mb-1">Course Match Score</div>
                        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-[#088395] to-teal-400 rounded-full"
                            style={{ width: `${item.course.relevance}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-sm px-3 py-1 bg-[#088395]/10 text-[#088395] rounded-full font-semibold">
                        {item.course.price}
                      </span>
                      <button className="px-4 py-2 bg-[#088395] text-white rounded-lg hover:shadow-lg transition-all text-sm font-semibold">
                        View Course
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-gradient-to-r from-[#088395] to-teal-600 rounded-xl p-8 text-white text-center">
          <Star size={48} className="mx-auto mb-4" />
          <h3 className="text-2xl font-bold mb-2">Unlock Full Analysis</h3>
          <p className="text-cyan-100 mb-6">
            Get personalized AI insights, skill gap analysis, and curated course recommendations. Upgrade to Pro to access all features.
          </p>
          <div className="flex flex-wrap justify-center gap-4 mb-6 text-sm">
            <div className="flex items-center gap-2">
              <CheckCircle size={16} />
              <span>Detailed weakness analysis</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle size={16} />
              <span>Personalized skill roadmap</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle size={16} />
              <span>Course recommendations</span>
            </div>
          </div>
          <button
            onClick={onUpgrade}
            className="px-8 py-3 bg-white text-[#088395] rounded-lg font-semibold hover:shadow-xl transition-all"
          >
            Upgrade to Pro - $9.99/month
          </button>
        </div>
      </div>
    </div>
  );
}
