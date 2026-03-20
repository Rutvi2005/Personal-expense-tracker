using ExpenseTracker.API.Data;
using ExpenseTracker.API.DTOs;
using ExpenseTracker.API.Models;
using Microsoft.EntityFrameworkCore;

namespace ExpenseTracker.API.Repositories
{
    public class ExpenseRepository : IExpenseRepository
    {
        private readonly ApplicationDbContext _context;

        public ExpenseRepository(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<Expense>> GetAllByUserAsync(int userId)
        {
            return await _context.Expenses
                .Where(e => e.UserId == userId)
                .OrderByDescending(e => e.Date)
                .ToListAsync();
        }

        public async Task<Expense?> GetByIdAsync(int id, int userId)
        {
            return await _context.Expenses
                .FirstOrDefaultAsync(e => e.Id == id && e.UserId == userId);
        }

        public async Task<Expense> CreateAsync(Expense expense)
        {
            _context.Expenses.Add(expense);
            await _context.SaveChangesAsync();
            return expense;
        }

        public async Task<Expense?> UpdateAsync(int id, int userId, Expense updated)
        {
            var expense = await GetByIdAsync(id, userId);
            if (expense == null) return null;

            expense.Title = updated.Title;
            expense.Amount = updated.Amount;
            expense.Category = updated.Category;
            expense.Description = updated.Description;
            expense.Date = updated.Date;
            expense.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();
            return expense;
        }

        public async Task<bool> DeleteAsync(int id, int userId)
        {
            Console.WriteLine($"Attempting to delete expense {id} for user {userId}");
            var expense = await GetByIdAsync(id, userId);
            if (expense == null) 
            {
                Console.WriteLine($"Expense {id} not found for user {userId}");
                return false;
            }

            _context.Expenses.Remove(expense);
            var result = await _context.SaveChangesAsync();
            Console.WriteLine($"SaveChanges result: {result} entities affected");
            return true;
        }

        public async Task<IEnumerable<MonthlySummaryDTO>> GetMonthlySummaryAsync(int userId)
        {
            var result = await _context.Expenses
                .Where(e => e.UserId == userId)
                .GroupBy(e => new { e.Date.Year, e.Date.Month })
                .Select(g => new MonthlySummaryDTO
                {
                    Year = g.Key.Year,
                    Month = g.Key.Month,
                    TotalAmount = g.Sum(e => e.Amount),
                    ExpenseCount = g.Count()
                })
                .OrderBy(m => m.Year).ThenBy(m => m.Month)
                .ToListAsync();

            foreach (var item in result)
            {
                item.MonthName = new DateTime(item.Year, item.Month, 1)
                    .ToString("MMMM yyyy");
            }
            return result;
        }

        public async Task<IEnumerable<CategorySummaryDTO>> GetCategorySummaryAsync(int userId)
        {
            var expenses = await _context.Expenses
                .Where(e => e.UserId == userId)
                .ToListAsync();

            var total = expenses.Sum(e => e.Amount);
            if (total == 0) return Enumerable.Empty<CategorySummaryDTO>();

            return expenses
                .GroupBy(e => e.Category)
                .Select(g => new CategorySummaryDTO
                {
                    Category = g.Key,
                    TotalAmount = g.Sum(e => e.Amount),
                    ExpenseCount = g.Count(),
                    Percentage = Math.Round((double)(g.Sum(e => e.Amount) / total) * 100, 2)
                })
                .OrderByDescending(c => c.TotalAmount);
        }
    }
}
