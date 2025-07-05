import React from 'react';
import { fluentColors } from '../constants';

interface CustomAvatarProps {
  size?: number;
  color?: string;
  char?: string;
  shape?: 'circle' | 'square';
}

const CustomAvatar: React.FC<CustomAvatarProps> = ({
  size = 32,
  color,
  char = 'A',
  shape = 'circle'
}) => {
  const backgroundColor = color || fluentColors[Math.abs(char.charCodeAt(0)) % fluentColors.length];
  
  // Simulate the toolbar's active tile effect with a radial gradient using the fluent color
  const background = `radial-gradient(circle at 60% 40%, ${backgroundColor} 0%, rgba(20,20,20,0.85) 70%, #141414 100%)`;
  
  const style: React.CSSProperties = {
    width: size,
    height: size,
    borderRadius: shape === 'circle' ? '50%' : '8px',
    background,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#fff',
    fontSize: Math.max(10, size * 0.5),
    fontWeight: 'bold',
    border: `2.5px solid ${backgroundColor}`,
    boxSizing: 'border-box',
    boxShadow: `0 0 8px 1px ${backgroundColor}55`,
    transition: 'box-shadow 0.2s',
    position: 'relative',
    flexShrink: 0
  };

  return (
    <div style={style}>
      {char.toUpperCase()}
    </div>
  );
};

export default CustomAvatar; 