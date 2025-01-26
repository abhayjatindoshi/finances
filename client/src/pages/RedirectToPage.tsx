import React, { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

interface RedirectToPageProps {
  to: string;
}

const RedirectToPage: React.FC<RedirectToPageProps> = ({ to }) => {

  const navigate = useNavigate();
  const { tenantId } = useParams();
  let url = to.charAt(0) === '/' ? to.substring(1) : to;
  url = `/tenants/${tenantId}/${to}`;
  
  useEffect(() => {
    navigate(url);
  }, [navigate, url]);

  return (
    <></>
  );
};

export default RedirectToPage;