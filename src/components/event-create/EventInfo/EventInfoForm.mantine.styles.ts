import { createStyles } from '@mantine/styles';

export const useEventInfoStyles = createStyles((theme) => ({
  formSection: {
    marginBottom: theme.spacing.xl,
    position: 'relative',
    overflow: 'hidden',
    borderRadius: theme.radius.lg,
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
    border: `1px solid ${theme.colors.gray[2]}`,
    transition: 'all 0.3s ease',
    
    '&:hover': {
      transform: 'translateY(-2px)',
      boxShadow: '0 6px 25px rgba(0, 0, 0, 0.1)',
    }
  },
  
  sectionTitle: {
    padding: `${theme.spacing.md}px ${theme.spacing.xl}px`,
    borderBottom: `1px solid ${theme.colors.gray[3]}`,
    background: `linear-gradient(135deg, ${theme.colors.blue[6]} 0%, ${theme.colors.blue[8]} 100%)`,
    color: theme.white,
    fontWeight: 600,
    fontSize: theme.fontSizes.md,
    borderTopLeftRadius: theme.radius.lg,
    borderTopRightRadius: theme.radius.lg,
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  
  sectionContent: {
    padding: theme.spacing.xl,
    backgroundColor: theme.white,
  },
  
  uploadBox: {
    border: `2px dashed ${theme.colors.blue[2]}`,
    borderRadius: theme.radius.md,
    padding: theme.spacing.xl,
    backgroundColor: theme.fn.rgba(theme.colors.blue[0], 0.5),
    textAlign: 'center',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    
    '&:hover': {
      backgroundColor: theme.fn.rgba(theme.colors.blue[1], 0.6),
      borderColor: theme.colors.blue[5],
      transform: 'scale(1.01)',
    },
  },
  
  imagePreview: {
    width: '100%',
    height: 'auto',
    borderRadius: theme.radius.md,
    marginBottom: theme.spacing.xs,
    boxShadow: '0 4px 10px rgba(0, 0, 0, 0.1)',
    transition: 'all 0.3s ease',
    
    '&:hover': {
      transform: 'scale(1.02)',
      boxShadow: '0 6px 14px rgba(0, 0, 0, 0.15)',
    }
  },
  
  formWrapper: {
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing.xl,
    width: '100%',
  },
  
  textInput: {
    transition: 'all 0.2s',
    '&:focus': {
      borderColor: theme.colors.blue[5],
      boxShadow: `0 0 0 2px ${theme.fn.rgba(theme.colors.blue[5], 0.2)}`
    }
  },
  
  requiredMark: {
    color: theme.colors.red[6],
    marginLeft: '4px',
  },
  
  helperText: {
    fontSize: theme.fontSizes.xs,
    color: theme.colors.gray[6],
    marginTop: theme.spacing.xs,
  },
  
  infoCard: {
    backgroundColor: theme.fn.rgba(theme.colors.blue[0], 0.5),
    borderLeft: `4px solid ${theme.colors.blue[6]}`,
    padding: theme.spacing.md,
    borderRadius: theme.radius.md,
    marginBottom: theme.spacing.md,
  },
  
  card: {
    backgroundColor: theme.white,
    borderRadius: theme.radius.md,
    boxShadow: '0 2px 10px rgba(0, 0, 0, 0.05)',
    transition: 'all 0.3s ease',
    '&:hover': {
      boxShadow: '0 4px 15px rgba(0, 0, 0, 0.08)',
    },
  }
}));
