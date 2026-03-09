import { RouterProvider } from 'react-router';
import { router } from './routes';
import { BudgetProvider } from './context/budget-context';
import { AuthProvider } from './context/auth-context';

export default function App() {
  return (
    <AuthProvider>
      <BudgetProvider>
        <RouterProvider router={router} />
      </BudgetProvider>
    </AuthProvider>
  );
}