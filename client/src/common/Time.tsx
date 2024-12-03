import moment from 'moment';
import React from 'react';

interface TimeProps {
  time: Date
}

const Time: React.FC<TimeProps> = ({ time }: TimeProps) => {

  return (
    <>{moment(time).format('DD-MMM-YYYY')}</>
  );
};

export default Time;