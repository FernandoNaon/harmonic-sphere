"use client";
import React from "react";
import { ExtensionSelectProps } from "../types/Index";

const ExtensionSelect: React.FC<ExtensionSelectProps> = ({
  label,
  modality,
  options,
  onChange,
}) => {
  return (
    <div>
      <p className="text-sm">{label}</p>
      <div className="inline-flex gap-1">
        {options.map((option, index) => {
          if (
            (modality === "Dim" && option.label === "Major 7th") ||
            (modality === "Aug" && option.label === "Minor 7th")
          ) {
            return null;
          }
          return (
            <button
              className="bg-gray-50 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded-l"
              key={index}
              onClick={() => onChange(option.value.toString())}
            >
              {option.label}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default ExtensionSelect;
