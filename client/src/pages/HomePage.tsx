import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';


const HomePage: React.FC = () => {

  const navigate = useNavigate();

  useEffect(() => {
    navigate(`/dashboard`)
  });

  return (
    <></>
  );
};

export default HomePage;