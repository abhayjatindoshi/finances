import React, { } from 'react';
import { Link } from 'react-router-dom';

interface MenuItemProps {
  icon: React.ReactNode;
  title: string;
  link: string;
  hideTitle?: boolean;
}

const MenuItem: React.FC<MenuItemProps> = ({ icon, title, link, hideTitle }) => {

  return (
    <Link to={link}>
      <div className="flex items-center gap-2">
        {icon}
        {!hideTitle && <span> {title}</span>}
      </div>
    </Link>
  );
};

export default MenuItem;