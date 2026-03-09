import { useMemo } from 'react';
import { useBudget } from '../context/budget-context';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { AddBudgetDialog } from '../components/add-budget-dialog';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Trash2 } from 'lucide-react';
import { Progress } from '../components/ui/progress';

export function Budgets() {
  const { budgets, deleteBudget, updateBudget, transactions } = useBudget();

  const budgetStats = useMemo(() => {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();

    return budgets.map((budget) => {
      const spent = transactions
        .filter((t) => {
          const date = new Date(t.date);
          return (
            t.type === 'expense' &&
            t.category === budget.category &&
            date.getMonth() === currentMonth &&
            date.getFullYear() === currentYear
          );
        })
        .reduce((sum, t) => sum + t.amount, 0);

      return {
        ...budget,
        spent,
        remaining: budget.limit - spent,
        percentage: (spent / budget.limit) * 100,
      };
    });
  }, [budgets, transactions]);

  const handleLimitChange = (id: string, newLimit: string) => {
    const limit = parseFloat(newLimit);
    if (!isNaN(limit) && limit > 0) {
      updateBudget(id, { limit });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-slate-900">Budget Categories</h1>
          <p className="text-slate-600 mt-1">Manage your monthly budget limits</p>
        </div>
        <AddBudgetDialog />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {budgetStats.length === 0 ? (
          <Card className="md:col-span-2">
            <CardContent className="py-12">
              <div className="text-center text-slate-500">
                No budget categories yet. Add your first budget to get started!
              </div>
            </CardContent>
          </Card>
        ) : (
          budgetStats.map((budget) => (
            <Card key={budget.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: budget.color }}
                    />
                    <CardTitle className="text-lg">{budget.category}</CardTitle>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => deleteBudget(budget.id)}
                  >
                    <Trash2 className="w-4 h-4 text-red-600" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2 text-sm">
                    <span className="text-slate-600">Spent</span>
                    <span className="font-medium text-slate-900">
                      Rp {budget.spent.toLocaleString('id-ID')} / Rp {budget.limit.toLocaleString('id-ID')}
                    </span>
                  </div>
                  <Progress
                    value={Math.min(budget.percentage, 100)}
                    className="h-2"
                    style={
                      {
                        '--progress-background': budget.color,
                      } as React.CSSProperties
                    }
                  />
                  {budget.percentage > 100 && (
                    <p className="text-xs text-red-600 mt-1">
                      Over budget by Rp {(budget.spent - budget.limit).toLocaleString('id-ID')}
                    </p>
                  )}
                  {budget.percentage <= 100 && (
                    <p className="text-xs text-slate-500 mt-1">
                      Rp {budget.remaining.toLocaleString('id-ID')} remaining ({(100 - budget.percentage).toFixed(0)}%)
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">
                    Monthly Budget Limit (IDR)
                  </label>
                  <div className="flex gap-2">
                    <Input
                      type="number"
                      step="1"
                      defaultValue={budget.limit}
                      onBlur={(e) => handleLimitChange(budget.id, e.target.value)}
                      className="flex-1"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}