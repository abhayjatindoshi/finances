import { createBrowserRouter } from "react-router-dom";
import DashboardPage from "./pages/dashboard/DashboardPage";
import App from "./App";
import ErrorPage from "./pages/ErrorPage";
import EnhancedTestPage from "./pages/TestPage";
import EnhancedRedirectToFirstAccountPage from "./pages/accounts/RedirectToFirstAccountPage";
import EnhancedAccountsPage from "./pages/accounts/AccountsPage";
import ImportPage from "./pages/ImportPage";
import SettingsPage from "./pages/settings/SettingsPage";
import BudgetSettingsPage from "./pages/settings/budget/BudgetSettingsPage";
import AccountSettingsPage from "./pages/settings/account/AccountSettingsPage";
import EnhancedCategorySettings from "./pages/settings/budget/CategorySettings";

const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      {
        path: '',
        element: <DashboardPage />,
      }, {
        path: 'accounts',
        element: <EnhancedRedirectToFirstAccountPage />,
      }, {
        path: 'accounts/:id',
        element: <EnhancedAccountsPage />,
      }, {
        path: 'import',
        element: <ImportPage />
      }, {
        path: 'settings',
        element: <SettingsPage />,
        children: [
          {
            path: 'account',
            element: <AccountSettingsPage />
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
        path: 'test',
        element: <EnhancedTestPage />
      }
    ],
    errorElement: <ErrorPage />
  }
]);
export default router;