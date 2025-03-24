import React, { useEffect, useState } from 'react';
import { Image, Layer } from 'react-konva';

interface BackgroundLayerProps {
  backgroundImage?: string;
  stageSize: {
    width: number;
    height: number;
  };
}

const BackgroundLayer: React.FC<BackgroundLayerProps> = ({
  backgroundImage,
  stageSize,
}) => {
  const [image, setImage] = useState<HTMLImageElement | null>(null);

  useEffect(() => {
    if (!backgroundImage) {
      setImage(null);
      return;
    }

    const img = new window.Image();
    img.src = backgroundImage;
    img.onload = () => {
      setImage(img);
    };
  }, [backgroundImage]);

  if (!image) return null;

  // Calculate scaling to fit the image within the stage while maintaining aspect ratio
  const imageRatio = image.width / image.height;
  const stageRatio = stageSize.width / stageSize.height;

  let width = stageSize.width;
  let height = stageSize.height;

  if (imageRatio > stageRatio) {
    // Image is wider than stage
    height = width / imageRatio;
  } else {
    // Image is taller than stage
    width = height * imageRatio;
  }

  return (
    <Layer>
      <Image
        image={image}
        width={width}
        height={height}
        x={(stageSize.width - width) / 2}
        y={(stageSize.height - height) / 2}
        opacity={0.5}
      />
    </Layer>
  );
};

export default BackgroundLayer;
