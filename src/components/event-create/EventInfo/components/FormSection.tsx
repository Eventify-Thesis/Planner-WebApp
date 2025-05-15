import React, { useState, useEffect } from 'react';
import { Paper, Text, Box, ThemeIcon } from '@mantine/core';
import { IconChevronRight } from '@tabler/icons-react';
import styles from './FormSection.module.css';

interface FormSectionProps {
  title: string;
  children: React.ReactNode;
  subtitle?: string;
  colorAccent?: 'default' | 'accent1' | 'accent2' | 'accent3' | 'accent4' | 'accent5';
  badge?: string;
  icon?: React.ReactNode;
}

export const FormSection: React.FC<FormSectionProps> = ({ 
  title, 
  children, 
  subtitle, 
  colorAccent = 'default',
  badge,
  icon = <IconChevronRight size={22} />
}) => {
  // Generate a random color accent if not specified
  const [randomAccent, setRandomAccent] = useState<string>('default');
  
  useEffect(() => {
    if (colorAccent === 'default') {
      const accents = ['accent1', 'accent2', 'accent3', 'accent4', 'accent5'];
      const randomIndex = Math.floor(Math.random() * accents.length);
      setRandomAccent(accents[randomIndex]);
    } else {
      setRandomAccent(colorAccent);
    }
  }, [colorAccent]);

  const colorClass = styles[`color${randomAccent.charAt(0).toUpperCase() + randomAccent.slice(1)}`] || '';

  return (
    <Paper withBorder className={`${styles.formSection} ${colorClass}`}>
      <Box className={styles.sectionTitle}>
        <div className={styles.decorativeElement}></div>
        <div className={styles.decorativeElement2}></div>
        <ThemeIcon 
          variant="light" 
          radius="xl"
          size="lg"
          className={styles.titleIcon}
        >
          {icon}
        </ThemeIcon>
        <Text fw={700}>{title}</Text>
        {badge && <span className={styles.badge}>{badge}</span>}
      </Box>
      <Box className={styles.sectionContent}>
        {subtitle && (
          <Text c="dimmed" size="sm" mb="md">
            {subtitle}
          </Text>
        )}
        {children}
      </Box>
    </Paper>
  );
};
