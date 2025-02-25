import styled from "styled-components";

export interface CategoryProps {
  name: string;
  imageUrl?: string;
}

export interface CategorySectionProps {
  categories: CategoryProps[];
}

export const Section = styled.section`
  margin-top: 60px;
  width: 100%;
  max-width: 1926px;

  @media (max-width: 991px) {
    margin-top: 40px;
  }
`;

export const Title = styled.h2`
  color: #000000;
  font-family: Montserrat, sans-serif;
  font-size: 20px;
  text-align: center;
  font-weight: 700;
`;

export const CategoriesGrid = styled.div`
  display: flex;
  margin-top: 50px;
  margin-left: 10px;
  align-items: start;
  justify-content: center;
  gap: 20px;
  font-family:
    Open Sans,
    sans-serif;
  font-size: 24px;
  color: #000000;
  font-weight: 600;
  text-align: center;
  flex-wrap: wrap;

  @media (max-width: 991px) {
    margin-top: 40px;
  }
`;

export const CategoryCard = styled.article`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 236px;
`;

export const CategoryImage = styled.div<{ imageUrl?: string }>`
  border-radius: 120px;
  background-color: rgba(217, 217, 217, 1);
  width: 80px;
  height: 80px;
  background-image: ${({ imageUrl }) => (imageUrl ? `url(${imageUrl})` : "none")};
  background-size: cover;
  background-position: center;
`;

export const CategoryName = styled.h3`
  margin-top: 30px;
  font-size: 18px;
`;
