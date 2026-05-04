"use client";
import {ArrowLeft, Star} from 'lucide-react';

interface TemplatesShowcaseProps {
    onSelectTemplate: (templateId: string) => void;
}

//TODO show ALL templates in a more organized way

export function TemplatesShowcase({onSelectTemplate}: TemplatesShowcaseProps) {
    const templates = [{
        id: 1, name: 'Modern Minimal', category: 'Simple', popular: true, color: 'from-purple-500 to-purple-600'
    }, {
        id: 2, name: 'Professional Classic', category: 'Simple', popular: false, color: 'from-gray-600 to-gray-700'
    }, {
        id: 3, name: 'Creative Bold', category: 'Advanced', popular: true, color: 'from-pink-500 to-pink-600'
    }, {
        id: 4, name: 'Executive Elite', category: 'Premium', popular: false, color: 'from-indigo-600 to-purple-700'
    }, {
        id: 5, name: 'Tech Innovator', category: 'Advanced', popular: false, color: 'from-blue-500 to-blue-600'
    }, {
        id: 6, name: 'Designer Portfolio', category: 'Premium', popular: true, color: 'bg-[#088395]'
    }];

    return (<section id="templates" className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-white to-purple-50">
            <div className="max-w-7xl mx-auto">
                <div className="text-center mb-16">
                    <h2 className="text-4xl md:text-5xl font-bold mb-4">
                        Choose from 900+ Templates
                    </h2>
                    <p className="text-xl text-foreground/70 max-w-2xl mx-auto">
                        Professionally designed templates for every industry and career level
                    </p>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
                    {templates.map((template) => (//ff
                        <div
                            key={template.id}
                            onClick={() => onSelectTemplate(String(template.id))}
                            className="group relative bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all cursor-pointer"
                        >
                            {template.popular && (<div
                                    className="absolute top-4 right-4 z-10 px-3 py-1 bg-yellow-400 text-purple-900 rounded-full flex items-center gap-1">
                                    <Star size={12} fill="currentColor"/>
                                    <span className="text-xs font-semibold">Popular</span>
                                </div>)}

                            <div className={`aspect-[8.5/11] bg-gradient-to-br ${template.color} p-8`}>
                                <div className="h-full bg-white rounded-lg shadow-2xl p-6 space-y-4">
                                    <div className="flex items-center gap-3 mb-6">
                                        <div className="w-16 h-16 bg-gray-200 rounded-full"></div>
                                        <div className="flex-1 space-y-2">
                                            <div className="h-3 bg-gray-800 rounded w-3/4"></div>
                                            <div className="h-2 bg-gray-400 rounded w-1/2"></div>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <div className="h-2 bg-gray-300 rounded w-full"></div>
                                        <div className="h-2 bg-gray-300 rounded w-5/6"></div>
                                        <div className="h-2 bg-gray-300 rounded w-4/5"></div>
                                    </div>

                                    <div className="pt-4 border-t border-gray-200">
                                        <div className="h-2 bg-gray-600 rounded w-2/3 mb-3"></div>
                                        <div className="space-y-2">
                                            <div className="h-2 bg-gray-300 rounded w-full"></div>
                                            <div className="h-2 bg-gray-300 rounded w-full"></div>
                                            <div className="h-2 bg-gray-300 rounded w-3/4"></div>
                                        </div>
                                    </div>

                                    <div className="pt-4 border-t border-gray-200">
                                        <div className="h-2 bg-gray-600 rounded w-1/2 mb-3"></div>
                                        <div className="flex flex-wrap gap-1">
                                            <div className="h-5 w-16 bg-gray-300 rounded-full"></div>
                                            <div className="h-5 w-20 bg-gray-300 rounded-full"></div>
                                            <div className="h-5 w-14 bg-gray-300 rounded-full"></div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="p-4 border-t border-gray-100">
                                <h3 className="font-semibold mb-1">{template.name}</h3>
                                <p className="text-sm text-foreground/70">{template.category}</p>
                            </div>
                        </div>))}
                </div>
            </div>
        </section>);
}
