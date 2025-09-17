<template>
  <div class="cart-container">
    <h2>Shopping Cart</h2>

    <table class="cart-table" v-if="cartItems.length > 0">
      <thead>
        <tr>
          <th>Image</th>
          <th>Product</th>
          <th>Price</th>
          <th>Quantity</th>
          <th>Total</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(item, index) in cartItems" :key="index">
          <td>
            <img :src="item.image" alt="product" class="cart-image" />
          </td>
          <td>{{ item.name }}</td>
          <td>R{{ item.price.toFixed(2) }}</td>
          <td>
            <input
              type="number"
              min="1"
              v-model.number="item.quantity"
              @change="updateQuantity(index, item.quantity)"
            />
          </td>
          <td>R{{ (item.price * item.quantity).toFixed(2) }}</td>
          <td>
            <button @click="removeItem(index)">Remove</button>
          </td>
        </tr>
      </tbody>
    </table>

    <div v-else class="empty-cart">
      <p>Your cart is empty.</p>
    </div>

    <div class="cart-summary" v-if="cartItems.length > 0">
      <h3>Cart Summary</h3>
      <p><strong>Subtotal:</strong> R{{ cartTotal.toFixed(2) }}</p>
      <button class="checkout-btn" @click="checkout">Checkout</button>
    </div>
  </div>
</template>

<script>
import auth from "../stores/auth.js";

export default {
  name: "CartView",
  data() {
    return {
      cartItems: [
        //Just placeholders, to replaced later on
        { name: "Michelin Pilot Sport 4", price: 2500, quantity: 2, image: "https://via.placeholder.com/80" },
        { name: "Pirelli P Zero", price: 2100, quantity: 1, image: "https://via.placeholder.com/80" },
         { name: "Michelin CrossClimate+", price: 7000, quantity: 4, image: "https://via.placeholder.com/80" },
          { name: "Bridgestone Turanza T005", price: 1450, quantity: 1, image: "https://via.placeholder.com/80" },
      ],
    };
  },
  computed: {
    cartTotal() {
      return this.cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
    },
  },
  methods: {
    updateQuantity(index, qty) {
      if (qty < 1) this.cartItems[index].quantity = 1;
    },
    removeItem(index) {
      this.cartItems.splice(index, 1);
    },
    checkout() {
      if (!auth.isAuthenticated()) {
        alert("You must be logged in to checkout.");
        this.$router.push("/login");
        return;
      }

      if (!auth.isCustomer()) {
        alert("Only customers can checkout.");
        this.$router.push("/");
        return;
      }

      alert("Proceeding to checkout... (to be implemented)");
    },
  },
};
</script>

<style scoped>
.cart-container {
  max-width: 900px;
  margin: 40px auto;
  padding: 30px;
  background-color: #fff;
  border-radius: 10px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
  font-family: Arial, sans-serif;
}

h2 {
  text-align: center;
  margin-bottom: 20px;
}

.cart-table {
  width: 100%;
  border-collapse: collapse;
}

.cart-table th,
.cart-table td {
  border: 1px solid #ccc;
  padding: 10px;
  text-align: center;
}

.cart-table th {
  background-color: #f4f4f4;
}

.cart-table input {
  width: 60px;
  padding: 4px;
  text-align: center;
}

.cart-image {
  width: 80px;
  height: auto;
  border-radius: 5px;
}

.empty-cart {
  text-align: center;
  font-size: 1.1em;
  color: #777;
}

.cart-summary {
  margin-top: 20px;
  padding: 20px;
  border-top: 2px solid #eee;
  text-align: right;
}

.checkout-btn {
  margin-top: 10px;
  padding: 10px 20px;
  background-color: #28a745;
  border: none;
  border-radius: 5px;
  color: white;
  font-weight: bold;
  cursor: pointer;
}

.checkout-btn:hover {
  opacity: 0.9;
}
</style>
