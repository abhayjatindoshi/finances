import React, { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

interface RedirectToPageProps {
  to: string;
}

const RedirectToPage: React.FC<RedirectToPageProps> = ({ to }) => {

  const navigate = useNavigate();
  const { tenantId } = useParams();

  useEffect(() => {
    navigate(`/tenants/${tenantId}/${to}`);
  });

  return (
    <></>
  );
};

export default RedirectToPage;