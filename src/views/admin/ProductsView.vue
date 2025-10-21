<template>
  <div class="admin-products-container">
    <h2>Product Management</h2>

    <!-- Add Product Form -->
    <form @submit.prevent="handleAddProduct" class="add-product-form" enctype="multipart/form-data">
      <h3>Add New Product</h3>
      <div class="form-row">
        <label>Product Name</label>
        <input v-model="newProduct.productName" required />
      </div>
      <div class="form-row">
        <label>Model</label>
        <input v-model="newProduct.productModel" required />
      </div>
      <div class="form-row">
        <label>Width</label>
        <input v-model.number="newProduct.width" type="number" required />
      </div>
      <div class="form-row">
        <label>Aspect Ratio</label>
        <input v-model.number="newProduct.aspectRatio" type="number" required />
      </div>
      <div class="form-row">
        <label>Rim Diameter</label>
        <input v-model.number="newProduct.rimDiameter" type="number" required />
      </div>
      <div class="form-row">
        <label>Season</label>
        <select v-model="newProduct.season" required>
          <option value="SUMMER">SUMMER</option>
          <option value="WINTER">WINTER</option>
          <option value="ALL_SEASON">ALL_SEASON</option>
        </select>
      </div>
      <div class="form-row">
        <label>Vehicle Type</label>
        <select v-model="newProduct.vehicleType" required>
          <option value="Passenger">Passenger</option>
          <option value="SUV">SUV</option>
          <option value="LightTruck">Light Truck</option>
          <option value="Commercial">Commercial</option>
          <option value="Sedan">Sedan</option>
          <option value="Sports_Car">Sports Car</option>
        </select>
      </div>
      <div class="form-row">
        <label>Price</label>
        <input v-model.number="newProduct.price" type="number" required />
      </div>
      <div class="form-row">
        <label>Stock Quantity</label>
        <input v-model.number="newProduct.stockQuantity" type="number" required />
      </div>
      <div class="form-row">
        <label>Image</label>
        <input type="file" @change="handleImageChange" accept="image/*" />
      </div>
      <div class="form-row">
        <label>Description</label>
        <textarea v-model="newProduct.description" />
      </div>
      <div class="form-row fitments-row">
        <label>Fitments</label>
        <div class="fitments-list">
          <div v-for="(fitment, idx) in fitments" :key="idx" class="fitment-fields">
            <input v-model="fitment.make" placeholder="Make" />
            <input v-model="fitment.model" placeholder="Model" />
            <input v-model.number="fitment.year" type="number" placeholder="Year" />
            <input v-model="fitment.trim" placeholder="Trim" />
            <button type="button" @click="removeFitment(idx)" class="remove-fitment-btn">Remove</button>
          </div>
          <button type="button" @click="addFitment" class="add-fitment-btn">Add Fitment</button>
        </div>
      </div>
      <button type="submit">Add Product</button>
    </form>

    <!-- Product List Table -->
    <h3>All Products</h3>
    <table class="products-table">
      <thead>
        <tr>
          <th>ID</th>
          <th>Name</th>
          <th>Model</th>
          <th>Width</th>
          <th>Aspect</th>
          <th>Rim</th>
          <th>Season</th>
          <th>Vehicle</th>
          <th>Price</th>
          <th>Stock</th>
          <th>Image</th>
          <th>Description</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="product in products" :key="product.productId">
          <td>{{ product.productId }}</td>
          <td>
            <input v-if="editProduct && editProduct.productId === product.productId" v-model="editProduct.productName" />
            <span v-else>{{ product.productName }}</span>
          </td>
          <td>
            <input v-if="editProduct && editProduct.productId === product.productId" v-model="editProduct.productModel" />
            <span v-else>{{ product.productModel }}</span>
          </td>
          <td>
            <input v-if="editProduct && editProduct.productId === product.productId" v-model.number="editProduct.width" type="number" />
            <span v-else>{{ product.width }}</span>
          </td>
          <td>
            <input v-if="editProduct && editProduct.productId === product.productId" v-model.number="editProduct.aspectRatio" type="number" />
            <span v-else>{{ product.aspectRatio }}</span>
          </td>
          <td>
            <input v-if="editProduct && editProduct.productId === product.productId" v-model.number="editProduct.rimDiameter" type="number" />
            <span v-else>{{ product.rimDiameter }}</span>
          </td>
          <td>
            <select v-if="editProduct && editProduct.productId === product.productId" v-model="editProduct.season">
              <option value="SUMMER">SUMMER</option>
              <option value="WINTER">WINTER</option>
              <option value="ALL_SEASON">ALL_SEASON</option>
            </select>
            <span v-else>{{ product.season }}</span>
          </td>
          <td>
            <select v-if="editProduct && editProduct.productId === product.productId" v-model="editProduct.vehicleType">
              <option value="Passenger">Passenger</option>
              <option value="SUV">SUV</option>
              <option value="LightTruck">Light Truck</option>
              <option value="Commercial">Commercial</option>
              <option value="Sedan">Sedan</option>
              <option value="Sports_Car">Sports Car</option>
            </select>
            <span v-else>{{ product.vehicleType }}</span>
          </td>
          <td>
            <input v-if="editProduct && editProduct.productId === product.productId" v-model.number="editProduct.productPrice" type="number" />
            <span v-else>{{ product.productPrice }}</span>
          </td>
          <td>
            <input v-if="editProduct && editProduct.productId === product.productId" v-model.number="editProduct.stockQuantity" type="number" />
            <span v-else>{{ product.stockQuantity }}</span>
          </td>
          <td>
            <img v-if="product.image" :src="getProductImage(product.productId)" alt="Product Image" style="width:60px;height:40px;object-fit:cover;" />
          </td>
          <td>
            <textarea v-if="editProduct && editProduct.productId === product.productId" v-model="editProduct.description" />
            <span v-else>{{ product.description }}</span>
          </td>
          <td>
            <button v-if="editProduct && editProduct.productId === product.productId" @click="handleSaveEdit(product.productId)">Save</button>
            <button v-if="editProduct && editProduct.productId === product.productId" @click="cancelEdit">Cancel</button>
            <button v-else @click="startEdit(product)">Edit</button>
            <button @click="handleDeleteProduct(product.productId)">Delete</button>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script>
