import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { ExpenseService } from '../../core/services/expense.service';
import { AuthService } from '../../core/services/auth.service';
import { Expense, CATEGORY_COLORS } from '../../shared/models/expense.model';
import { ChartData, ChartOptions } from 'chart.js';

@Component({
  selector: 'app-dashboard',
  standalone: false,
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  expenses: Expense[] = [];
  recentExpenses: Expense[] = [];
  loading = true;
  user: any;

  totalThisMonth = 0;
  totalLastMonth = 0;
  totalExpenses = 0;
  avgExpense = 0;
  topCategory = '';

  doughnutChartData: ChartData<'doughnut'> = {
    labels: [],
    datasets: [{ data: [], backgroundColor: [], borderWidth: 0 }]
  };

  barChartData: ChartData<'bar'> = {
    labels: [],
    datasets: [{ data: [], backgroundColor: 'rgba(124,106,247,0.6)', borderColor: '#7c6af7', borderWidth: 2, borderRadius: 8 }]
  };

  doughnutOptions: ChartOptions<'doughnut'> = {
    responsive: true,
    plugins: {
      legend: { position: 'bottom', labels: { color: '#94a3b8', font: { size: 12 }, padding: 16, usePointStyle: true } }
    },
    cutout: '70%'
  };

  barOptions: ChartOptions<'bar'> = {
    responsive: true,
    plugins: {
      legend: { display: false }
    },
    scales: {
      x: { ticks: { color: '#64748b' }, grid: { color: 'rgba(255,255,255,0.04)' } },
      y: { ticks: { color: '#64748b', callback: (v) => '₹' + v }, grid: { color: 'rgba(255,255,255,0.06)' } }
    }
  };

  constructor(private expenseService: ExpenseService, private auth: AuthService, private cdr: ChangeDetectorRef) {
    this.user = this.auth.getCurrentUser();
  }

  ngOnInit(): void {
    this.loadExpenses();
  }

  loadExpenses() {
    this.expenseService.getExpenses().subscribe({
      next: (data) => {
        this.expenses = data;
        this.recentExpenses = [...data].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 5);
        this.computeStats();
        this.buildCharts();
        this.loading = false;
        this.cdr.detectChanges(); // Force UI update
      },
      error: () => {
        this.loading = false;
        this.cdr.detectChanges(); // Force UI update
      }
    });
  }

  computeStats() {
    const now = new Date();
    const thisMonth = now.getMonth();
    const thisYear  = now.getFullYear();

    const thisMonthExp = this.expenses.filter(e => {
      const d = new Date(e.date);
      return d.getMonth() === thisMonth && d.getFullYear() === thisYear;
    });

    const lastMonth = thisMonth === 0 ? 11 : thisMonth - 1;
    const lastYear  = thisMonth === 0 ? thisYear - 1 : thisYear;
    const lastMonthExp = this.expenses.filter(e => {
      const d = new Date(e.date);
      return d.getMonth() === lastMonth && d.getFullYear() === lastYear;
    });

    this.totalThisMonth = thisMonthExp.reduce((s, e) => s + e.amount, 0);
    this.totalLastMonth = lastMonthExp.reduce((s, e) => s + e.amount, 0);
    this.totalExpenses  = this.expenses.reduce((s, e) => s + e.amount, 0);
    this.avgExpense     = this.expenses.length ? this.totalExpenses / this.expenses.length : 0;

    const catMap: { [k: string]: number } = {};
    this.expenses.forEach(e => catMap[e.category] = (catMap[e.category] || 0) + e.amount);
    const sorted = Object.entries(catMap).sort((a, b) => b[1] - a[1]);
    this.topCategory = sorted[0]?.[0] || '—';
  }

  buildCharts() {
    const catMap: { [k: string]: number } = {};
    this.expenses.forEach(e => catMap[e.category] = (catMap[e.category] || 0) + e.amount);
    const labels = Object.keys(catMap);
    const values = Object.values(catMap);
    const colors = labels.map(l => CATEGORY_COLORS[l] || '#7c6af7');

    this.doughnutChartData = {
      labels,
      datasets: [{ data: values, backgroundColor: colors, borderWidth: 0 }]
    };

    const months: string[] = [];
    const monthlyTotals: number[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const label = d.toLocaleString('default', { month: 'short' });
      months.push(label);
      const total = this.expenses.filter(e => {
        const ed = new Date(e.date);
        return ed.getMonth() === d.getMonth() && ed.getFullYear() === d.getFullYear();
      }).reduce((s, e) => s + e.amount, 0);
      monthlyTotals.push(total);
    }

    this.barChartData = {
      labels: months,
      datasets: [{
        data: monthlyTotals,
        backgroundColor: 'rgba(124,106,247,0.5)',
        borderColor: '#7c6af7',
        borderWidth: 2,
        borderRadius: 8
      }]
    };
  }

  get monthlyChange(): number {
    if (this.totalLastMonth === 0) return 0;
    return Math.round(((this.totalThisMonth - this.totalLastMonth) / this.totalLastMonth) * 100);
  }

  getCategoryIcon(cat: string): string {
    const map: { [k: string]: string } = {
      'Food & Dining':   'restaurant',
      'Transportation':  'directions_car',
      'Shopping':        'shopping_bag',
      'Entertainment':   'movie',
      'Healthcare':      'medical_services',
      'Housing':         'home',
      'Education':       'school',
      'Travel':          'flight',
      'Utilities':       'bolt',
      'Other':           'label',
    };
    return map[cat] || 'receipt';
  }
}
