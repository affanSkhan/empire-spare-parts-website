/**
 * CategoryFilter Component
 * Dropdown filter for selecting product categories
 */
export default function CategoryFilter({ categories, selectedCategory, onCategoryChange }) {
  return (
    <div className="w-full">
      <label htmlFor="category-filter" className="block text-sm font-medium text-gray-700 mb-2">
        Filter by Category
      </label>
      <select
        id="category-filter"
        className="input-field"
        value={selectedCategory}
        onChange={(e) => onCategoryChange(e.target.value)}
      >
        <option value="all">All Categories</option>
        {categories.map((category) => (
          <option key={category.id} value={category.id}>
            {category.name}
          </option>
        ))}
      </select>
    </div>
  )
}
