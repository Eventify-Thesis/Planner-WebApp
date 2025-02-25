import React from "react";
import * as s from "./Banner.styles"; // Import styles

interface BannerProps {
  images: string[];
}

export const Banner: React.FC<BannerProps> = ({ images }) => {
  // Group images into pairs
  const groupedImages = [];
  for (let i = 0; i < images.length; i += 2) {
    groupedImages.push([images[i], images[i + 1]]);
  }

  return (
    <s.StyledCarousel arrows infinite={true} draggable={true} autoplay={{ dotDuration: true }}>
      {groupedImages.map((pair, index) => (
        <s.SlideContainer key={index}>
          <s.ImageWrapper>
            {pair.map((image, idx) => (
              <s.SlideImage
                key={idx}
                src={image}
                alt={`Slide ${index * 2 + idx + 1}`}
              />
            ))}
          </s.ImageWrapper>
        </s.SlideContainer>
      ))}
    </s.StyledCarousel>
  );
};