import { createBrowserRouter, Navigate } from 'react-router';
import { RootLayout } from './layouts/root-layout';
import { Dashboard } from './pages/dashboard';
import { Transactions } from './pages/transactions';
import { Budgets } from './pages/budgets';
import { BankAccounts } from './pages/bank-accounts';
import { SavingsGoals } from './pages/savings-goals';
import { Login } from './pages/login';

export const router = createBrowserRouter([
  {
    path: '/login',
    Component: Login,
  },
  {
    path: '/',
    Component: RootLayout,
    children: [
      { index: true, Component: Dashboard },
      { path: 'transactions', Component: Transactions },
      { path: 'budgets', Component: Budgets },
      { path: 'bank-accounts', Component: BankAccounts },
      { path: 'savings-goals', Component: SavingsGoals },
    ],
  },
]);