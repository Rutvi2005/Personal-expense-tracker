using ExpenseTracker.API.DTOs;
using ExpenseTracker.API.Models;

namespace ExpenseTracker.API.Repositories
{
    public interface IExpenseRepository
    {
        Task<IEnumerable<Expense>> GetAllByUserAsync(int userId);
        Task<Expense?> GetByIdAsync(int id, int userId);
        Task<Expense> CreateAsync(Expense expense);
        Task<Expense?> UpdateAsync(int id, int userId, Expense updated);
        Task<bool> DeleteAsync(int id, int userId);
        Task<IEnumerable<MonthlySummaryDTO>> GetMonthlySummaryAsync(int userId);
        Task<IEnumerable<CategorySummaryDTO>> GetCategorySummaryAsync(int userId);
    }
}
