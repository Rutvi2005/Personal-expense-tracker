using ExpenseTracker.API.DTOs;
using ExpenseTracker.API.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace ExpenseTracker.API.Controllers
{
    [ApiController]
    [Route("api/expenses")]
    [Authorize]
    public class ExpenseController : ControllerBase
    {
        private readonly ExpenseService _expenseService;

        public ExpenseController(ExpenseService expenseService)
        {
            _expenseService = expenseService;
        }

        private int GetUserId()
        {
            var sub = User.FindFirstValue(ClaimTypes.NameIdentifier)
                      ?? User.FindFirstValue("sub")
                      ?? throw new UnauthorizedAccessException("User ID not found in token.");
            return int.Parse(sub);
        }

        /// <summary>GET /api/expenses</summary>
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var expenses = await _expenseService.GetAllAsync(GetUserId());
            return Ok(expenses);
        }

        /// <summary>GET /api/expenses/{id}</summary>
        [HttpGet("{id:int}")]
        public async Task<IActionResult> GetById(int id)
        {
            var expense = await _expenseService.GetByIdAsync(id, GetUserId());
            return expense == null ? NotFound() : Ok(expense);
        }

        /// <summary>POST /api/expenses</summary>
        [HttpPost]
        public async Task<IActionResult> Create([FromBody] ExpenseCreateDTO dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var created = await _expenseService.CreateAsync(dto, GetUserId());
            return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
        }

        /// <summary>PUT /api/expenses/{id}</summary>
        [HttpPut("{id:int}")]
        public async Task<IActionResult> Update(int id, [FromBody] ExpenseUpdateDTO dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var result = await _expenseService.UpdateAsync(id, GetUserId(), dto);
            return result == null ? NotFound() : Ok(result);
        }

        /// <summary>DELETE /api/expenses/{id}</summary>
        [HttpDelete("{id:int}")]
        public async Task<IActionResult> Delete(int id)
        {
            var userId = GetUserId();
            Console.WriteLine($"Controller: Deleting expense {id} for user {userId}");
            var deleted = await _expenseService.DeleteAsync(id, userId);
            Console.WriteLine($"Controller: Delete result: {deleted}");
            return deleted ? NoContent() : NotFound();
        }

        /// <summary>GET /api/expenses/monthly-summary</summary>
        [HttpGet("monthly-summary")]
        public async Task<IActionResult> GetMonthlySummary()
        {
            var summary = await _expenseService.GetMonthlySummaryAsync(GetUserId());
            return Ok(summary);
        }

        /// <summary>GET /api/expenses/category-summary</summary>
        [HttpGet("category-summary")]
        public async Task<IActionResult> GetCategorySummary()
        {
            var summary = await _expenseService.GetCategorySummaryAsync(GetUserId());
            return Ok(summary);
        }
    }
}
