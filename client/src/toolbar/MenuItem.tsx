import React from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';

interface MenuItemProps {
  icon: React.ReactNode;
  title: string;
  link: string;
  hideTitle?: boolean;
}

const MenuItem: React.FC<MenuItemProps> = ({ icon, title, link, hideTitle }) => {

  const location = useLocation();
  const { tenantId } = useParams();
  const highlight = location.pathname.startsWith(`/tenants/${tenantId}/${link}`);

  return (
    <div className='flex flex-col items-center h-full justify-between relative'>
      <Link className='flex flex-row items-center' to={`/tenants/${tenantId}/${link}`}>
        <div className="flex items-center gap-2">
          {icon}
          {!hideTitle && <span> {title}</span>}
        </div>
      </Link>
      <span 
        className='w-5 border-b-2 rounded-full absolute bottom-0' 
        style={{ borderColor: highlight ? "currentColor" : 'transparent' }} 
      />
    </div>
  );
};

export default MenuItem;