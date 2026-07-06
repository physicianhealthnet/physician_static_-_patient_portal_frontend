import React from "react";
import { Icon } from "@iconify/react";
import AIGaugeReport from "./AIGaugeReport";

export const AIReportModal = ({ selectedReportNotes, onClose }) => {
    if (!selectedReportNotes) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md transition-all duration-300" style={{ zIndex: 9999 }}>
            <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
                <div className="flex justify-between items-center p-6 border-b border-slate-100 bg-slate-50/50">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-600">
                            <Icon icon="solar:magic-stick-3-bold-duotone" className="text-xl" />
                        </div>
                        <h2 className="text-xl font-black text-slate-800 tracking-tight">
                            {selectedReportNotes.type === 'lab' ? 'AI Lab ' : selectedReportNotes.type === 'scan' ? 'AI Scan ' : 'AI Diagnostic '}
                            <span className="text-emerald-600">Interpretation</span>
                        </h2>
                    </div>
                    <button onClick={onClose} className="text-slate-400 hover:text-red-500 transition-colors p-2 rounded-xl hover:bg-red-50">
                        <Icon icon="solar:close-circle-bold-duotone" className="text-2xl" />
                    </button>
                </div>
                <div className="p-8 max-h-[70vh] overflow-y-auto custom-scrollbar bg-white">
                    {(() => {
                        let parsedData = null;
                        try {
                            let cleanString = selectedReportNotes.notes.trim();
                            if (cleanString.startsWith('```json')) {
                                cleanString = cleanString.replace(/```json/g, '').replace(/```/g, '').trim();
                            } else if (cleanString.startsWith('```')) {
                                cleanString = cleanString.replace(/```/g, '').trim();
                            }
                            parsedData = JSON.parse(cleanString);
                        } catch (e) {
                            parsedData = null;
                        }

                        if (parsedData && Array.isArray(parsedData)) {
                            const isLab = selectedReportNotes.type === 'lab';
                            const mappedItems = parsedData.map(item => ({
                                title: item.test_name || item.title || (isLab ? "Lab Value" : "Diagnostic Value"),
                                value: item.value || "",
                                unit: item.unit || "",
                                reference: item.reference || "",
                                impression: item.impression || "",
                                flag: item.flag || "normal",
                                patient_solution: item.patient_solution || "",
                                treatment_suggestion: item.treatment_suggestion || "",
                                type: isLab ? "lab" : (item.type || selectedReportNotes.type || "diagnostic")
                            }));
                            
                            return (
                                <AIGaugeReport 
                                    items={mappedItems} 
                                    color="indigo" 
                                    icon={isLab ? "solar:test-tube-bold-duotone" : "solar:health-bold-duotone"} 
                                />
                            );
                        }

                        const renderMarkdownFallback = (text) => {
                            return text.split('\n').map((line, i) => {
                                if (line.trim() === '') return <br key={i} />;
                                
                                // Headers
                                if (line.startsWith('### ')) return <h4 key={i} className="text-md font-bold text-slate-800 mt-4 mb-2">{line.replace('### ', '').replace(/\*\*/g, '')}</h4>;
                                if (line.startsWith('## ')) return <h3 key={i} className="text-lg font-black text-slate-800 mt-5 mb-3">{line.replace('## ', '').replace(/\*\*/g, '')}</h3>;
                                if (line.startsWith('# ')) return <h2 key={i} className="text-xl font-black text-slate-800 mt-6 mb-4">{line.replace('# ', '').replace(/\*\*/g, '')}</h2>;
                                
                                // Bold line fully
                                if (line.startsWith('**') && line.endsWith('**')) {
                                    return <h4 key={i} className="text-sm font-bold text-slate-800 mt-3 mb-1">{line.replace(/\*\*/g, '')}</h4>;
                                }

                                // List items
                                if (line.trim().startsWith('* ')) {
                                    const content = line.trim().substring(2);
                                    let elements = [];
                                    const boldRegex = /\*\*(.*?)\*\*/g;
                                    let match;
                                    let lastIdx = 0;
                                    while ((match = boldRegex.exec(content)) !== null) {
                                        elements.push(content.substring(lastIdx, match.index));
                                        elements.push(<strong key={lastIdx} className="font-bold text-slate-800">{match[1]}</strong>);
                                        lastIdx = boldRegex.lastIndex;
                                    }
                                    elements.push(content.substring(lastIdx));
                                    return (
                                        <div key={i} className="flex gap-2 mb-1.5 ml-2">
                                            <div className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-1.5 shrink-0"></div>
                                            <p className="text-sm text-slate-600 leading-relaxed">{elements}</p>
                                        </div>
                                    );
                                }

                                // Regular line with inline bold
                                let elements = [];
                                const boldRegex = /\*\*(.*?)\*\*/g;
                                let match;
                                let lastIdx = 0;
                                while ((match = boldRegex.exec(line)) !== null) {
                                    elements.push(line.substring(lastIdx, match.index));
                                    elements.push(<strong key={lastIdx} className="font-bold text-slate-800">{match[1]}</strong>);
                                    lastIdx = boldRegex.lastIndex;
                                }
                                elements.push(line.substring(lastIdx));

                                return <p key={i} className="text-sm text-slate-600 leading-relaxed mb-2">{elements}</p>;
                            });
                        };

                        return (
                            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 shadow-inner max-w-none">
                                {renderMarkdownFallback(selectedReportNotes.notes)}
                            </div>
                        );
                    })()}
                    <div className="mt-6 p-4 bg-amber-50 border border-amber-100 rounded-xl">
                        <div className="flex items-center gap-2 text-amber-700 font-bold text-xs mb-1 uppercase tracking-wider">
                            <Icon icon="solar:danger-bold-duotone" width={16} />
                            <span>Clinical Disclaimer</span>
                        </div>
                        <p className="text-[11px] text-amber-600 leading-tight">
                            This interpretation is AI-generated based on the diagnostic values. It must be correlated with clinical findings and validated by a treating physician.
                        </p>
                    </div>
                </div>
                <div className="p-6 border-t border-slate-100 flex justify-end bg-slate-50/30">
                    <button onClick={onClose} className="px-8 py-3 bg-slate-800 text-white rounded-xl text-sm font-black hover:bg-slate-900 transition-all shadow-lg shadow-slate-200 uppercase tracking-widest">
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};
