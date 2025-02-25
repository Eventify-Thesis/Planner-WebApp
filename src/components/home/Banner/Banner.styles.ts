import styled from "styled-components";
import { Carousel } from "antd";

export interface BannerProps {
  images: string[];
}

export const StyledCarousel = styled(Carousel)`
  width: 80%;
  margin: 0 auto;
  padding-top: 15px;

  .slick-prev,
  .slick-next {
    width: 40px;
    height: 40px;
    background-color: rgba(0, 0, 0, 0.7); /* Dark background */
    border-radius: 50%;
    display: flex !important;
    align-items: center;
    justify-content: center;
    z-index: 2;
  }

  .slick-prev:hover,
  .slick-next:hover {
    background-color: rgba(0, 0, 0, 0.9); /* Darker on hover */
  }

  /* Adjust the arrow positions to fix alignment */
  .slick-prev {
    left: -50px !important; /* Moves left arrow outward */
  }

  .slick-next {
    right: -50px !important; /* Moves right arrow outward */
  }

  .slick-prev::after,
  .slick-next::after {
    font-size: 18px;
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 50%;
    height: 50%;
    position: relative;
    left: 0px; /* Ensures arrow is centered */
    top: -1.2px;
  }
`;


export const SlideContainer = styled.div`
  width: 100%;
`;

export const ImageWrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 10px;
  width: 100%;
`;

export const SlideImage = styled.img`
  width: 48%;
  height: 300px;
  object-fit: cover;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;
