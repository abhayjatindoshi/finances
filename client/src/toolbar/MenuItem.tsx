import React, { } from 'react';
import { Link, useLocation } from 'react-router-dom';

interface MenuItemProps {
  icon: React.ReactNode;
  title: string;
  link: string;
  hideTitle?: boolean;
}

const MenuItem: React.FC<MenuItemProps> = ({ icon, title, link, hideTitle }) => {

  const location = useLocation();
  const highlight = location.pathname.startsWith(link);

  return (
    <div className='flex flex-col items-center gap-2'>
      <Link to={link}>
        <div className="flex items-center gap-2">
          {icon}
          {!hideTitle && <span> {title}</span>}
        </div>
      </Link>
      <span className='w-5 border-b-2 rounded-full' style={{ borderColor: highlight ? "currentColor" : 'transparent' }} />
    </div>
  );
};

export default MenuItem;