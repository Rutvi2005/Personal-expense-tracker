import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ExpenseService } from '../../../core/services/expense.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { EXPENSE_CATEGORIES } from '../../../shared/models/expense.model';

@Component({
  selector: 'app-add-expense',
  standalone: false,
  templateUrl: './add-expense.component.html',
  styleUrls: ['./add-expense.component.scss']
})
export class AddExpenseComponent {
  expenseForm: FormGroup;
  loading = false;
  categories = EXPENSE_CATEGORIES;
  today = new Date().toISOString().split('T')[0];

  constructor(
    private fb: FormBuilder,
    private expenseService: ExpenseService,
    private router: Router,
    private snackBar: MatSnackBar,
    private cdr: ChangeDetectorRef
  ) {
    this.expenseForm = this.fb.group({
      title:       ['', [Validators.required, Validators.maxLength(200)]],
      amount:      ['', [Validators.required, Validators.min(0.01)]],
      category:    ['', Validators.required],
      description: [''],
      date:        [this.today, Validators.required]
    });
  }

  onSubmit() {
    if (this.expenseForm.invalid) return;
    this.loading = true;
    this.cdr.detectChanges(); // Force change detection
    
    // Convert date to UTC to avoid PostgreSQL timezone issues
    const formData = { ...this.expenseForm.value };
    if (formData.date) {
      formData.date = new Date(formData.date).toISOString();
    }
    
    this.expenseService.createExpense(formData).subscribe({
      next: () => {
        this.snackBar.open('Expense added successfully!', 'Close', { duration: 3000 });
        this.router.navigate(['/expenses/list']);
      },
      error: (err) => {
        this.loading = false;
        this.cdr.detectChanges(); // Force change detection
        this.snackBar.open(err?.error?.message || 'Failed to add expense', 'Close', { duration: 3000 });
      }
    });
  }

  cancel() {
    this.router.navigate(['/expenses/list']);
  }
}
