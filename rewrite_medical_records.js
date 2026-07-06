const fs = require('fs');

const path = '../physician_static/src/components/MedicalRecords.jsx';
let content = fs.readFileSync(path, 'utf8');

// 1. Add state for accordions
content = content.replace('const [openGroup, setOpenGroup] = useState(null);', 'const [openGroup, setOpenGroup] = useState(null);\n  const [internalOpen, setInternalOpen] = useState(true);\n  const [externalOpen, setExternalOpen] = useState(false);');

// 2. Refactor the rendering logic
const oldRenderStart = `          filter === "prescription" ? (`;
const oldRenderEndRegex = /<\/div>\s*\)\s*;\s*}\s*;\s*export default MedicalRecords;/g;

const tableRendererCode = `
  const renderTableRows = (records) => {
    return (
      <table className="w-full text-left border-collapse relative">
        <thead className="sticky top-0 bg-white/90 backdrop-blur-md z-10 shadow-[0_1px_2px_rgba(0,0,0,0.05)]">
          <tr className="border-b border-slate-100">
            <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Type</th>
            <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Record Name</th>
            <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Clinic / Doctor</th>
            <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Created Date</th>
            <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Action</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-50">
          {records.map((record, idx) => {
            const { icon, color, bg } = getRecordIcon(record);
            const date = dayjs(record.createdAt || record.recordDate || record._id);
            return (
              <tr
                key={record._id || idx}
                onClick={() => setSelectedRecord(record)}
                className="group hover:bg-slate-50/50 transition-colors cursor-pointer animate-fade-in-up"
                style={{ animationDelay: \`\${idx * 100}ms\`, opacity: 0, animationFillMode: "forwards" }}
              >
                <td className="px-6 py-4">
                  <div className={\`w-10 h-10 rounded-xl \${bg} flex items-center justify-center \${color} group-hover:scale-110 transition-transform\`}>
                    <Icon icon={icon} width={24} />
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-slate-800 group-hover:text-[#14bef0] transition-colors line-clamp-1">
                      {getRecordTitle(record)}
                    </span>
                    <span className="text-xs font-medium text-slate-500 line-clamp-1 mt-1">
                      {getRecordSubtitle(record)}
                    </span>
                    {dayjs().isSame(date, "day") && (
                      <span className="text-[9px] font-black text-orange-500 uppercase mt-0.5">Today</span>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-slate-700 line-clamp-1">
                      {record._clinicName || record.clinicName || "Other / Internal"}
                    </span>
                    <span className="text-xs font-medium text-[#14bef0] line-clamp-1">
                      Dr. {record.doctorName || record.drName || "Consultant"}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-slate-700">
                      {date.format("DD MMM, YYYY")}
                    </span>
                    <span className="text-[10px] font-medium text-slate-400">
                      {date.format("hh:mm A")}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center justify-end gap-2">
                    {record.finalReportNotes && record.finalReportNotes !== "Dynamically Generated PDF Report." && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedReportNotes({ notes: record.finalReportNotes, type: record._type });
                        }}
                        className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition-all border border-emerald-100 font-bold text-[11px] uppercase tracking-widest"
                        title="View AI Report"
                      >
                        <Icon icon="solar:magic-stick-3-bold-duotone" width={16} /> AI Report
                      </button>
                    )}
                    <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-50 text-slate-500 group-hover:bg-[#14bef0]/10 group-hover:text-[#14bef0] transition-all border border-slate-100 group-hover:border-[#14bef0]/20 font-bold text-[11px] uppercase tracking-widest">
                      <Icon icon="solar:eye-bold-duotone" width={16} /> View Report
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
          {records.length === 0 && (
            <tr><td colSpan={5} className="px-6 py-8 text-center text-slate-400 text-sm font-medium">No records found.</td></tr>
          )}
        </tbody>
      </table>
    );
  };

  const renderScansGroups = (records) => {
    return (
      <div className="flex flex-col gap-3 p-4">
        {Object.entries(
          records.reduce((acc, record) => {
            const groupTitle = getRecordTitle(record);
            if (!acc[groupTitle]) acc[groupTitle] = [];
            acc[groupTitle].push(record);
            return acc;
          }, {})
        ).map(([groupName, groupRecords]) => {
          const isOpen = openGroup === groupName;
          return (
            <div key={groupName} className="border border-slate-200 rounded-2xl bg-white overflow-hidden shadow-sm">
              <button
                onClick={() => setOpenGroup(openGroup === groupName ? null : groupName)}
                className="w-full flex items-center justify-between p-4 bg-white hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-[#14bef0]/10 text-[#14bef0]">
                    <Icon icon="solar:scanner-bold-duotone" width={24} />
                  </div>
                  <div className="flex flex-col items-start">
                    <span className="font-bold text-slate-800 text-left">{groupName}</span>
                    <span className="text-xs font-medium text-slate-500">
                      {groupRecords.length} Record{groupRecords.length !== 1 ? "s" : ""}
                    </span>
                  </div>
                </div>
                <div className={\`w-8 h-8 rounded-full flex items-center justify-center bg-slate-50 text-slate-400 transition-transform duration-300 \${isOpen ? "rotate-180" : ""}\`}>
                  <Icon icon="solar:alt-arrow-down-linear" width={20} />
                </div>
              </button>
              {isOpen && (
                <div className="border-t border-slate-100 overflow-auto bg-slate-50/30">
                  {renderTableRows(groupRecords)}
                </div>
              )}
            </div>
          );
        })}
        {records.length === 0 && (
            <div className="px-6 py-8 text-center text-slate-400 text-sm font-medium">No scan records found.</div>
        )}
      </div>
    );
  };

  const renderMasterAccordion = (title, records, isOpen, toggleOpen, iconStr, colorClass, bgClass) => {
    return (
      <div className="mb-6 flex flex-col min-h-0 animate-fade-in-up">
        <div 
          className="flex items-center gap-2 mb-3 cursor-pointer hover:opacity-80 transition-opacity w-max"
          onClick={toggleOpen}
        >
          <div className={\`w-8 h-8 rounded-lg flex items-center justify-center \${bgClass} \${colorClass}\`}>
            <Icon icon={iconStr} width={18} />
          </div>
          <h3 className="text-md font-black text-slate-800 uppercase tracking-widest">
            {title} <span className="text-slate-400 ml-2 text-sm font-bold">({records.length})</span>
          </h3>
          <Icon 
            icon={isOpen ? "solar:alt-arrow-up-linear" : "solar:alt-arrow-down-linear"} 
            className="text-slate-400 ml-2" 
            width={20} 
          />
        </div>
        
        {isOpen && (
          <div className={\`bg-white rounded-3xl \${isNested ? 'border-0' : 'border border-slate-100 shadow-sm'} overflow-hidden\`}>
             {filter === "scan" ? renderScansGroups(records) : renderTableRows(records)}
          </div>
        )}
      </div>
    );
  };

  const currentRecords = dummyRecords
    .filter((r) => filter === "all" || r._type === filter)
    .filter((r) => !selectedClinic || r._clinicName === selectedClinic.clinic_name);
    
  const internalRecords = currentRecords.filter((r) => !r.isExternal);
  const externalRecords = currentRecords.filter((r) => r.isExternal);

`;

