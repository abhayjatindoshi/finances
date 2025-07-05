import { Dialog, DialogActions, DialogBody, DialogContent, DialogSurface, FluentProvider, Menu, MenuItem, MenuList, MenuPopover, MenuTrigger } from '@fluentui/react-components';
import React from 'react';

// Create a separate theme for dropdowns that matches dialog theme
export const dropdownTheme = {
  colorNeutralBackground1: '#121212',
  colorNeutralBackground2: '#1a1a1a',
};

// Export all dialog components
export { Dialog, DialogActions, DialogBody, DialogContent, DialogSurface };

// Export all dropdown components
  export { Menu, MenuItem, MenuList, MenuPopover, MenuTrigger };

// Helper function to wrap a dialog with the dialog theme
export const withDialogTheme = (dialogElement: React.ReactElement) => {
  return (
    <FluentProvider theme={dropdownTheme}>
      {dialogElement}
    </FluentProvider>
  );
};

// Helper function to wrap dropdown components with the dropdown theme
export const withDropdownTheme = (dropdownElement: React.ReactElement) => {
  return (
    <FluentProvider theme={dropdownTheme}>
      {dropdownElement}
    </FluentProvider>
  );
}; 