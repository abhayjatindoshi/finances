import React, { useEffect, useRef } from 'react';

interface SelectAllHeaderProps {
  api: {
    getSelectedNodes: () => Array<{ id: string }>;
    getDisplayedRowCount: () => number;
    selectAll: () => void;
    deselectAll: () => void;
  };
}

const SelectAllHeader: React.FC<SelectAllHeaderProps> = (props) => {
  const checkboxRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const selectedCount = props.api.getSelectedNodes().length;
    const totalCount = props.api.getDisplayedRowCount();
    if (checkboxRef.current) {
      checkboxRef.current.checked = selectedCount > 0 && selectedCount === totalCount;
      checkboxRef.current.indeterminate = selectedCount > 0 && selectedCount < totalCount;
    }
  });

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      props.api.selectAll();
    } else {
      props.api.deselectAll();
    }
  };

  return (
    <input
      type="checkbox"
      ref={checkboxRef}
      onChange={onChange}
      style={{ cursor: 'pointer' }}
      aria-label="Select all"
    />
  );
};

export default SelectAllHeader; 