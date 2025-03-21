import React from 'react';
import { Layer, Line } from 'react-konva';

interface GridLayerProps {
  stageSize: { width: number; height: number };
  gridSize: number;
  zoom: number;
  visible: boolean;
}

const GridLayer: React.FC<GridLayerProps> = ({ stageSize, gridSize, zoom, visible }) => {
  if (!visible) return null;

  const gridLines = [];
  const scaledGridSize = gridSize * zoom;

  // Vertical lines
  for (let x = 0; x < stageSize.width; x += scaledGridSize) {
    gridLines.push(
      <Line
        key={`v-${x}`}
        points={[x, 0, x, stageSize.height]}
        stroke="#ddd"
        strokeWidth={0.5}
      />
    );
  }

  // Horizontal lines
  for (let y = 0; y < stageSize.height; y += scaledGridSize) {
    gridLines.push(
      <Line
        key={`h-${y}`}
        points={[0, y, stageSize.width, y]}
        stroke="#ddd"
        strokeWidth={0.5}
      />
    );
  }

  return <Layer>{gridLines}</Layer>;
};

export default GridLayer;
