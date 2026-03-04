import { useMemo, useState } from 'react'
import './App.css'
import Header from './components/Header'
import CategoryFilter from './components/CategoryFilter'
import ProductList from './components/ProductList'
import { products } from './data/products'

function App() {
  const [selectedCategory, setSelectedCategory] = useState('All')

  const categories = useMemo(() => {
    const allCategories = products.map((product) => product.category)
    return ['All', ...new Set(allCategories)]
  }, [])

  const filteredProducts = useMemo(() => {
    if (selectedCategory === 'All') {
      return products
    }

    return products.filter((product) => product.category === selectedCategory)
  }, [selectedCategory])

  return (
    <main className="app">
      <Header />
      <CategoryFilter
        categories={categories}
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
      />
      <ProductList products={filteredProducts} />
    </main>
  )
}

export default App
