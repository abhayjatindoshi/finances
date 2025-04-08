import { tokens } from "@fluentui/react-components";
import { theme } from "antd";

export const antTheme = {
  algorithm: [theme.darkAlgorithm, theme.compactAlgorithm],
  cssVar: true,
  token: {
    fontSize: 20,
  },
  components: {
    Layout: {
      headerColor: "rgb(255,255,255, 0.88)"
    },
    Segmented: {
      trackBg: '#3d3d3d',
    }
  }
}

export const syncTimeout = 20 * 1000; // 20 seconds
export const antColors = ['blue', 'purple', 'cyan', 'green', 'magenta', 'pink', 'red', 'orange', 'yellow', 'volcano', 'geekblue', 'gold', 'lime'];
export const fluentColors = [
  tokens.colorBrandBackground, 
  tokens.colorPalettePurpleBackground2,
  tokens.colorPaletteTealBackground2,
  tokens.colorPaletteGreenBackground2,
  tokens.colorPaletteCranberryBackground2,
  tokens.colorPalettePinkBackground2,
  tokens.colorPaletteRedBackground2,
  tokens.colorPaletteDarkOrangeBackground2,
  tokens.colorPaletteYellowBackground2,
  tokens.colorPaletteDarkRedBackground2,
  tokens.colorPaletteCornflowerBackground2,
  tokens.colorPaletteGoldBackground2,
  tokens.colorPaletteSeafoamBackground2]


export const dateTimeFormat = Intl.DateTimeFormat('en-IN', { dateStyle: 'medium' });
export const moneyFormat = Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' });

export const loginUrl = '/api/v1/auth/login';
export const logoutUrl = '/api/v1/auth/logout';
export const profileApiUrl = '/api/v1/auth/me';
export const tenantsApiUrl = '/api/v1/tenants';