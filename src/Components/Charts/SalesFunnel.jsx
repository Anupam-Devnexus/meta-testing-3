import React from "react";

const funnelStages = [
  { name: "Leads", value: 500 },
  { name: "Contacted", value: 350 },
  { name: "Qualified", value: 200 },
  { name: "Proposals", value: 120 },
  { name: "Closed", value: 60 },
];

const SalesFunnel = () => {
  const maxValue = Math.max(...funnelStages.map((stage) => stage.value));

  return (
    <div className="p-6 bg-white rounded-lg shadow-md max-w-full mx-auto">

      <div className="flex flex-col gap-2">
        {funnelStages.map((stage, idx) => {
          const widthPercent = (stage.value / maxValue) * 100;
          return (
            <div key={idx} className="flex items-center gap-4">
              <span className="w-18 font-semibold">{stage.name}</span>
              <div className="flex-1 bg-gray-200 h-12 rounded-md relative">
                <div
                  className="bg-blue-500 h-12 rounded-md transition-all duration-500"
                  style={{ width: `${widthPercent}%` }}
                  title={`${stage.value} leads`}
                ></div>
                <span className="absolute right-2 top-1 text-white font-semibold">
                  {stage.value}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default SalesFunnel;
