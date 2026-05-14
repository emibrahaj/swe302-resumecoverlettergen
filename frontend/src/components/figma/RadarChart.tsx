interface RadarChartProps {
  data: {
    category: string;
    current: number;
    target: number;
  }[];
}

export function RadarChart({ data }: RadarChartProps) {
  // Inner chart geometry stays compact; the SVG canvas is wider+taller than the
  // chart itself so labels at the left/right have room to render in full.
  const chartSize = 300;
  const horizontalPadding = 100;   // room for labels like "Technical Skills" / "Job Relevance"
  const verticalPadding = 30;
  const canvasWidth = chartSize + horizontalPadding * 2;   // 500
  const canvasHeight = chartSize + verticalPadding * 2;    // 360
  const cx = canvasWidth / 2;
  const cy = canvasHeight / 2;
  const maxRadius = chartSize / 2 - 10;
  const levels = 5;
  const angleStep = (Math.PI * 2) / data.length;

  const getPoint = (value: number, index: number) => {
    const angle = angleStep * index - Math.PI / 2;
    const radius = (value / 100) * maxRadius;
    return {
      x: cx + radius * Math.cos(angle),
      y: cy + radius * Math.sin(angle),
    };
  };

  const currentPoints = data.map((item, i) => getPoint(item.current, i));
  const targetPoints = data.map((item, i) => getPoint(item.target, i));

  const currentPath = currentPoints.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ") + " Z";
  const targetPath = targetPoints.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ") + " Z";

  return (
    <svg
      width="100%"
      height="auto"
      viewBox={`0 0 ${canvasWidth} ${canvasHeight}`}
      preserveAspectRatio="xMidYMid meet"
      style={{ maxWidth: canvasWidth, overflow: "visible" }}
    >
      {/* Background circles */}
      {Array.from({ length: levels }).map((_, i) => {
        const radius = ((i + 1) / levels) * maxRadius;
        return (
          <circle key={i} cx={cx} cy={cy} r={radius} fill="none" stroke="#e5e7eb" strokeWidth="1" />
        );
      })}

      {/* Axis lines */}
      {data.map((_, index) => {
        const point = getPoint(100, index);
        return (
          <line
            key={index}
            x1={cx}
            y1={cy}
            x2={point.x}
            y2={point.y}
            stroke="#e5e7eb"
            strokeWidth="1"
          />
        );
      })}

      {/* Target polygon (light teal) */}
      <path d={targetPath} fill="#14b8a6" fillOpacity="0.2" stroke="#14b8a6" strokeWidth="2" />

      {/* Current polygon (teal) */}
      <path d={currentPath} fill="#088395" fillOpacity="0.3" stroke="#088395" strokeWidth="2" />

      {/* Current points */}
      {currentPoints.map((point, i) => (
        <circle key={`current-${i}`} cx={point.x} cy={point.y} r="4" fill="#088395" />
      ))}

      {/* Target points */}
      {targetPoints.map((point, i) => (
        <circle key={`target-${i}`} cx={point.x} cy={point.y} r="4" fill="#14b8a6" />
      ))}

      {/* Labels — placed just outside the chart with an extra ~25px offset so
          the bounding box of each text element has clear space. */}
      {data.map((item, index) => {
        const angle = angleStep * index - Math.PI / 2;
        const labelRadius = maxRadius + 22;
        const labelX = cx + labelRadius * Math.cos(angle);
        const labelY = cy + labelRadius * Math.sin(angle);

        let textAnchor: "start" | "middle" | "end" = "middle";
        if (Math.cos(angle) > 0.15) textAnchor = "start";
        else if (Math.cos(angle) < -0.15) textAnchor = "end";

        return (
          <text
            key={`label-${index}`}
            x={labelX}
            y={labelY}
            textAnchor={textAnchor}
            dominantBaseline="middle"
            className="text-sm font-semibold"
            fill="#374151"
          >
            {item.category}
          </text>
        );
      })}
    </svg>
  );
}
