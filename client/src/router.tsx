import { createBrowserRouter } from "react-router-dom";
import AccountSettings from "./pages/settings/accounts/AccountSettings";
import AccountsSettingsPage from "./pages/settings/accounts/AccountsSettingsPage";
import App from "./App";
import BudgetPage from "./pages/budget/BudgetPage";
import BudgetSettingsPage from "./pages/settings/budget/BudgetSettingsPage";
import CategorySettings from "./pages/settings/budget/CategorySettings";
import DashboardPage from "./pages/dashboard/DashboardPage";
import ErrorPage from "./pages/ErrorPage";
import RedirectToPage from "./pages/RedirectToPage";
import SettingsPage from "./pages/settings/SettingsPage";
import TenantsPage from "./pages/TenantsPage";
import TransactionsPage from "./pages/transactions/TransactionsPage";

const router = createBrowserRouter([
  {
    path: '/',
    element: <RedirectToPage to='/tenants' />,
    children: [
      {
        path: 'tenants',
        element: <TenantsPage />
      },
      {
        path: 'tenants/:tenantId',
        element: <App />,
        children: [
          {
            path: '/',
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