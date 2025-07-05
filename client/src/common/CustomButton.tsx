import React from 'react';

interface CustomButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  size?: 'small' | 'medium' | 'large';
  variant?: 'primary' | 'subtle' | 'danger';
  icon?: React.ReactNode;
  disabled?: boolean;
  className?: string;
}

const CustomButton: React.FC<CustomButtonProps> = ({
  children,
  onClick,
  size = 'medium',
  variant = 'primary',
  icon,
  disabled = false,
  className = ''
}) => {
  const getSizeStyles = () => {
    switch (size) {
      case 'small':
        return {
          padding: '4px 10px',
          fontSize: '12px',
          gap: '6px'
        };
      case 'large':
        return {
          padding: '8px 16px',
          fontSize: '16px',
          gap: '8px'
        };
      default: // medium
        return {
          padding: '6px 12px',
          fontSize: '14px',
          gap: '7px'
        };
    }
  };

  const getVariantStyles = () => {
    switch (variant) {
      case 'primary':
        return {
          background: 'linear-gradient(135deg, #0078d4 0%, #106ebe 50%, #005a9e 100%)',
          border: '1px solid #0078d4',
          color: '#ffffff',
          boxShadow: '0 2px 8px rgba(0, 120, 212, 0.3)',
          hoverBackground: 'linear-gradient(135deg, #106ebe 0%, #005a9e 50%, #004578 100%)',
          hoverBoxShadow: '0 4px 12px rgba(0, 120, 212, 0.4)'
        };
      case 'subtle':
        return {
          background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.02) 100%)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          color: '#ffffff',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)',
          hoverBackground: 'linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%)',
          hoverBoxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)'
        };
      case 'danger':
        return {
          background: 'linear-gradient(135deg, #d13438 0%, #b91c1c 50%, #991b1b 100%)',
          border: '1px solid #d13438',
          color: '#ffffff',
          boxShadow: '0 2px 8px rgba(209, 52, 56, 0.3)',
          hoverBackground: 'linear-gradient(135deg, #b91c1c 0%, #991b1b 50%, #7f1d1d 100%)',
          hoverBoxShadow: '0 4px 12px rgba(209, 52, 56, 0.4)'
        };
    }
  };

  const sizeStyles = getSizeStyles();
  const variantStyles = getVariantStyles();

  const baseStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: sizeStyles.gap,
    padding: sizeStyles.padding,
    fontSize: sizeStyles.fontSize,
    fontWeight: '500',
    borderRadius: '6px',
    border: variantStyles.border,
    background: variantStyles.background,
    color: variantStyles.color,
    boxShadow: variantStyles.boxShadow,
    cursor: disabled ? 'not-allowed' : 'pointer',
    transition: 'all 0.2s ease-in-out',
    opacity: disabled ? 0.6 : 1,
    userSelect: 'none',
    outline: 'none'
  };

  return (
    <button
      onClick={disabled ? undefined : onClick}
      style={baseStyle}
      className={`custom-button ${className}`}
      data-type={variant}
      disabled={disabled}
    >
      {icon && <span className="button-icon">{icon}</span>}
      {children}
    </button>
  );
};

export default CustomButton; 