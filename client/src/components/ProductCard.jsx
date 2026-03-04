function ProductCard({ product }) {
  return (
    <article className="product-card">
      <h3>{product.name}</h3>
      <p className="product-category">{product.category}</p>
      <p>{product.description}</p>
      <p className="product-price">₹{product.price}</p>
      <span className={product.inStock ? 'status in-stock' : 'status out-of-stock'}>
        {product.inStock ? 'In Stock' : 'Out of Stock'}
      </span>
    </article>
  )
}

export default ProductCard
