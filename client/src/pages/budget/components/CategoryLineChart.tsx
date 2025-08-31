import React from 'react';


interface CategoryLineChartProps {
  history: number[];
  gradientColors: [string, string];
  width?: number;
  height?: number;
}

const CategoryLineChart: React.FC<CategoryLineChartProps> = ({ history, gradientColors, width }) => {
  if (!history.length) return null;
  const pad = 0;
  const w = 120; // base width for viewBox
  const h = 100; // use 100 for responsive height
  const min = Math.min(...history);
  const max = Math.max(...history);
  const chartPadTop = 25; // 1/4th of 100
  // Map all y values to [chartPadTop, h] range in viewBox units
  const pointsArr = history.map((v, i) => {
    const x = pad + ((w - 2 * pad) * i) / (history.length - 1);
    let y;
    if (v === 0) {
      y = h;
    } else if (max === min) {
      y = chartPadTop;
    } else {
      y = h - ((h - chartPadTop) * v) / (max - 0);
    }
    return [x, y];
  });
  const points = pointsArr.map(([x, y]) => `${x},${y}`).join(' ');
  return (
    <svg
      width="100%"
      height="100%"
      viewBox={`0 0 ${w} ${h}`}
      preserveAspectRatio="none"
      style={{ display: 'block', opacity: 0.7 }}
    >
      <polygon
        points={
          pointsArr.map(([x, y]) => `${x},${y}`).join(' ') +
          ` ${w},${h} 0,${h}`
        }
        fill={gradientColors[0]}
  opacity={0.05}
      />
      <polyline
        fill="none"
        stroke={gradientColors[0]}
        strokeWidth={1.1}
        points={points}
        style={{ filter: 'blur(0.2px)', opacity: 0.85 }}
      />
    </svg>
  );
};

export default CategoryLineChart;
