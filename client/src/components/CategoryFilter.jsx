function CategoryFilter({ categories, selectedCategory, onCategoryChange }) {
  return (
    <section className="category-filter">
      <label htmlFor="category">Category:</label>
      <select
        id="category"
        value={selectedCategory}
        onChange={(event) => onCategoryChange(event.target.value)}
      >
        {categories.map((category) => (
          <option key={category} value={category}>
            {category}
          </option>
        ))}
      </select>
    </section>
  )
}

export default CategoryFilter
