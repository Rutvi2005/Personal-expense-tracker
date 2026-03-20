using ExpenseTracker.API.DTOs;
using ExpenseTracker.API.Models;
using ExpenseTracker.API.Repositories;

namespace ExpenseTracker.API.Services
{
    public class ExpenseService
    {
        private readonly IExpenseRepository _repo;

        public ExpenseService(IExpenseRepository repo)
        {
            _repo = repo;
        }

        public async Task<IEnumerable<ExpenseResponseDTO>> GetAllAsync(int userId)
        {
            var expenses = await _repo.GetAllByUserAsync(userId);
            return expenses.Select(MapToDTO);
        }

        public async Task<ExpenseResponseDTO?> GetByIdAsync(int id, int userId)
        {
            var expense = await _repo.GetByIdAsync(id, userId);
            return expense == null ? null : MapToDTO(expense);
        }

        public async Task<ExpenseResponseDTO> CreateAsync(ExpenseCreateDTO dto, int userId)
        {
            var expense = new Expense
            {
                Title = dto.Title,
                Amount = dto.Amount,
                Category = dto.Category,
                Description = dto.Description,
                Date = DateTime.SpecifyKind(dto.Date, DateTimeKind.Utc),
                UserId = userId
            };
            var created = await _repo.CreateAsync(expense);
            return MapToDTO(created);
        }

        public async Task<ExpenseResponseDTO?> UpdateAsync(int id, int userId, ExpenseUpdateDTO dto)
        {
            var updated = new Expense
            {
                Title = dto.Title,
                Amount = dto.Amount,
                Category = dto.Category,
                Description = dto.Description,
                Date = DateTime.SpecifyKind(dto.Date, DateTimeKind.Utc)
            };
            var result = await _repo.UpdateAsync(id, userId, updated);
            return result == null ? null : MapToDTO(result);
        }

        public Task<bool> DeleteAsync(int id, int userId) => _repo.DeleteAsync(id, userId);

        public Task<IEnumerable<MonthlySummaryDTO>> GetMonthlySummaryAsync(int userId)
            => _repo.GetMonthlySummaryAsync(userId);

        public Task<IEnumerable<CategorySummaryDTO>> GetCategorySummaryAsync(int userId)
            => _repo.GetCategorySummaryAsync(userId);

        private static ExpenseResponseDTO MapToDTO(Expense e) => new()
        {
            Id = e.Id,
            Title = e.Title,
            Amount = e.Amount,
            Category = e.Category,
            Description = e.Description,
            Date = e.Date,
            CreatedAt = e.CreatedAt
        };
    }
}
