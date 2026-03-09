import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { Transaction, Budget, BankAccount, SavingsGoal } from '../context/budget-context';

export function generateFinancialReport(
  transactions: Transaction[],
  budgets: Budget[],
  bankAccounts: BankAccount[],
  savingsGoals: SavingsGoal[],
  userName: string
) {
  const doc = new jsPDF();
  const currentDate = new Date().toLocaleDateString();
  
  // Header
  doc.setFontSize(20);
  doc.text('Financial Report', 14, 20);
  doc.setFontSize(10);
  doc.text(`Generated: ${currentDate}`, 14, 28);
  doc.text(`User: ${userName}`, 14, 34);
  
  let yPosition = 45;

  // Bank Accounts Summary
  doc.setFontSize(14);
  doc.text('Bank Accounts', 14, yPosition);
  yPosition += 5;

  const accountsData = bankAccounts.map(account => [
    account.name,
    account.bank,
    account.type,
    `Rp ${account.balance.toLocaleString('id-ID')}`
  ]);

  autoTable(doc, {
    startY: yPosition,
    head: [['Account Name', 'Bank', 'Type', 'Balance']],
    body: accountsData,
    theme: 'grid',
    headStyles: { fillColor: [59, 130, 246] },
  });

  yPosition = (doc as any).lastAutoTable.finalY + 10;

  // Total Balance
  const totalBalance = bankAccounts.reduce((sum, acc) => sum + acc.balance, 0);
  doc.setFontSize(12);
  doc.text(`Total Balance: Rp ${totalBalance.toLocaleString('id-ID')}`, 14, yPosition);
  yPosition += 15;

  // Monthly Summary
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  const monthlyTransactions = transactions.filter(t => {
    const date = new Date(t.date);
    return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
  });

  const income = monthlyTransactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const expenses = monthlyTransactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  doc.setFontSize(14);
  doc.text('Monthly Summary', 14, yPosition);
  yPosition += 7;
  doc.setFontSize(11);
  doc.text(`Income: Rp ${income.toLocaleString('id-ID')}`, 14, yPosition);
  yPosition += 6;
  doc.text(`Expenses: Rp ${expenses.toLocaleString('id-ID')}`, 14, yPosition);
  yPosition += 6;
  doc.text(`Balance: Rp ${(income - expenses).toLocaleString('id-ID')}`, 14, yPosition);
  yPosition += 15;

  // Budget Progress
  doc.setFontSize(14);
  doc.text('Budget Progress', 14, yPosition);
  yPosition += 5;

  const budgetData = budgets.map(budget => {
    const spent = monthlyTransactions
      .filter(t => t.type === 'expense' && t.category === budget.category)
      .reduce((sum, t) => sum + t.amount, 0);
    const percentage = ((spent / budget.limit) * 100).toFixed(1);
    return [
      budget.category,
      `Rp ${budget.limit.toLocaleString('id-ID')}`,
      `Rp ${spent.toLocaleString('id-ID')}`,
      `${percentage}%`
    ];
  });

  autoTable(doc, {
    startY: yPosition,
    head: [['Category', 'Budget', 'Spent', 'Usage']],
    body: budgetData,
    theme: 'grid',
    headStyles: { fillColor: [59, 130, 246] },
  });

  yPosition = (doc as any).lastAutoTable.finalY + 10;

  // Add new page for transactions
  doc.addPage();
  yPosition = 20;

  // Recent Transactions
  doc.setFontSize(14);
  doc.text('Recent Transactions', 14, yPosition);
  yPosition += 5;

  const recentTransactions = transactions.slice(0, 20);
  const transactionsData = recentTransactions.map(t => [
    new Date(t.date).toLocaleDateString(),
    t.description,
    t.category,
    t.type === 'income' ? 'Income' : 'Expense',
    `Rp ${t.amount.toLocaleString('id-ID')}`
  ]);

  autoTable(doc, {
    startY: yPosition,
    head: [['Date', 'Description', 'Category', 'Type', 'Amount']],
    body: transactionsData,
    theme: 'grid',
    headStyles: { fillColor: [59, 130, 246] },
  });

  yPosition = (doc as any).lastAutoTable.finalY + 10;

  // Savings Goals (if space allows, otherwise add new page)
  if (yPosition > 250) {
    doc.addPage();
    yPosition = 20;
  }

  doc.setFontSize(14);
  doc.text('Savings Goals', 14, yPosition);
  yPosition += 5;

  const goalsData = savingsGoals.map(goal => {
    const percentage = ((goal.currentAmount / goal.targetAmount) * 100).toFixed(1);
    const remaining = goal.targetAmount - goal.currentAmount;
    const monthsToGoal = Math.ceil(remaining / goal.monthlyContribution);
    return [
      goal.name,
      `Rp ${goal.targetAmount.toLocaleString('id-ID')}`,
      `Rp ${goal.currentAmount.toLocaleString('id-ID')}`,
      `${percentage}%`,
      `${monthsToGoal} months`
    ];
  });

  autoTable(doc, {
    startY: yPosition,
    head: [['Goal', 'Target', 'Current', 'Progress', 'Time to Goal']],
    body: goalsData,
    theme: 'grid',
    headStyles: { fillColor: [59, 130, 246] },
  });

  // Save the PDF
  doc.save(`financial-report-${new Date().toISOString().split('T')[0]}.pdf`);
}
