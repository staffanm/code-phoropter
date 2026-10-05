using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;

namespace WebApi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ProductsController : ControllerBase
    {
        private readonly ILogger<ProductsController> _logger;
        private readonly IProductRepository _repository;

        public ProductsController(
            ILogger<ProductsController> logger,
            IProductRepository repository)
        {
            _logger = logger;
            _repository = repository;
        }

        // GET: api/products
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Product>>> GetProducts(
            [FromQuery] string? category = null,
            [FromQuery] decimal? maxPrice = null)
        {
            _logger.LogInformation("Fetching products with category={Category}, maxPrice={MaxPrice}", category, maxPrice);

            try
            {
                var products = await _repository.GetAllAsync();

                // Apply filters if provided__GHOST_CARET__
                __GHOST_BEGIN__if (!string.IsNullOrEmpty(category))
                    products = products.Where(p => p.Category == category);

                if (maxPrice.HasValue)
                    products = products.Where(p => p.Price <= maxPrice.Value);__GHOST_END__

                return Ok(products.OrderBy(p => p.Name));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error fetching products");
                return StatusCode(500, "Internal server error");
            }
        }

        // POST: api/products
        [HttpPost]
        public async Task<ActionResult<Product>> CreateProduct([FromBody] Product product)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var created = await _repository.AddAsync(product);
            return CreatedAtAction(nameof(GetProduct), new { id = created.Id }, created);
        }

        // GET: api/products/5
        [HttpGet("{id}")]
        public async Task<ActionResult<Product>> GetProduct(int id)
        {
            var product = await _repository.GetByIdAsync(id);
            return product is null ? NotFound() : Ok(product);
        }
    }
}