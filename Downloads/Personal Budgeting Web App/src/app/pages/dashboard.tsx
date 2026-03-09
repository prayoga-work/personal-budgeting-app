import { useMemo } from 'react';
import { useBudget } from '../context/budget-context';
import { useAuth } from '../context/auth-context';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import { TrendingUp, TrendingDown, Wallet, DollarSign, FileDown } from 'lucide-react';
import { Progress } from '../components/ui/progress';
import { Button } from '../components/ui/button';
import { generateFinancialReport } from '../utils/pdf-export';

export function Dashboard() {
  const { transactions, budgets, bankAccounts, savingsGoals } = useBudget();
  const { user } = useAuth();

  const handleExportPDF = () => {
    generateFinancialReport(
      transactions,
      budgets,
      bankAccounts,
      savingsGoals,
      user?.name || 'User'
    );
  };

  const stats = useMemo(() => {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();

    const monthlyTransactions = transactions.filter((t) => {
      const date = new Date(t.date);
      return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
    });

    const income = monthlyTransactions
      .filter((t) => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);

    const expenses = monthlyTransactions
      .filter((t) => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    const balance = income - expenses;

    const categorySpending = budgets.map((budget) => {
      const spent = monthlyTransactions
        .filter((t) => t.type === 'expense' && t.category === budget.category)
        .reduce((sum, t) => sum + t.amount, 0);

      return {
        ...budget,
        spent,
        remaining: budget.limit - spent,
        percentage: (spent / budget.limit) * 100,
      };
    });

    return { income, expenses, balance, categorySpending };
  }, [transactions, budgets]);

  const pieData = stats.categorySpending
    .filter((c) => c.spent > 0)
    .map((c) => ({
      name: c.category,
      value: c.spent,
      color: c.color,
    }));

  const barData = stats.categorySpending.map((c) => ({
    category: c.category,
    Spent: c.spent,
    Budget: c.limit,
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold text-slate-900">Dashboard</h1>
        <p className="text-slate-600 mt-1">Overview of your finances for March 2026</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Total Income</CardTitle>
            <TrendingUp className="w-4 h-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold text-slate-900">Rp {stats.income.toLocaleString('id-ID')}</div>
            <p className="text-xs text-slate-500 mt-1">This month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Total Expenses</CardTitle>
            <TrendingDown className="w-4 h-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold text-slate-900">Rp {stats.expenses.toLocaleString('id-ID')}</div>
            <p className="text-xs text-slate-500 mt-1">This month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Balance</CardTitle>
            <DollarSign className="w-4 h-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-semibold ${stats.balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              Rp {stats.balance.toLocaleString('id-ID')}
            </div>
            <p className="text-xs text-slate-500 mt-1">This month</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Spending by Category</CardTitle>
          </CardHeader>
          <CardContent>
            {pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => `Rp ${value.toLocaleString('id-ID')}`} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-slate-500">
                No expenses recorded yet
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Budget vs Actual</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={barData}>
                <XAxis dataKey="category" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip formatter={(value: number) => `Rp ${value.toLocaleString('id-ID')}`} />
                <Legend />
                <Bar dataKey="Budget" fill="#94a3b8" />
                <Bar dataKey="Spent" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Budget Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {stats.categorySpending.map((category) => (
              <div key={category.id}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: category.color }}
                    />
                    <span className="font-medium text-slate-900">{category.category}</span>
                  </div>
                  <div className="text-sm text-slate-600">
                    Rp {category.spent.toLocaleString('id-ID')} / Rp {category.limit.toLocaleString('id-ID')}
                  </div>
                </div>
                <Progress
                  value={Math.min(category.percentage, 100)}
                  className="h-2"
                  style={
                    {
                      '--progress-background': category.color,
                    } as React.CSSProperties
                  }
                />
                {category.percentage > 100 && (
                  <p className="text-xs text-red-600 mt-1">Over budget by Rp {(category.spent - category.limit).toLocaleString('id-ID')}</p>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button
          onClick={handleExportPDF}
          className="bg-blue-500 hover:bg-blue-600 text-white"
        >
          <FileDown className="w-4 h-4 mr-2" />
          Export PDF
        </Button>
      </div>
    </div>
  );
}