const renderEnd = `
        {loading ? (
          <div className="flex flex-col items-center justify-center h-full gap-4">
            <Icon icon="solar:spinner-linear" className="animate-spin text-[#14bef0] text-4xl" />
            <span className="text-slate-400 font-medium">Fetching your medical history...</span>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto w-full pr-2">
            {filter === "prescription" ? (
              <PrescriptionsView 
                records={currentRecords}
                selectedClinic={selectedClinic}
                setSelectedRecord={setSelectedRecord}
                setSelectedReportNotes={setSelectedReportNotes}
              />
            ) : (
              <div className="flex flex-col gap-2">
                {renderMasterAccordion("Internal Records", internalRecords, internalOpen, () => setInternalOpen(!internalOpen), "solar:hospital-bold-duotone", "text-blue-500", "bg-blue-50")}
                {renderMasterAccordion("External Records", externalRecords, externalOpen, () => setExternalOpen(!externalOpen), "solar:folder-with-files-bold-duotone", "text-amber-500", "bg-amber-50")}
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
};
export default MedicalRecords;
`;

const startIndex = content.indexOf(oldRenderStart);
if (startIndex !== -1) {
  content = content.substring(0, startIndex) + tableRendererCode + renderEnd;
  fs.writeFileSync(path, content, 'utf8');
  console.log("Successfully replaced MedicalRecords.jsx render logic.");
} else {
  console.log("Could not find start index.");
}
