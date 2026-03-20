import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ExpenseService } from '../../../core/services/expense.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { EXPENSE_CATEGORIES } from '../../../shared/models/expense.model';

@Component({
  selector: 'app-edit-expense',
  standalone: false,
  templateUrl: './edit-expense.component.html',
  styleUrls: ['./edit-expense.component.scss']
})
export class EditExpenseComponent implements OnInit {
  expenseForm: FormGroup;
  loading = false;
  fetching = true;
  categories = EXPENSE_CATEGORIES;
  expenseId!: number;

  constructor(
    private fb: FormBuilder,
    private expenseService: ExpenseService,
    private route: ActivatedRoute,
    private router: Router,
    private snackBar: MatSnackBar,
    private cdr: ChangeDetectorRef
  ) {
    // Initialize form immediately with minimal validators for faster creation
    this.expenseForm = this.fb.group({
      title:       ['', [Validators.required, Validators.maxLength(200)]],
      amount:      ['', [Validators.required, Validators.min(0.01)]],
      category:    ['', Validators.required],
      description: [''],
      date:        ['', Validators.required]
    });
  }

  ngOnInit(): void {
    // Get ID immediately from route snapshot (no async)
    this.expenseId = +this.route.snapshot.paramMap.get('id')!;
    
    // Start loading immediately - no artificial delays
    this.loadExpenseData();
  }

  private loadExpenseData(): void {
    this.expenseService.getExpense(this.expenseId).subscribe({
      next: (exp) => {
        // Optimized form patching - direct assignment
        this.expenseForm.patchValue({
          title: exp.title || (exp.description ? exp.description.substring(0, 50) : '') || 'Expense',
          amount: exp.amount,
          category: exp.category,
          description: exp.description || '',
          date: exp.date?.split('T')[0] || ''
        });
        this.fetching = false;
        this.cdr.detectChanges(); // Force immediate UI update
      },
      error: () => {
        this.fetching = false;
        this.cdr.detectChanges(); // Force immediate UI update
        this.snackBar.open('Failed to load expense', 'Close', { duration: 3000 });
        this.router.navigate(['/expenses/list']);
      }
    });
  }

  onSubmit() {
    if (this.expenseForm.invalid) return;
    this.loading = true;
    this.cdr.detectChanges(); // Force immediate UI update
    
    // Convert date to UTC format for backend
    const formData = { ...this.expenseForm.value };
    if (formData.date) {
      formData.date = new Date(formData.date).toISOString();
    }
    
    this.expenseService.updateExpense(this.expenseId, formData).subscribe({
      next: () => {
        this.snackBar.open('Expense updated!', 'Close', { duration: 3000 });
        this.router.navigate(['/expenses/list']);
      },
      error: (err) => {
        this.loading = false;
        this.cdr.detectChanges(); // Force immediate UI update
        this.snackBar.open(err?.error?.message || 'Update failed', 'Close', { duration: 3000 });
      }
    });
  }

  cancel() {
    this.router.navigate(['/expenses/list']);
  }
}
