import { useState } from 'react';
import { Sparkles, Download, Save, Eye, Palette, Type, Plus, Trash2, Upload, User } from 'lucide-react';

interface CVBuilderProps {
  templateId: string;
  onBack: () => void;
}

interface WorkExperience {
  id: string;
  title: string;
  company: string;
  location: string;
  startDate: string;
  endDate: string;
  description: string;
}

interface Education {
  id: string;
  degree: string;
  school: string;
  year: string;
}

interface Project {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  description: string;
}

interface CustomSection {
  id: string;
  title: string;
  items: string[];
}

export function CVBuilder({ templateId }: CVBuilderProps) {
  const [activeTab, setActiveTab] = useState<'content' | 'design'>('content');
  const [cvPhoto, setCvPhoto] = useState<string | null>(null);
  const [personalInfo, setPersonalInfo] = useState({
    fullName: '',
    email: '',
    phone: '',
    location: '',
    title: '',
    summary: ''
  });

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setCvPhoto(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const [workExperience, setWorkExperience] = useState<WorkExperience[]>([
    {
      id: '1',
      title: 'Software Engineer',
      company: 'Tech Company',
      location: 'San Francisco, CA',
      startDate: '2023',
      endDate: 'Present',
      description: 'Developed and maintained web applications using React and Node.js'
    }
  ]);

  const [education, setEducation] = useState<Education[]>([
    {
      id: '1',
      degree: 'Bachelor of Computer Science',
      school: 'University Name',
      year: '2023'
    }
  ]);

  const [skills, setSkills] = useState<string[]>(['JavaScript', 'React', 'TypeScript', 'Node.js']);
  const [projects, setProjects] = useState<Project[]>([]);
  const [customSections, setCustomSections] = useState<CustomSection[]>([]);
  const [aiEnhancing, setAiEnhancing] = useState(false);
  const [newSkill, setNewSkill] = useState('');

  const handleAiEnhance = () => {
    setAiEnhancing(true);
    setTimeout(() => {
      setAiEnhancing(false);
    }, 2000);
  };

  const addProject = () => {
    setProjects([
      ...projects,
      {
        id: Date.now().toString(),
        name: '',
        startDate: '',
        endDate: '',
        description: ''
      }
    ]);
  };

  const removeProject = (id: string) => {
    setProjects(projects.filter(p => p.id !== id));
  };

  const addCustomSection = (title: string) => {
    if (!customSections.find(s => s.title === title)) {
      setCustomSections([
        ...customSections,
        {
          id: new Date().getTime().toString(),
          title,
          items: ['']
        }
      ]);
    }
  };

  const removeCustomSection = (id: string) => {
    setCustomSections(customSections.filter(s => s.id !== id));
  };

  const addSkill = () => {
    if (newSkill.trim()) {
      setSkills([...skills, newSkill.trim()]);
      setNewSkill('');
    }
  };

  const removeSkill = (index: number) => {
    setSkills(skills.filter((_, i) => i !== index));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <button
                onClick={handleAiEnhance}
                className={`flex items-center gap-2 px-4 py-2 bg-[#088395] text-white rounded-lg hover:shadow-lg transition-all ${
                  aiEnhancing ? 'opacity-75' : ''
                }`}
                disabled={aiEnhancing}
              >
                <Sparkles size={16} className={aiEnhancing ? 'animate-spin' : ''} />
                {aiEnhancing ? 'Enhancing...' : 'AI Enhance'}
              </button>
              <button className="flex items-center gap-2 px-4 py-2 border-2 border-gray-200 rounded-lg hover:bg-gray-50">
                <Save size={16} />
                Save
              </button>
              <button className="flex items-center gap-2 px-4 py-2 bg-[#088395] text-white rounded-lg hover:shadow-lg">
                <Download size={16} />
                Download PDF
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="flex border-b border-gray-200">
                <button
                  onClick={() => setActiveTab('content')}
                  className={`flex-1 px-6 py-4 font-semibold ${
                    activeTab === 'content'
                      ? 'text-[#088395] border-b-2 border-[#088395]'
                      : 'text-foreground/70'
                  }`}
                >
                  Content
                </button>
                <button
                  onClick={() => setActiveTab('design')}
                  className={`flex-1 px-6 py-4 font-semibold ${
                    activeTab === 'design'
                      ? 'text-[#088395] border-b-2 border-[#088395]'
                      : 'text-foreground/70'
                  }`}
                >
                  Design
                </button>
              </div>

              <div className="p-6">
                {activeTab === 'content' ? (
                  <div className="space-y-8">
                    <div>
                      <h3 className="font-semibold mb-4">Personal Information</h3>
                      <div className="space-y-4">
                        <div className="flex justify-center mb-4">
                          <div className="relative">
                            <div className="w-24 h-24 rounded-lg bg-gray-200 flex items-center justify-center overflow-hidden border-2 border-gray-300">
                              {cvPhoto ? (
                                <img src={cvPhoto} alt="CV Photo" className="w-full h-full object-cover" />
                              ) : (
                                <User size={32} className="text-gray-400" />
                              )}
                            </div>
                            <label className="absolute -bottom-2 -right-2 w-8 h-8 bg-[#088395] rounded-full flex items-center justify-center cursor-pointer hover:bg-teal-700 transition-colors">
                              <Upload size={16} className="text-white" />
                              <input
                                type="file"
                                accept="image/*"
                                onChange={handlePhotoUpload}
                                className="hidden"
                              />
                            </label>
                          </div>
                        </div>
                        <input
                          type="text"
                          placeholder="Full Name"
                          value={personalInfo.fullName}
                          onChange={(e) => setPersonalInfo({ ...personalInfo, fullName: e.target.value })}
                          className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-[#088395] focus:outline-none"
                        />
                        <input
                          type="email"
                          placeholder="Email"
                          value={personalInfo.email}
                          onChange={(e) => setPersonalInfo({ ...personalInfo, email: e.target.value })}
                          className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-[#088395] focus:outline-none"
                        />
                        <input
                          type="tel"
                          placeholder="Phone"
                          value={personalInfo.phone}
                          onChange={(e) => setPersonalInfo({ ...personalInfo, phone: e.target.value })}
                          className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-[#088395] focus:outline-none"
                        />
                        <input
                          type="text"
                          placeholder="Location"
                          value={personalInfo.location}
                          onChange={(e) => setPersonalInfo({ ...personalInfo, location: e.target.value })}
                          className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-[#088395] focus:outline-none"
                        />
                        <input
                          type="text"
                          placeholder="Professional Title"
                          value={personalInfo.title}
                          onChange={(e) => setPersonalInfo({ ...personalInfo, title: e.target.value })}
                          className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-[#088395] focus:outline-none"
                        />
                        <textarea
                          placeholder="Professional Summary"
                          value={personalInfo.summary}
                          onChange={(e) => setPersonalInfo({ ...personalInfo, summary: e.target.value })}
                          rows={4}
                          className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-[#088395] focus:outline-none resize-none"
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="font-semibold">Work Experience</h3>
                        <button className="flex items-center gap-1 text-[#088395] hover:text-purple-700">
                          <Plus size={16} />
                          Add
                        </button>
                      </div>
                      {workExperience.map((exp) => (
                        <div key={exp.id} className="space-y-4 p-4 bg-gray-50 rounded-lg mb-4">
                          <div className="flex justify-between items-start">
                            <input
                              type="text"
                              placeholder="Job Title"
                              value={exp.title}
                              className="flex-1 px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-[#088395] focus:outline-none"
                            />
                            <button className="ml-2 p-2 text-red-600 hover:bg-red-50 rounded-lg">
                              <Trash2 size={16} />
                            </button>
                          </div>
                          <input
                            type="text"
                            placeholder="Company"
                            value={exp.company}
                            className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-[#088395] focus:outline-none"
                          />
                          <div className="grid grid-cols-2 gap-4">
                            <input
                              type="text"
                              placeholder="Start Date"
                              value={exp.startDate}
                              className="px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-[#088395] focus:outline-none"
                            />
                            <input
                              type="text"
                              placeholder="End Date"
                              value={exp.endDate}
                              className="px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-[#088395] focus:outline-none"
                            />
                          </div>
                          <textarea
                            placeholder="Description"
                            value={exp.description}
                            rows={3}
                            className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-[#088395] focus:outline-none resize-none"
                          />
                        </div>
                      ))}
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="font-semibold">Education</h3>
                        <button className="flex items-center gap-1 text-[#088395] hover:text-purple-700">
                          <Plus size={16} />
                          Add
                        </button>
                      </div>
                      {education.map((edu) => (
                        <div key={edu.id} className="space-y-4 p-4 bg-gray-50 rounded-lg mb-4">
                          <div className="flex justify-between items-start">
                            <input
                              type="text"
                              placeholder="Degree"
                              value={edu.degree}
                              className="flex-1 px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-[#088395] focus:outline-none"
                            />
                            <button className="ml-2 p-2 text-red-600 hover:bg-red-50 rounded-lg">
                              <Trash2 size={16} />
                            </button>
                          </div>
                          <input
                            type="text"
                            placeholder="School"
                            value={edu.school}
                            className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-[#088395] focus:outline-none"
                          />
                          <input
                            type="text"
                            placeholder="Year"
                            value={edu.year}
                            className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-[#088395] focus:outline-none"
                          />
                        </div>
                      ))}
                    </div>

                    <div>
                      <h3 className="font-semibold mb-4">Skills</h3>
                      <div className="flex flex-wrap gap-2 mb-4">
                        {skills.map((skill, index) => (
                          <div
                            key={index}
                            className="px-3 py-1 bg-[#088395]/10 text-purple-700 rounded-full flex items-center gap-2"
                          >
                            {skill}
                            <button
                              onClick={() => removeSkill(index)}
                              className="hover:text-purple-900"
                            >
                              <Trash2 size={12} />
                            </button>
                          </div>
                        ))}
                      </div>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          placeholder="Add a skill"
                          value={newSkill}
                          onChange={(e) => setNewSkill(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && addSkill()}
                          className="flex-1 px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-[#088395] focus:outline-none"
                        />
                        <button
                          onClick={addSkill}
                          className="px-4 py-2 bg-[#088395] text-white rounded-lg hover:bg-purple-700"
                        >
                          Add
                        </button>
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="font-semibold">Projects</h3>
                        <button
                          onClick={addProject}
                          className="flex items-center gap-1 text-[#088395] hover:text-purple-700"
                        >
                          <Plus size={16} />
                          Add
                        </button>
                      </div>
                      {projects.length === 0 ? (
                        <p className="text-foreground/50 text-sm">No projects added yet</p>
                      ) : (
                        projects.map((project) => (
                          <div key={project.id} className="space-y-4 p-4 bg-gray-50 rounded-lg mb-4">
                            <div className="flex justify-between items-start">
                              <input
                                type="text"
                                placeholder="Project Name"
                                value={project.name}
                                onChange={(e) => setProjects(projects.map(p =>
                                  p.id === project.id ? { ...p, name: e.target.value } : p
                                ))}
                                className="flex-1 px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-[#088395] focus:outline-none"
                              />
                              <button
                                onClick={() => removeProject(project.id)}
                                className="ml-2 p-2 text-red-600 hover:bg-red-50 rounded-lg"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                              <input
                                type="text"
                                placeholder="Start Date"
                                value={project.startDate}
                                onChange={(e) => setProjects(projects.map(p =>
                                  p.id === project.id ? { ...p, startDate: e.target.value } : p
                                ))}
                                className="px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-[#088395] focus:outline-none"
                              />
                              <input
                                type="text"
                                placeholder="End Date"
                                value={project.endDate}
                                onChange={(e) => setProjects(projects.map(p =>
                                  p.id === project.id ? { ...p, endDate: e.target.value } : p
                                ))}
                                className="px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-[#088395] focus:outline-none"
                              />
                            </div>
                            <textarea
                              placeholder="Project Description"
                              value={project.description}
                              onChange={(e) => setProjects(projects.map(p =>
                                p.id === project.id ? { ...p, description: e.target.value } : p
                              ))}
                              rows={3}
                              className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-[#088395] focus:outline-none resize-none"
                            />
                          </div>
                        ))
                      )}
                    </div>

                    <div>
                      <h3 className="font-semibold mb-4">Add Category</h3>
                      <div className="flex flex-wrap gap-2 mb-4">
                        {['Languages', 'Hobbies', 'Certificates', 'Conferences', 'Courses'].map((category) => (
                          <button
                            key={category}
                            onClick={() => addCustomSection(category)}
                            disabled={customSections.some(s => s.title === category)}
                            className={`px-4 py-2 rounded-lg border-2 transition-colors ${
                              customSections.some(s => s.title === category)
                                ? 'border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed'
                                : 'border-purple-200 text-[#088395] hover:bg-[#088395]/5'
                            }`}
                          >
                            {category}
                          </button>
                        ))}
                        <button
                          onClick={() => {
                            const title = prompt('Enter custom section name:');
                            if (title) addCustomSection(title);
                          }}
                          className="px-4 py-2 rounded-lg border-2 border-purple-200 text-[#088395] hover:bg-[#088395]/5"
                        >
                          + Other
                        </button>
                      </div>

                      {customSections.map((section) => (
                        <div key={section.id} className="p-4 bg-gray-50 rounded-lg mb-4">
                          <div className="flex items-center justify-between mb-4">
                            <h4 className="font-semibold">{section.title}</h4>
                            <button
                              onClick={() => removeCustomSection(section.id)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                          {section.items.map((item, index) => (
                            <div key={index} className="flex gap-2 mb-2">
                              <input
                                type="text"
                                placeholder={`Add ${section.title.toLowerCase()} item`}
                                value={item}
                                onChange={(e) => {
                                  const newSections = customSections.map(s => {
                                    if (s.id === section.id) {
                                      const newItems = [...s.items];
                                      newItems[index] = e.target.value;
                                      return { ...s, items: newItems };
                                    }
                                    return s;
                                  });
                                  setCustomSections(newSections);
                                }}
                                className="flex-1 px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-[#088395] focus:outline-none"
                              />
                              <button
                                onClick={() => {
                                  const newSections = customSections.map(s => {
                                    if (s.id === section.id) {
                                      return { ...s, items: s.items.filter((_, i) => i !== index) };
                                    }
                                    return s;
                                  });
                                  setCustomSections(newSections);
                                }}
                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          ))}
                          <button
                            onClick={() => {
                              const newSections = customSections.map(s => {
                                if (s.id === section.id) {
                                  return { ...s, items: [...s.items, ''] };
                                }
                                return s;
                              });
                              setCustomSections(newSections);
                            }}
                            className="text-sm text-[#088395] hover:text-purple-700 flex items-center gap-1"
                          >
                            <Plus size={14} />
                            Add {section.title.toLowerCase()} item
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div>
                      <h3 className="font-semibold mb-4 flex items-center gap-2">
                        <Palette size={20} />
                        Color Theme
                      </h3>
                      <div className="grid grid-cols-6 gap-4">
                        {['#6366f1', '#ec4899', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444'].map((color) => (
                          <button
                            key={color}
                            className="w-12 h-12 rounded-lg border-2 border-gray-200 hover:scale-110 transition-transform"
                            style={{ backgroundColor: color }}
                          />
                        ))}
                      </div>
                    </div>

                    <div>
                      <h3 className="font-semibold mb-4 flex items-center gap-2">
                        <Type size={20} />
                        Font Family
                      </h3>
                      <select className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-[#088395] focus:outline-none">
                        <option>Inter</option>
                        <option>Roboto</option>
                        <option>Open Sans</option>
                        <option>Lato</option>
                        <option>Montserrat</option>
                      </select>
                    </div>

                    <div>
                      <h3 className="font-semibold mb-4">Layout</h3>
                      <div className="grid grid-cols-2 gap-4">
                        <button className="p-4 border-2 border-[#088395] rounded-lg bg-purple-50">
                          <div className="aspect-[8.5/11] bg-white rounded shadow-sm"></div>
                          <p className="text-sm mt-2">Single Column</p>
                        </button>
                        <button className="p-4 border-2 border-gray-200 rounded-lg hover:border-[#088395]">
                          <div className="aspect-[8.5/11] bg-white rounded shadow-sm"></div>
                          <p className="text-sm mt-2">Two Column</p>
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="lg:sticky lg:top-24 h-fit">
            <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold flex items-center gap-2">
                  <Eye size={20} />
                  Live Preview
                </h3>
                <button className="text-sm text-[#088395] hover:text-purple-700">
                  Full Screen
                </button>
              </div>

              <div className="aspect-[8.5/11] bg-white shadow-2xl rounded-lg p-8 overflow-auto border border-gray-200">
                <div className="space-y-6">
                  <div className="flex gap-4">
                    {cvPhoto && (
                      <div className="flex-shrink-0">
                        <img src={cvPhoto} alt="Profile" className="w-24 h-24 rounded-lg object-cover border-2 border-[#088395]" />
                      </div>
                    )}
                    <div className="flex-1">
                      <h1 className="text-3xl font-bold text-[#088395] mb-1">
                        {personalInfo.fullName || 'Your Name'}
                      </h1>
                      <p className="text-lg text-gray-600 mb-2">
                        {personalInfo.title || 'Professional Title'}
                      </p>
                      <div className="text-sm text-gray-600 space-y-1">
                        {personalInfo.email && <p>{personalInfo.email}</p>}
                        {personalInfo.phone && <p>{personalInfo.phone}</p>}
                        {personalInfo.location && <p>{personalInfo.location}</p>}
                      </div>
                    </div>
                  </div>

                  {personalInfo.summary && (
                    <div>
                      <h2 className="text-lg font-semibold text-[#088395] mb-2 border-b-2 border-[#088395] pb-1">
                        Professional Summary
                      </h2>
                      <p className="text-sm text-gray-700">{personalInfo.summary}</p>
                    </div>
                  )}

                  {workExperience.length > 0 && (
                    <div>
                      <h2 className="text-lg font-semibold text-[#088395] mb-2 border-b-2 border-[#088395] pb-1">
                        Work Experience
                      </h2>
                      {workExperience.map((exp) => (
                        <div key={exp.id} className="mb-4">
                          <h3 className="font-semibold text-sm">{exp.title}</h3>
                          <p className="text-sm text-gray-600">
                            {exp.company} • {exp.startDate} - {exp.endDate}
                          </p>
                          <p className="text-sm text-gray-700 mt-1">{exp.description}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  {education.length > 0 && (
                    <div>
                      <h2 className="text-lg font-semibold text-[#088395] mb-2 border-b-2 border-[#088395] pb-1">
                        Education
                      </h2>
                      {education.map((edu) => (
                        <div key={edu.id} className="mb-2">
                          <h3 className="font-semibold text-sm">{edu.degree}</h3>
                          <p className="text-sm text-gray-600">
                            {edu.school} • {edu.year}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}

                  {skills.length > 0 && (
                    <div>
                      <h2 className="text-lg font-semibold text-[#088395] mb-2 border-b-2 border-[#088395] pb-1">
                        Skills
                      </h2>
                      <div className="flex flex-wrap gap-2">
                        {skills.map((skill, index) => (
                          <span key={index} className="px-2 py-1 bg-[#088395]/10 text-purple-700 text-xs rounded">
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {projects.length > 0 && (
                    <div>
                      <h2 className="text-lg font-semibold text-[#088395] mb-2 border-b-2 border-[#088395] pb-1">
                        Projects
                      </h2>
                      {projects.map((project) => (
                        <div key={project.id} className="mb-4">
                          <h3 className="font-semibold text-sm">{project.name || 'Untitled Project'}</h3>
                          <p className="text-sm text-gray-600">
                            {project.startDate} - {project.endDate || 'Present'}
                          </p>
                          {project.description && (
                            <p className="text-sm text-gray-700 mt-1">{project.description}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {customSections.map((section) => {
                    const hasContent = section.items.some(item => item.trim());
                    if (!hasContent) return null;

                    return (
                      <div key={section.id}>
                        <h2 className="text-lg font-semibold text-[#088395] mb-2 border-b-2 border-[#088395] pb-1">
                          {section.title}
                        </h2>
                        <ul className="space-y-1">
                          {section.items.filter(item => item.trim()).map((item, index) => (
                            <li key={index} className="text-sm text-gray-700">
                              • {item}
                            </li>
                          ))}
                        </ul>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
