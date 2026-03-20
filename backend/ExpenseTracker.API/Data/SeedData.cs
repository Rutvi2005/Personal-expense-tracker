using ExpenseTracker.API.Models;
using Microsoft.EntityFrameworkCore;

namespace ExpenseTracker.API.Data
{
    public static class SeedData
    {
        public static async Task SeedAsync(ApplicationDbContext context)
        {
            if (!context.Users.Any())
            {
                var demoUser = new User
                {
                    FullName = "Demo User",
                    Email = "demo@expensetracker.com",
                    PasswordHash = BCrypt.Net.BCrypt.HashPassword("Demo@123"),
                    CreatedAt = DateTime.UtcNow
                };
                context.Users.Add(demoUser);
                await context.SaveChangesAsync();

                var categories = new[] { "Food", "Travel", "Shopping", "Bills", "Entertainment" };
                var rng = new Random(42);
                var expenses = new List<Expense>();
                var startDate = DateTime.UtcNow.AddMonths(-5);

                for (int i = 0; i < 50; i++)
                {
                    var category = categories[rng.Next(categories.Length)];
                    expenses.Add(new Expense
                    {
                        Title = $"{category} Expense {i + 1}",
                        Amount = Math.Round((decimal)(rng.NextDouble() * 4900 + 100), 2),
                        Category = category,
                        Description = $"Demo {category.ToLower()} expense",
                        Date = startDate.AddDays(rng.Next(0, 150)),
                        UserId = demoUser.Id,
                        CreatedAt = DateTime.UtcNow
                    });
                }
                context.Expenses.AddRange(expenses);
                await context.SaveChangesAsync();
            }
        }
    }
}