import api from '@/services/api.js'

export default {
  name: 'AdminProductsView',
  data() {
    return {
      products: [],
      newProduct: {
        productName: '',
        productModel: '',
        width: '',
        aspectRatio: '',
        rimDiameter: '',
        season: 'SUMMER',
        vehicleType: 'Passenger',
        price: '',
        stockQuantity: '',
        description: ''
      },
      fitments: [],
      imageFile: null,
      editProduct: null
    }
  },
  methods: {
    async fetchProducts() {
      try {
        const data = await api.getAllProducts()
        this.products = data
      } catch {
        alert('Failed to load products')
      }
    },
    handleImageChange(e) {
      this.imageFile = e.target.files[0]
    },
    addFitment() {
      this.fitments.push({ make: '', model: '', year: '', trim: '' })
    },
    removeFitment(idx) {
      this.fitments.splice(idx, 1)
    },
    async handleAddProduct() {
      try {
        const formData = new FormData()
        formData.append('productName', this.newProduct.productName)
        formData.append('productModel', this.newProduct.productModel)
        formData.append('width', this.newProduct.width)
        formData.append('aspectRatio', this.newProduct.aspectRatio)
        formData.append('rimDiameter', this.newProduct.rimDiameter)
        formData.append('season', this.newProduct.season)
        formData.append('vehicleType', this.newProduct.vehicleType)
        formData.append('price', this.newProduct.price)
        formData.append('stockQuantity', this.newProduct.stockQuantity)
        formData.append('description', this.newProduct.description)
        if (this.fitments.length > 0) {
          formData.append('fitments', JSON.stringify(this.fitments))
        }
        if (this.imageFile) {
          formData.append('file', this.imageFile)
        }
        await api.createProductWithImage(formData)
        this.newProduct = {
          productName: '', productModel: '', width: '', aspectRatio: '', rimDiameter: '', season: 'SUMMER', vehicleType: 'Passenger', price: '', stockQuantity: '', description: ''
        }
        this.fitments = []
        this.imageFile = null
        await this.fetchProducts()
      } catch {
        alert('Failed to add product')
      }
    },
    async handleDeleteProduct(productId) {
      if (!confirm('Delete this product?')) return
      try {
        await api.deleteProduct(productId)
        await this.fetchProducts()
      } catch {
        alert('Failed to delete product')
      }
    },
    startEdit(product) {
      this.editProduct = { ...product }
    },
    cancelEdit() {
      this.editProduct = null
    },
    async handleSaveEdit(productId) {
      try {
        await api.updateProduct(productId, this.editProduct)
        this.editProduct = null
        await this.fetchProducts()
      } catch {
        alert('Failed to update product')
      }
    },
    getProductImage(productId) {
      return `http://localhost:8080/tymelesstyre/api/products/${productId}/image`
    }
  },
  mounted() {
    this.fetchProducts()
  }
}
</script>

