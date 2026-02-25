// Product model
class Product {
  constructor(id, name, category, price, description, image, inStock, quantity) {
    this.id = id;
    this.name = name;
    this.category = category;
    this.price = price;
    this.description = description;
    this.image = image;
    this.inStock = inStock;
    this.quantity = quantity;
  }

  getInfo() {
    return {
      id: this.id,
      name: this.name,
      category: this.category,
      price: this.price,
      description: this.description,
      image: this.image,
      inStock: this.inStock,
      quantity: this.quantity
    };
  }
}

module.exports = Product;
