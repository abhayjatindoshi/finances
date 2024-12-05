import { createBrowserRouter } from "react-router-dom";
import DashboardPage from "./pages/dashboard/DashboardPage";
import App from "./App";
import ErrorPage from "./pages/ErrorPage";
import EnhancedRedirectToFirstAccountPage from "./pages/accounts/RedirectToFirstAccountPage";
import EnhancedAccountsPage from "./pages/accounts/AccountsPage";
import SettingsPage from "./pages/settings/SettingsPage";
import BudgetSettingsPage from "./pages/settings/budget/BudgetSettingsPage";
import AccountsSettingsPage from "./pages/settings/accounts/AccountsSettingsPage";
import EnhancedCategorySettings from "./pages/settings/budget/CategorySettings";
import HomePage from "./pages/HomePage";
import AccountSettings from "./pages/settings/accounts/AccountSettings";

const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      {
        path: '/',
        element: <HomePage />
      },
      {
        path: 'dashboard',
        element: <DashboardPage />,
      }, {
        path: 'accounts',
        element: <EnhancedRedirectToFirstAccountPage />,
      }, {
        path: 'accounts/:id',
        element: <EnhancedAccountsPage />,
      }, {
        path: 'settings',
        element: <SettingsPage />,
        children: [
          {
            path: 'accounts',
            element: <AccountsSettingsPage />,
            children: [
              {
                path: ':accountId',
                element: <AccountSettings />,
              }
            ]
          }, {
            path: 'budget',
            element: <BudgetSettingsPage />,
            children: [
              {
                path: ':categoryId',
                element: <EnhancedCategorySettings />
              }
            ]
          }
        ]
      }, {
        element: <ErrorPage />
      }

    ],
    errorElement: <ErrorPage />
  }
]);
export default router;