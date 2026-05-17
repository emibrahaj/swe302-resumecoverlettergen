import React from "react";

interface Props {
  children: React.ReactNode;
}

export default function ResumePage({ children }: Props) {
  return (

      <div
        className="
          w-[794px]
          min-h-[1123px]
          bg-white
          shadow-lg
          overflow-hidden
        "
      >
        {children}
      </div>

  );
}