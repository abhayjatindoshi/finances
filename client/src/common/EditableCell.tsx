import moment from 'moment';
import React from 'react';

export enum CellType {
  string,
  number,
  options,
  date,
}

interface EditableCellProps {
  type: CellType;
  value: string | number | Date;
}

const EditableCell: React.FC<EditableCellProps> = ({ type, value }) => {

  const [edit, setEdit] = React.useState(false);

  function displayValue(): string {
    switch (type) {
      case CellType.string:
      case CellType.number:
      case CellType.options:
        return value as string;
      case CellType.date:
        return moment(value as number).fromNow();
    }
  }

  return (
    <div onClick={() => setEdit(!edit)}>
      {!edit && displayValue()}
    </div>
  );
};

export default EditableCell;