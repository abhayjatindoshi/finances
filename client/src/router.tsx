import { createBrowserRouter } from "react-router-dom";
import AppLayout from "./common/AppLayout";
import App from "./pages/App";
import BudgetPage from "./pages/BudgetPage";
import DashboardPage from "./pages/dashboard/DashboardPage";
import ErrorPage from "./pages/ErrorPage";
import RedirectToPage from "./pages/RedirectToPage";
import AccountsSettingsPage from "./pages/settings/AccountsSettingsPage";
import SettingsPage from "./pages/settings/SettingsPage";
import TenantsPage from "./pages/TenantsPage";
import TransactionsPage from "./pages/transactions/TransactionsPage";

const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      {
        path: 'tenants',
        element: <TenantsPage />
      },
      {
        path: 'tenants/:tenantId',
        element: <AppLayout />,
        children: [
          {
            path: '',
            element: <RedirectToPage to="dashboard" />
          },
          {
            path: 'dashboard',
            element: <DashboardPage />,
          }, {
            path: 'transactions',
            element: <RedirectToPage to='transactions/all' />,
          }, {
            path: 'transactions/:accountId',
            element: <TransactionsPage />
          }, {
            path: 'budget',
            element: <BudgetPage />,
          }, {
            path: 'budget/:tab',
            element: <BudgetPage />,
          }, {
            path: 'settings',
            element: <SettingsPage />,
          }, {
            path: 'settings/accounts',
            element: <AccountsSettingsPage />,
          },
          {
            element: <ErrorPage />
          }
        ]
      },
    ],
    errorElement: <ErrorPage />
  }
]);
export default router;