import React, { useEffect, useRef } from 'react';
import { Layer, Transformer } from 'react-konva';
import { Selection, EditorTool } from '../../../types';

interface TransformerLayerProps {
  selection: Selection;
  currentTool: EditorTool;
  onTransform: (e: any) => void;
}

const TransformerLayer: React.FC<TransformerLayerProps> = ({
  selection,
  currentTool,
  onTransform,
}) => {
  const transformerRef = useRef<any>(null);
  const selectedNodes = useRef<any[]>([]);

  useEffect(() => {
    // Get all selected nodes
    const stage = transformerRef.current?.getStage();
    if (!stage) return;

    selectedNodes.current = [
      ...selection.selectedItems.rows.map((id) => stage.findOne(`#${id}`)),
      ...selection.selectedItems.areas.map((id) => stage.findOne(`#${id}`)),
      // ...selection.selectedItems?.sections?.map((id) =>
      //   stage.findOne(`#${id}`),
      // ),
    ].filter(Boolean);

    // Attach nodes to transformer
    if (transformerRef.current) {
      transformerRef.current.nodes(selectedNodes.current);
      transformerRef.current.getLayer()?.batchDraw();
    }
  }, [selection]);

  return (
    <Layer>
      <Transformer
        ref={transformerRef}
        boundBoxFunc={(oldBox, newBox) => {
          // Limit resize
          return newBox;
        }}
        rotateEnabled={true}
        enabledAnchors={[
          'top-left',
          'top-right',
          'bottom-left',
          'bottom-right',
        ]}
        rotationSnaps={[0, 45, 90, 135, 180, 225, 270, 315]}
        onTransform={onTransform}
      />
    </Layer>
  );
};

export default TransformerLayer;
