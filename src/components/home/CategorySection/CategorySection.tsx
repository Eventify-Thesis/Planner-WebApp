"use client";
import React from "react";
import styled from "styled-components";
import { CategoryProps } from "./CategorySection.styles";
import { useTranslation } from 'react-i18next';
import * as s from "./CategorySection.styles";

export const CategorySection: React.FC<s.CategorySectionProps> = ({
  categories,
}) => {  
  return (
    <s.Section>
      <s.Title>Explore Categories</s.Title>
      <s.CategoriesGrid>
        {categories.map((category, index) => (
          <s.CategoryCard key={index}>
            <s.CategoryImage imageUrl={category.imageUrl} />
            <s.CategoryName>{category.name}</s.CategoryName>
          </s.CategoryCard>
        ))}
      </s.CategoriesGrid>
    </s.Section>
  );
};