<style scoped>

.admin-products-container {
  max-width: 1100px;
  margin: 40px auto;
  padding: 32px 24px;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 4px 16px rgba(0,0,0,0.10);
}
.add-product-form {
  margin-bottom: 36px;
  padding: 24px 20px;
  background: #f7f9fa;
  border-radius: 10px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.04);
}
.add-product-form h3 {
  margin-bottom: 18px;
  font-size: 1.2rem;
  font-weight: 600;
}
.form-row {
  margin-bottom: 16px;
  display: flex;
  flex-direction: row;
  align-items: center;
}
.fitments-row {
  flex-direction: column;
  align-items: flex-start;
}
.fitments-list {
  width: 100%;
}
.fitment-fields {
  display: flex;
  gap: 10px;
  margin-bottom: 8px;
}
.fitment-fields input {
  width: 120px;
}
.add-fitment-btn, .remove-fitment-btn {
  background: var(--primary);
  color: white;
  border: none;
  border-radius: 6px;
  padding: 0.3rem 0.8rem;
  font-weight: 500;
  font-size: 0.97rem;
  cursor: pointer;
  transition: background 0.2s;
}
.add-fitment-btn {
  margin-top: 6px;
}
.add-fitment-btn:hover, .remove-fitment-btn:hover {
  background: var(--primary-dark);
}
.form-row label {
  min-width: 140px;
  font-weight: 500;
  margin-right: 16px;
}
.form-row input,
.form-row select,
.form-row textarea {
  flex: 1;
  padding: 8px 10px;
  border-radius: 6px;
  border: 1px solid #ccc;
  font-size: 1rem;
}
.form-row textarea {
  min-height: 40px;
}
.add-product-form button[type="submit"] {
  margin-top: 10px;
  background: var(--primary);
  color: white;
  border: none;
  border-radius: 8px;
  padding: 0.6rem 1.4rem;
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  transition: background 0.2s;
}
.add-product-form button[type="submit"]:hover {
  background: var(--primary-dark);
}
.products-table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 24px;
  background: #fafbfc;
  border-radius: 10px;
  overflow: hidden;
}
.products-table th, .products-table td {
  border: 1px solid #e5e7eb;
  padding: 10px 8px;
  text-align: left;
}
.products-table th {
  background: #f4f4f4;
  font-weight: 600;
}
.products-table tr {
  transition: background 0.2s;
}
.products-table tr:hover {
  background: #f3f6fa;
}
.products-table input,
.products-table select,
.products-table textarea {
  width: 100%;
  padding: 6px 8px;
  border-radius: 5px;
  border: 1px solid #ccc;
  font-size: 0.98rem;
}
.products-table button {
  margin-right: 6px;
  background: var(--primary);
  color: white;
  border: none;
  border-radius: 6px;
  padding: 0.4rem 1rem;
  font-weight: 500;
  font-size: 0.97rem;
  cursor: pointer;
  transition: background 0.2s;
}
.products-table button:last-child {
  margin-right: 0;
}
.products-table button:hover {
  background: var(--primary-dark);
}
.products-table img {
  border-radius: 6px;
  box-shadow: 0 1px 4px rgba(0,0,0,0.07);
}
</style>
