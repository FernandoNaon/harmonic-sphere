import React from "react";
import { useHarmonia } from "../context/HarmoniaContext";
import { tool } from "../utils/utils";

const ToolSelector: React.FC = () => {
  const { selectedTool, handleChangeTool } = useHarmonia();
  return (
    <div className="mb-4 flex justify-center flex-wrap" >
      {tool.map((option, index) => {
        console.log(selectedTool.value)
        console.log(option.value)
        return (
          <button
            className={`bg-gray-50 hover:bg-[var(--secondary-color)] hover:text-white text-gray-800 font-bold py-2 px-4 rounded-l ${
              selectedTool.value === option.value ? "bg-[var(--secondary-color)] text-white" : ""
            }`}
            key={index}
            onClick={() => handleChangeTool(option.value.toString())}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
};

export default ToolSelector;