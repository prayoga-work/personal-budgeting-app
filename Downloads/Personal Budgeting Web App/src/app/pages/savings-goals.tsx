import { useState, useMemo } from 'react';
import { useBudget } from '../context/budget-context';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { Progress } from '../components/ui/progress';
import { Plus, Trash2, Target, Calendar, TrendingUp } from 'lucide-react';

const COLORS = [
  '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444',
  '#06b6d4', '#ec4899', '#14b8a6', '#f97316', '#6366f1',
];

export function SavingsGoals() {
  const { savingsGoals, addSavingsGoal, deleteSavingsGoal, updateSavingsGoal, bankAccounts } = useBudget();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    targetAmount: '',
    currentAmount: '',
    monthlyContribution: '',
    deadline: '',
    color: COLORS[0],
    bankAccountId: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.targetAmount || !formData.monthlyContribution) return;

    addSavingsGoal({
      name: formData.name,
      targetAmount: parseFloat(formData.targetAmount),
      currentAmount: parseFloat(formData.currentAmount) || 0,
      monthlyContribution: parseFloat(formData.monthlyContribution),
      deadline: formData.deadline || undefined,
      color: formData.color,
      bankAccountId: formData.bankAccountId || undefined,
    });

    setFormData({
      name: '',
      targetAmount: '',
      currentAmount: '',
      monthlyContribution: '',
      deadline: '',
      color: COLORS[0],
      bankAccountId: '',
    });
    setDialogOpen(false);
  };

  const calculateTimeToGoal = (goal: typeof savingsGoals[0]) => {
    const remaining = goal.targetAmount - goal.currentAmount;
    if (remaining <= 0) return { months: 0, completed: true };
    
    const months = Math.ceil(remaining / goal.monthlyContribution);
    
    if (goal.deadline) {
      const deadlineDate = new Date(goal.deadline);
      const today = new Date();
      const monthsUntilDeadline = Math.ceil((deadlineDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24 * 30));
      
      return {
        months,
        monthsUntilDeadline,
        canMeetDeadline: months <= monthsUntilDeadline,
        completed: false,
      };
    }
    
    return { months, completed: false };
  };

  const totalSaved = savingsGoals.reduce((sum, goal) => sum + goal.currentAmount, 0);
  const totalTarget = savingsGoals.reduce((sum, goal) => sum + goal.targetAmount, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-slate-900">Savings Goals</h1>
          <p className="text-slate-600 mt-1">Track your savings goals and progress</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add Goal
            </Button>
          </DialogTrigger>
          <DialogContent className="max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add New Savings Goal</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Goal Name</Label>
                <Input
                  id="name"
                  placeholder="e.g., New Car, Vacation, Emergency Fund"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="targetAmount">Target Amount (IDR)</Label>
                <Input
                  id="targetAmount"
                  type="number"
                  step="1"
                  placeholder="0"
                  value={formData.targetAmount}
                  onChange={(e) => setFormData({ ...formData, targetAmount: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="currentAmount">Current Amount (IDR)</Label>
                <Input
                  id="currentAmount"
                  type="number"
                  step="1"
                  placeholder="0"
                  value={formData.currentAmount}
                  onChange={(e) => setFormData({ ...formData, currentAmount: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="monthlyContribution">Monthly Contribution (IDR)</Label>
                <Input
                  id="monthlyContribution"
                  type="number"
                  step="1"
                  placeholder="0"
                  value={formData.monthlyContribution}
                  onChange={(e) => setFormData({ ...formData, monthlyContribution: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="deadline">Target Date (Optional)</Label>
                <Input
                  id="deadline"
                  type="date"
                  value={formData.deadline}
                  onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="bankAccount">Linked Bank Account (Optional)</Label>
                <Select value={formData.bankAccountId} onValueChange={(value) => setFormData({ ...formData, bankAccountId: value })}>
                  <SelectTrigger id="bankAccount">
                    <SelectValue placeholder="Select account" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">None</SelectItem>
                    {bankAccounts.map((account) => (
                      <SelectItem key={account.id} value={account.id}>
                        {account.name} - {account.bank}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Color</Label>
                <div className="flex gap-2 flex-wrap">
                  {COLORS.map((color) => (
                    <button
                      key={color}
                      type="button"
                      className={`w-8 h-8 rounded-full transition-transform hover:scale-110 ${
                        formData.color === color ? 'ring-2 ring-offset-2 ring-slate-400' : ''
                      }`}
                      style={{ backgroundColor: color }}
                      onClick={() => setFormData({ ...formData, color })}
                    />
                  ))}
                </div>
              </div>

              <div className="flex gap-2 justify-end pt-4">
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">Add Goal</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Total Saved</CardTitle>
            <Target className="w-4 h-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold text-slate-900">Rp {totalSaved.toLocaleString('id-ID')}</div>
            <p className="text-xs text-slate-500 mt-1">Across all goals</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Total Target</CardTitle>
            <TrendingUp className="w-4 h-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold text-slate-900">Rp {totalTarget.toLocaleString('id-ID')}</div>
            <p className="text-xs text-slate-500 mt-1">Combined goals</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Progress</CardTitle>
            <Calendar className="w-4 h-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold text-slate-900">
              {totalTarget > 0 ? ((totalSaved / totalTarget) * 100).toFixed(1) : 0}%
            </div>
            <p className="text-xs text-slate-500 mt-1">Overall completion</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {savingsGoals.length === 0 ? (
          <Card>
            <CardContent className="py-12">
              <div className="text-center text-slate-500">
                No savings goals yet. Add your first goal to start tracking your progress!
              </div>
            </CardContent>
          </Card>
        ) : (
          savingsGoals.map((goal) => {
            const percentage = (goal.currentAmount / goal.targetAmount) * 100;
            const timeCalc = calculateTimeToGoal(goal);
            const linkedAccount = goal.bankAccountId ? bankAccounts.find(a => a.id === goal.bankAccountId) : null;

            return (
              <Card key={goal.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-12 h-12 rounded-full flex items-center justify-center"
                        style={{ backgroundColor: goal.color }}
                      >
                        <Target className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{goal.name}</CardTitle>
                        {linkedAccount && (
                          <p className="text-sm text-slate-500">{linkedAccount.name} - {linkedAccount.bank}</p>
                        )}
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteSavingsGoal(goal.id)}
                    >
                      <Trash2 className="w-4 h-4 text-red-600" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex items-center justify-between mb-2 text-sm">
                        <span className="text-slate-600">Progress</span>
                        <span className="font-medium text-slate-900">
                          Rp {goal.currentAmount.toLocaleString('id-ID')} / Rp {goal.targetAmount.toLocaleString('id-ID')}
                        </span>
                      </div>
                      <Progress
                        value={Math.min(percentage, 100)}
                        className="h-2"
                        style={{
                          '--progress-background': goal.color,
                        } as React.CSSProperties}
                      />
                      <p className="text-xs text-slate-500 mt-1">
                        {percentage.toFixed(1)}% complete
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-4 pt-2">
                      <div className="space-y-1">
                        <p className="text-xs text-slate-600">Monthly Contribution</p>
                        <p className="text-sm font-medium text-slate-900">
                          Rp {goal.monthlyContribution.toLocaleString('id-ID')}
                        </p>
                      </div>
                      
                      <div className="space-y-1">
                        <p className="text-xs text-slate-600">Time to Goal</p>
                        <p className="text-sm font-medium text-slate-900">
                          {timeCalc.completed ? (
                            <span className="text-green-600">Completed! 🎉</span>
                          ) : (
                            <span>{timeCalc.months} months</span>
                          )}
                        </p>
                      </div>

                      {goal.deadline && (
                        <>
                          <div className="space-y-1">
                            <p className="text-xs text-slate-600">Target Date</p>
                            <p className="text-sm font-medium text-slate-900">
                              {new Date(goal.deadline).toLocaleDateString()}
                            </p>
                          </div>

                          {!timeCalc.completed && timeCalc.monthsUntilDeadline !== undefined && (
                            <div className="space-y-1">
                              <p className="text-xs text-slate-600">Status</p>
                              <p className={`text-sm font-medium ${timeCalc.canMeetDeadline ? 'text-green-600' : 'text-red-600'}`}>
                                {timeCalc.canMeetDeadline ? '✓ On Track' : '✗ Behind Schedule'}
                              </p>
                            </div>
                          )}
                        </>
                      )}
                    </div>

                    {!timeCalc.completed && goal.deadline && !timeCalc.canMeetDeadline && (
                      <div className="bg-red-50 text-red-800 text-xs p-3 rounded-md">
                        <p className="font-medium">Behind Schedule</p>
                        <p className="mt-1">
                          Need Rp {Math.ceil((goal.targetAmount - goal.currentAmount) / (timeCalc.monthsUntilDeadline || 1)).toLocaleString('id-ID')}/month to meet deadline
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}
