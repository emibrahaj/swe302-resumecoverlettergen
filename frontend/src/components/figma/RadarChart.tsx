interface RadarChartProps {
  data: {
    category: string;
    current: number;
    target: number;
  }[];
}

export function RadarChart({ data }: RadarChartProps) {
  const size = 300;
  const center = size / 2;
  const maxRadius = size / 2 - 40;
  const levels = 5;
  const angleStep = (Math.PI * 2) / data.length;

  const getPoint = (value: number, index: number) => {
    const angle = angleStep * index - Math.PI / 2;
    const radius = (value / 100) * maxRadius;
    return {
      x: center + radius * Math.cos(angle),
      y: center + radius * Math.sin(angle)
    };
  };

  const currentPoints = data.map((item, i) => getPoint(item.current, i));
  const targetPoints = data.map((item, i) => getPoint(item.target, i));

  const currentPath = currentPoints.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ') + ' Z';
  const targetPath = targetPoints.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ') + ' Z';

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {/* Background circles */}
      {Array.from({ length: levels }).map((_, i) => {
        const radius = ((i + 1) / levels) * maxRadius;
        return (
          <circle
            key={i}
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke="#e5e7eb"
            strokeWidth="1"
          />
        );
      })}

      {/* Axis lines */}
      {data.map((_, index) => {
        const point = getPoint(100, index);
        return (
          <line
            key={index}
            x1={center}
            y1={center}
            x2={point.x}
            y2={point.y}
            stroke="#e5e7eb"
            strokeWidth="1"
          />
        );
      })}

      {/* Target polygon (light teal) */}
      <path
        d={targetPath}
        fill="#14b8a6"
        fillOpacity="0.2"
        stroke="#14b8a6"
        strokeWidth="2"
      />

      {/* Current polygon (teal) */}
      <path
        d={currentPath}
        fill="#088395"
        fillOpacity="0.3"
        stroke="#088395"
        strokeWidth="2"
      />

      {/* Current points */}
      {currentPoints.map((point, i) => (
        <circle
          key={`current-${i}`}
          cx={point.x}
          cy={point.y}
          r="4"
          fill="#088395"
        />
      ))}

      {/* Target points */}
      {targetPoints.map((point, i) => (
        <circle
          key={`target-${i}`}
          cx={point.x}
          cy={point.y}
          r="4"
          fill="#14b8a6"
        />
      ))}

      {/* Labels */}
      {data.map((item, index) => {
        const labelPoint = getPoint(115, index);
        const angle = angleStep * index - Math.PI / 2;

        let textAnchor: 'start' | 'middle' | 'end' = 'middle';
        if (Math.cos(angle) > 0.3) textAnchor = 'start';
        else if (Math.cos(angle) < -0.3) textAnchor = 'end';

        return (
          <text
            key={`label-${index}`}
            x={labelPoint.x}
            y={labelPoint.y}
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
