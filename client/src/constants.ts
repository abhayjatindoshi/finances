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

export const dateTimeFormat = Intl.DateTimeFormat('en-IN', { dateStyle: 'medium' });
export const moneyFormat = Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' });

export const loginUrl = '/api/v1/auth/login';
export const logoutUrl = '/api/v1/auth/logout';
export const profileApiUrl = '/api/v1/auth/me';
export const tenantsApiUrl = '/api/v1/tenants';