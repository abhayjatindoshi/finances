import { createBrowserRouter } from "react-router-dom";
import AppLayout from "./common/AppLayout";
import App from "./pages/App";
import BudgetPage from "./pages/budget/BudgetPage";
import DashboardPage from "./pages/dashboard/DashboardPage";
import ErrorPage from "./pages/ErrorPage";
import RedirectToPage from "./pages/RedirectToPage";
import AccountSettings from "./pages/settings/accounts/AccountSettings";
import AccountsSettingsPage from "./pages/settings/accounts/AccountsSettingsPage";
import BudgetSettingsPage from "./pages/settings/budget/BudgetSettingsPage";
import CategorySettings from "./pages/settings/budget/CategorySettings";
import SettingsPage from "./pages/settings/SettingsPage";
import TenantSettings from "./pages/settings/tenant/TenantSettings";
import TransactionsPage from "./pages/transactions/TransactionsPage";

const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
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
                    element: <CategorySettings />
                  }
                ]
              }, {
                path: 'tenant',
                element: <TenantSettings />,
              }
            ]
          }, {
            element: <ErrorPage />
          }
        ]
      },
    ],
    errorElement: <ErrorPage />
  }
]);
export default router;