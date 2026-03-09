import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type Transaction = {
  id: string;
  description: string;
  amount: number;
  category: string;
  type: 'income' | 'expense';
  date: string;
  color?: string;
  label?: string;
  bankAccountId?: string;
};

export type Budget = {
  id: string;
  category: string;
  limit: number;
  color: string;
};

export type BankAccount = {
  id: string;
  name: string;
  bank: string;
  balance: number;
  color: string;
  type: 'main' | 'savings' | 'investment' | 'emergency';
};

export type SavingsGoal = {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  monthlyContribution: number;
  deadline?: string;
  color: string;
  bankAccountId?: string;
};

type BudgetContextType = {
  transactions: Transaction[];
  budgets: Budget[];
  bankAccounts: BankAccount[];
  savingsGoals: SavingsGoal[];
  addTransaction: (transaction: Omit<Transaction, 'id'>) => void;
  deleteTransaction: (id: string) => void;
  addBudget: (budget: Omit<Budget, 'id'>) => void;
  deleteBudget: (id: string) => void;
  updateBudget: (id: string, budget: Partial<Budget>) => void;
  addBankAccount: (account: Omit<BankAccount, 'id'>) => void;
  deleteBankAccount: (id: string) => void;
  updateBankAccount: (id: string, account: Partial<BankAccount>) => void;
  addSavingsGoal: (goal: Omit<SavingsGoal, 'id'>) => void;
  deleteSavingsGoal: (id: string) => void;
  updateSavingsGoal: (id: string, goal: Partial<SavingsGoal>) => void;
  transferBetweenAccounts: (fromId: string, toId: string, amount: number) => void;
};

const BudgetContext = createContext<BudgetContextType | undefined>(undefined);

const DEFAULT_BUDGETS: Budget[] = [
  { id: '1', category: 'Housing', limit: 20000000, color: '#3b82f6' },
  { id: '2', category: 'Food', limit: 9000000, color: '#10b981' },
  { id: '3', category: 'Transportation', limit: 4500000, color: '#f59e0b' },
  { id: '4', category: 'Entertainment', limit: 3000000, color: '#8b5cf6' },
  { id: '5', category: 'Utilities', limit: 2250000, color: '#ef4444' },
];

const DEFAULT_TRANSACTIONS: Transaction[] = [
  { id: '1', description: 'Salary', amount: 75000000, category: 'Income', type: 'income', date: '2026-03-01', color: '#10b981', label: 'Monthly Income' },
  { id: '2', description: 'Rent Payment', amount: 18000000, category: 'Housing', type: 'expense', date: '2026-03-01', color: '#3b82f6', label: 'Fixed Cost' },
  { id: '3', description: 'Grocery Shopping', amount: 1800000, category: 'Food', type: 'expense', date: '2026-03-03', color: '#10b981', label: 'Weekly Groceries' },
  { id: '4', description: 'Gas', amount: 675000, category: 'Transportation', type: 'expense', date: '2026-03-04', color: '#f59e0b', label: 'Fuel' },
  { id: '5', description: 'Netflix', amount: 225000, category: 'Entertainment', type: 'expense', date: '2026-03-05', color: '#8b5cf6', label: 'Subscription' },
  { id: '6', description: 'Electricity Bill', amount: 1275000, category: 'Utilities', type: 'expense', date: '2026-03-05', color: '#ef4444', label: 'Monthly Bill' },
  { id: '7', description: 'Restaurant', amount: 900000, category: 'Food', type: 'expense', date: '2026-03-06', color: '#10b981', label: 'Dining Out' },
  { id: '8', description: 'Movie Tickets', amount: 450000, category: 'Entertainment', type: 'expense', date: '2026-03-07', color: '#8b5cf6', label: 'Entertainment' },
  { id: '9', description: 'Freelance Work', amount: 12000000, category: 'Income', type: 'income', date: '2026-03-08', color: '#10b981', label: 'Side Income' },
];

const DEFAULT_BANK_ACCOUNTS: BankAccount[] = [
  { id: '1', name: 'Main Account', bank: 'Bank BCA', balance: 50000000, color: '#3b82f6', type: 'main' },
  { id: '2', name: 'Savings Account', bank: 'Bank Mandiri', balance: 10000000, color: '#10b981', type: 'savings' },
  { id: '3', name: 'Investment Account', bank: 'Bank BRI', balance: 20000000, color: '#f59e0b', type: 'investment' },
  { id: '4', name: 'Emergency Fund', bank: 'Bank BNI', balance: 5000000, color: '#ef4444', type: 'emergency' },
];

