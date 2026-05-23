import React from "react";

interface Props {
  children: React.ReactNode;
}

export default function ResumePage({ children }: Props) {
  return (
    <div className="w-full max-w-[794px] mx-auto">
      <div
        className="
          w-full
          min-h-[1123px]
          bg-white
          shadow-lg
        "
      >
        {children}
      </div>
    </div>
  );
}