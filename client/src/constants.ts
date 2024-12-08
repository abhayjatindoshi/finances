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
export const loginUrl = '/api/v1/auth/login';
export const logoutUrl = '/api/v1/auth/logout';
export const profileApiUrl = '/api/v1/auth/me';