import { createBrowserRouter } from "react-router-dom";
import AccountSettings from "./pages/settings/accounts/AccountSettings";
import AccountsPage from "./pages/accounts/AccountsPage";
import AccountsSettingsPage from "./pages/settings/accounts/AccountsSettingsPage";
import App from "./App";
import BudgetPage from "./pages/budget/BudgetPage";
import BudgetSettingsPage from "./pages/settings/budget/BudgetSettingsPage";
import CategorySettings from "./pages/settings/budget/CategorySettings";
import DashboardPage from "./pages/dashboard/DashboardPage";
import ErrorPage from "./pages/ErrorPage";
import HomePage from "./pages/HomePage";
import RedirectToFirstAccountPage from "./pages/accounts/RedirectToFirstAccountPage";
import SettingsPage from "./pages/settings/SettingsPage";
import TransactionsPage from "./pages/transactions/TransactionsPage";
import RedirectToAllTransactionsPage from "./pages/transactions/RedirectToAllTransactionsPage";
import TenantsPage from "./pages/TenantsPage";

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
        element: <RedirectToFirstAccountPage />,
      }, {
        path: 'accounts/:id',
        element: <AccountsPage />,
      }, {
        path: 'budget',
        element: <BudgetPage />,
      }, {
        path: 'budget/:tab',
        element: <BudgetPage />,
      }, {
        path: 'transactions',
        element: <RedirectToAllTransactionsPage />
      }, {
        path: 'transactions/:accountId',
        element: <TransactionsPage />
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

    ],
    errorElement: <ErrorPage />
  },
  {
    path: 'tenants',
    element: <TenantsPage />
  },
]);
export default router;