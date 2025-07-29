import { createBrowserRouter } from "react-router-dom";
import AppLayout from "./common/AppLayout";
import App from "./pages/App";
import BudgetDashboardPage from "./pages/budget/BudgetDashboardPage";
import DashboardPage from "./pages/dashboard/DashboardPage";
import ErrorPage from "./pages/ErrorPage";
import RedirectToPage from "./pages/RedirectToPage";
import DataAccountsSettingsPage from "./pages/settings/data/DataAccountsSettingsPage";
import DataBudgetSettingsPage from "./pages/settings/data/DataBudgetSettingsPage";
import DataClassificationSettingsPage from "./pages/settings/data/DataClassificationSettingsPage";
import HouseholdSettingsPage from "./pages/settings/household/HouseholdSettingsPage";
import SettingsPage from "./pages/settings/SettingsPage";
import TenantsPage from "./pages/TenantsPage";
import ImportTransactionsPage from "./pages/transactions/import/ImportTransactionsPage";
import TransactionsPage from "./pages/transactions/TransactionsPage";

// Detect if we're running under /new prefix
const basename = process.env.PUBLIC_URL || '';

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
          }, 
          {
            path: 'transactions',
            element: <RedirectToPage to='transactions/all' />,
          }, 
          {
            path: 'transactions/all',
            element: <TransactionsPage />
          },
          {
            path: 'transactions/:accountId',
            element: <TransactionsPage />
          },
          {
            path: 'import',
            element: <ImportTransactionsPage />
          },
          {
            path: 'budget',
            element: <BudgetDashboardPage />,
          },
          {
            path: 'budget/:tab',
            element: <BudgetDashboardPage />
          },
          {
            path: 'settings',
            element: <SettingsPage />,
          }, 
          {
            path: 'settings/household',
            element: <HouseholdSettingsPage />,
          },
          {
            path: 'settings/data/accounts',
            element: <DataAccountsSettingsPage />,
          },
          {
            path: 'settings/data/budget',
            element: <DataBudgetSettingsPage />,
          },
          {
            path: 'settings/data/classification',
            element: <DataClassificationSettingsPage />,
          },
          {
            element: <ErrorPage />
          }
        ]
      },
    ],
    errorElement: <ErrorPage />
  }
], {
  basename: basename
});
export default router;