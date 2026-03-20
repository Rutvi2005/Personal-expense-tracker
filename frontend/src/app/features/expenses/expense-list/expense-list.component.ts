import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { ExpenseService } from '../../../core/services/expense.service';
import { Expense, EXPENSE_CATEGORIES } from '../../../shared/models/expense.model';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { FormControl } from '@angular/forms';

@Component({
  selector: 'app-expense-list',
  standalone: false,
  templateUrl: './expense-list.component.html',
  styleUrls: ['./expense-list.component.scss']
})
export class ExpenseListComponent implements OnInit {
  expenses: Expense[] = [];
  filteredExpenses: Expense[] = [];
  loading = true;
  categories = ['All', ...EXPENSE_CATEGORIES];
  displayedColumns = ['date', 'description', 'category', 'amount', 'actions'];

  categoryFilter = new FormControl('All');
  startDateFilter = new FormControl('');
  endDateFilter   = new FormControl('');

  constructor(
    private expenseService: ExpenseService,
    private snackBar: MatSnackBar,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadExpenses();
  }

  loadExpenses() {
    this.loading = true;
    this.expenseService.getExpenses().subscribe({
      next: (data) => {
        this.expenses = data.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        this.applyFilters();
        this.loading = false;
        this.cdr.detectChanges(); // Force change detection
      },
      error: () => {
        this.loading = false;
        this.cdr.detectChanges(); // Force change detection
      }
    });
  }

  applyFilters() {
    const cat   = this.categoryFilter.value;
    const start = this.startDateFilter.value;
    const end   = this.endDateFilter.value;

    this.filteredExpenses = this.expenses.filter(e => {
      const matchCat   = !cat || cat === 'All' || e.category === cat;
      const matchStart = !start || new Date(e.date) >= new Date(start);
      const matchEnd   = !end   || new Date(e.date) <= new Date(end);
      return matchCat && matchStart && matchEnd;
    });
  }

  resetFilters() {
    this.categoryFilter.setValue('All');
    this.startDateFilter.setValue('');
    this.endDateFilter.setValue('');
    this.applyFilters();
  }

  editExpense(id: number) {
    this.router.navigate(['/expenses/edit', id]);
  }

  deleteExpense(id: number) {
    if (!confirm('Are you sure you want to delete this expense?')) return;
    
    console.log('Deleting expense:', id);
    console.log('API URL:', `http://localhost:5204/api/expenses/${id}`);
    
    this.expenseService.deleteExpense(id).subscribe({
      next: () => {
        console.log('Delete successful');
        this.expenses = this.expenses.filter(e => e.id !== id);
        this.applyFilters();
        this.cdr.detectChanges(); // Force change detection
        this.snackBar.open('Expense deleted', 'Close', { duration: 2500 });
      },
      error: (err) => {
        console.log('Delete error:', err);
        this.snackBar.open('Failed to delete expense', 'Close', { duration: 3000 });
      }
    });
  }

  get totalAmount(): number {
    return this.filteredExpenses.reduce((s, e) => s + e.amount, 0);
  }
}
