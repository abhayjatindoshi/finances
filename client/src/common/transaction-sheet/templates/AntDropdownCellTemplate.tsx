import { Cell, CellTemplate, Compatible, getCellProperty, getCharFromKey, isCharAlphaNumeric, isFunctionKey, keyCodes, Uncertain, UncertainCompatible } from "@silevis/reactgrid";
import { Select } from "antd";
import { BaseOptionType, SelectProps } from "antd/es/select";
import React from "react";

export interface AntDropdownCell extends Cell {
  type: string,
  text: string,
}

export class AntDropdownCellTemplate implements CellTemplate<AntDropdownCell> {

  constructor(
    private options: Array<BaseOptionType>,
    private selectProps?: Omit<SelectProps, 'options'>,
  ) { }

  getCompatibleCell(uncertainCell: Uncertain<AntDropdownCell>): Compatible<AntDropdownCell> {
    const text = getCellProperty(uncertainCell, 'text', 'string');
    return { ...uncertainCell, text, value: NaN };
  }

  handleKeyDown?(cell: Compatible<AntDropdownCell>, keyCode: number, ctrl: boolean, shift: boolean, alt: boolean, key: string, capsLock?: boolean): { cell: Compatible<AntDropdownCell>; enableEditMode: boolean; } {
    if (isFunctionKey(keyCode)) {
      if (keyCode === keyCodes.F2) return { cell, enableEditMode: true };
      return { cell, enableEditMode: false };
    }

    if (!ctrl && isCharAlphaNumeric(getCharFromKey(key)))
      return { cell: this.getCompatibleCell({ ...cell }), enableEditMode: true };
    return { cell, enableEditMode: keyCode === keyCodes.POINTER || keyCode === keyCodes.ENTER };
  }

  update(cell: Compatible<AntDropdownCell>, cellToMerge: UncertainCompatible<AntDropdownCell>): Compatible<AntDropdownCell> {
    return { ...cell, ...this.getCompatibleCell(cellToMerge) };
  }

  render(cell: Compatible<AntDropdownCell>, isInEditMode: boolean, onCellChanged: (cell: Compatible<AntDropdownCell>, commit: boolean) => void): React.ReactNode {
    if (!isInEditMode) {
      const displayValue = this.options.find(option => option.value === cell.text)?.label || '';
      return <div className="rg-ant-dropdown-cell-wrapper">{displayValue}</div>
    }

    const onSelect = (value: string) => {
      onCellChanged(this.getCompatibleCell({ ...cell, text: value }), true)
    }

    const onKeyDown = (e: React.KeyboardEvent) => {
      if (e.keyCode === keyCodes.DOWN_ARROW || e.keyCode === keyCodes.UP_ARROW) {
        e.stopPropagation();
      }
    }

    return <Select className="rg-ant-dropdown-editor-wrapper" showSearch size="small" optionFilterProp="label" autoFocus options={this.options} onSelect={onSelect} onKeyDown={onKeyDown} {...this.selectProps} />
  }

}