const DEFAULT_SAVINGS_GOALS: SavingsGoal[] = [
  { id: '1', name: 'Car Purchase', targetAmount: 30000000, currentAmount: 5000000, monthlyContribution: 500000, deadline: '2026-12-31', color: '#3b82f6', bankAccountId: '1' },
  { id: '2', name: 'Vacation Fund', targetAmount: 10000000, currentAmount: 2000000, monthlyContribution: 200000, deadline: '2026-06-30', color: '#10b981', bankAccountId: '2' },
  { id: '3', name: 'Retirement Savings', targetAmount: 50000000, currentAmount: 10000000, monthlyContribution: 500000, deadline: '2036-12-31', color: '#f59e0b', bankAccountId: '3' },
  { id: '4', name: 'Emergency Fund', targetAmount: 10000000, currentAmount: 5000000, monthlyContribution: 100000, deadline: '2026-12-31', color: '#ef4444', bankAccountId: '4' },
];

export function BudgetProvider({ children }: { children: ReactNode }) {
  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem('budget_transactions');
    return saved ? JSON.parse(saved) : DEFAULT_TRANSACTIONS;
  });

  const [budgets, setBudgets] = useState<Budget[]>(() => {
    const saved = localStorage.getItem('budget_budgets');
    return saved ? JSON.parse(saved) : DEFAULT_BUDGETS;
  });

  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>(() => {
    const saved = localStorage.getItem('budget_bankAccounts');
    return saved ? JSON.parse(saved) : DEFAULT_BANK_ACCOUNTS;
  });

  const [savingsGoals, setSavingsGoals] = useState<SavingsGoal[]>(() => {
    const saved = localStorage.getItem('budget_savingsGoals');
    return saved ? JSON.parse(saved) : DEFAULT_SAVINGS_GOALS;
  });

  useEffect(() => {
    localStorage.setItem('budget_transactions', JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem('budget_budgets', JSON.stringify(budgets));
  }, [budgets]);

  useEffect(() => {
    localStorage.setItem('budget_bankAccounts', JSON.stringify(bankAccounts));
  }, [bankAccounts]);

  useEffect(() => {
    localStorage.setItem('budget_savingsGoals', JSON.stringify(savingsGoals));
  }, [savingsGoals]);

  const addTransaction = (transaction: Omit<Transaction, 'id'>) => {
    const newTransaction = {
      ...transaction,
      id: Date.now().toString(),
    };
    setTransactions([newTransaction, ...transactions]);
  };

  const deleteTransaction = (id: string) => {
    setTransactions(transactions.filter((t) => t.id !== id));
  };

  const addBudget = (budget: Omit<Budget, 'id'>) => {
    const newBudget = {
      ...budget,
      id: Date.now().toString(),
    };
    setBudgets([...budgets, newBudget]);
  };

  const deleteBudget = (id: string) => {
    setBudgets(budgets.filter((b) => b.id !== id));
  };

  const updateBudget = (id: string, updates: Partial<Budget>) => {
    setBudgets(budgets.map((b) => (b.id === id ? { ...b, ...updates } : b)));
  };

  const addBankAccount = (account: Omit<BankAccount, 'id'>) => {
    const newAccount = {
      ...account,
      id: Date.now().toString(),
    };
    setBankAccounts([...bankAccounts, newAccount]);
  };

  const deleteBankAccount = (id: string) => {
    setBankAccounts(bankAccounts.filter((a) => a.id !== id));
  };

  const updateBankAccount = (id: string, account: Partial<BankAccount>) => {
    setBankAccounts(bankAccounts.map((a) => (a.id === id ? { ...a, ...account } : a)));
  };

  const addSavingsGoal = (goal: Omit<SavingsGoal, 'id'>) => {
    const newGoal = {
      ...goal,
      id: Date.now().toString(),
    };
    setSavingsGoals([...savingsGoals, newGoal]);
  };

  const deleteSavingsGoal = (id: string) => {
    setSavingsGoals(savingsGoals.filter((g) => g.id !== id));
  };

  const updateSavingsGoal = (id: string, goal: Partial<SavingsGoal>) => {
    setSavingsGoals(savingsGoals.map((g) => (g.id === id ? { ...g, ...goal } : g)));
  };

  const transferBetweenAccounts = (fromId: string, toId: string, amount: number) => {
    setBankAccounts(bankAccounts.map((a) => {
      if (a.id === fromId) {
        return { ...a, balance: a.balance - amount };
      }
      if (a.id === toId) {
        return { ...a, balance: a.balance + amount };
      }
      return a;
    }));
  };

  return (
    <BudgetContext.Provider
      value={{
        transactions,
        budgets,
        bankAccounts,
        savingsGoals,
        addTransaction,
        deleteTransaction,
        addBudget,
        deleteBudget,
        updateBudget,
        addBankAccount,
        deleteBankAccount,
        updateBankAccount,
        addSavingsGoal,
        deleteSavingsGoal,
        updateSavingsGoal,
        transferBetweenAccounts,
      }}
    >
      {children}
    </BudgetContext.Provider>
  );
}

export function useBudget() {
  const context = useContext(BudgetContext);
  if (!context) {
    throw new Error('useBudget must be used within a BudgetProvider');
  }
  return context;
}