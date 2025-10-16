<template>
  <div class="cart-page">
    <h1>Shopping Cart</h1>

    <!-- Empty Cart -->
    <div v-if="cartItems.length === 0" class="empty-cart">
      <div class="empty-cart-icon">🛒</div>
      <p>Your cart is empty</p>
      <router-link to="/products" class="btn-primary">Continue Shopping</router-link>
    </div>

    <!-- Cart Content -->
    <div v-else class="cart-content">
      <!-- Left Section: Cart Items -->
      <div class="cart-items">
        <div v-for="item in cartItems" :key="item.id" class="cart-item">
          <div class="item-info">
            <img
              v-if="item.imageUrl"
              :src="item.imageUrl"
              alt="Product image"
              class="item-image"
            />
            <div class="details">
              <h3>{{ item.brand }} {{ item.model }}</h3>
              <p class="tire-size">
                Size: {{ item.sectionWidth }}/{{ item.aspectRatio }}R{{ item.rimDiameter }}
              </p>
              <p class="unit-price">R{{ item.price.toFixed(2) }} each</p>
            </div>
          </div>

          <div class="item-controls">
            <div class="quantity-controls">
              <button
                @click="updateQuantity(item.id, item.quantity - 1)"
                :disabled="isUpdating"
                class="quantity-btn"
              >
                -
              </button>
              <span class="quantity-display">{{ item.quantity }}</span>
              <button
                @click="updateQuantity(item.id, item.quantity + 1)"
                :disabled="isUpdating || item.quantity >= maxQuantity"
                class="quantity-btn"
              >
                +
              </button>
            </div>

            <div class="item-total">
              <p class="item-price">R{{ (item.price * item.quantity).toFixed(2) }}</p>
            </div>

            <button
              @click="removeItem(item.id)"
              class="remove-btn"
              :disabled="isUpdating"
            >
              Remove
            </button>
          </div>
        </div>
      </div>

      <!-- Right Section: Summary -->
      <div class="cart-summary">
        <div class="summary-content">
          <div class="summary-line">
            <span>Subtotal:</span>
            <span>R{{ cartSubtotal }}</span>
          </div>

          <div v-if="cartDiscount > 0" class="summary-line discount">
            <span>Discount:</span>
            <span>-R{{ cartDiscount }}</span>
          </div>

          <div class="summary-line">
            <span>Estimated Shipping:</span>
            <span>R{{ shippingCost.toFixed(2) }}</span>
          </div>

          <div class="summary-line total">
            <span>Total:</span>
            <span>R{{ cartTotalWithShipping.toFixed(2) }}</span>
          </div>

          <router-link
            to="/checkout"
            class="btn-primary checkout-btn"
            :class="{ 'btn-disabled': cartItems.length === 0 }"
          >
            Proceed to Checkout
          </router-link>

          <router-link to="/products" class="btn-secondary continue-btn">
            ← Continue Shopping
          </router-link>
        </div>
      </div>
    </div>

    <!-- Loading Overlay -->
    <div v-if="isUpdating" class="loading-overlay">
      <div class="loading-spinner"></div>
    </div>

    <!-- Error Message -->
    <div v-if="errorMessage" class="error-message">
      {{ errorMessage }}
      <button @click="clearError" class="error-close">×</button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useCartStore } from '@/stores/cart'
import { storeToRefs } from 'pinia'

const cartStore = useCartStore()
const { cartItems, cartTotal, cartDiscount, cartSubtotal } = storeToRefs(cartStore)

const isUpdating = ref(false)
const errorMessage = ref('')
const maxQuantity = 99
const shippingCost = ref(150) // static placeholder, backend can adjust later

const cartTotalWithShipping = computed(() => {
  return parseFloat(cartTotal.value) + shippingCost.value
})

const updateQuantity = async (productId, newQuantity) => {
  if (isUpdating.value) return
  if (newQuantity < 0) return
  if (newQuantity > maxQuantity) {
    showError(`Maximum quantity is ${maxQuantity}`)
    return
  }

  isUpdating.value = true
  errorMessage.value = ''

  try {
    if (newQuantity < 1) {
      await cartStore.removeItem(productId)
    } else {
      await cartStore.updateQuantity(productId, newQuantity)
    }
  } catch (error) {
    console.error('Failed to update quantity:', error)
    showError('Failed to update quantity. Please try again.')
  } finally {
    isUpdating.value = false
  }
}

const removeItem = async (productId) => {
  if (isUpdating.value) return

  isUpdating.value = true
  errorMessage.value = ''

  try {
    await cartStore.removeItem(productId)
  } catch (error) {
    console.error('Failed to remove item:', error)
    showError('Failed to remove item. Please try again.')
  } finally {
    isUpdating.value = false
  }
}

const showError = (message) => {
  errorMessage.value = message
  setTimeout(() => {
    errorMessage.value = ''
  }, 4000)
}

const clearError = () => {
  errorMessage.value = ''
}

defineExpose({
  updateQuantity,
  removeItem
})
</script>

<style scoped>
.cart-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
  position: relative;
  min-height: 60vh;
}

h1 {
  text-align: center;
  margin-bottom: 2rem;
  color: #1a202c;
  font-size: 2.5rem;
  font-weight: 700;
}

/* Empty Cart */
.empty-cart {
  text-align: center;
  padding: 4rem 2rem;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
}
.empty-cart-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
  opacity: 0.5;
}
.empty-cart p {
  font-size: 1.2rem;
  color: #6b7280;
  margin-bottom: 2rem;
}

/* Cart Layout */
.cart-content {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 2rem;
}
@media (max-width: 768px) {
  .cart-content {
    grid-template-columns: 1fr;
  }
}

/* Cart Items */
.cart-items {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
}
.cart-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #e2e8f0;
  padding: 1rem 0;
  transition: background 0.2s;
}
.cart-item:hover {
  background: #f9fafb;
}
.cart-item:last-child {
  border-bottom: none;
}
.item-info {
  display: flex;
  align-items: center;
  gap: 1rem;
}
.item-image {
  width: 80px;
  height: 80px;
  object-fit: cover;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
}
.details h3 {
  font-size: 1.2rem;
  font-weight: 600;
  color: #1a202c;
}
.tire-size {
  color: #6b7280;
  font-size: 0.9rem;
}
.unit-price {
  color: #059669;
  font-weight: 500;
}

/* Controls */
.item-controls {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 1rem;
}
.quantity-controls {
  display: flex;
  align-items: center;
  background: #f7fafc;
  border-radius: 8px;
  padding: 0.25rem;
}
.quantity-btn {
  width: 2rem;
  height: 2rem;
  border: none;
  background: white;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.2s;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}
.quantity-btn:hover:not(:disabled) {
  background: #3b82f6;
  color: white;
  transform: scale(1.05);
}
.quantity-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
.quantity-display {
  width: 2rem;
  text-align: center;
  font-weight: 600;
  color: #1a202c;
}
.item-price {
  font-weight: 600;
  color: #1a202c;
}
.remove-btn {
  background: #fee2e2;
  color: #dc2626;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.875rem;
  font-weight: 500;
  transition: all 0.2s;
}
.remove-btn:hover:not(:disabled) {
  background: #dc2626;
  color: white;
}

/* Summary */
.cart-summary {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  position: sticky;
  top: 2rem;
}
.summary-line {
  display: flex;
  justify-content: space-between;
  padding: 0.5rem 0;
}
.summary-line.discount {
  color: #059669;
  font-weight: 500;
}
.summary-line.total {
  border-top: 2px solid #e2e8f0;
  padding-top: 1rem;
  margin-top: 0.5rem;
  font-size: 1.2rem;
  font-weight: 700;
}

/* Buttons */
.btn-primary {
  background: linear-gradient(135deg, #3b82f6, #2563eb);
  color: white;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  text-decoration: none;
  text-align: center;
  font-weight: 600;
  transition: all 0.2s;
  display: inline-block;
}
.btn-primary:hover {
  transform: translateY(-2px);
}
.checkout-btn {
  width: 100%;
  margin-top: 1rem;
  padding: 1rem;
  font-size: 1.1rem;
}
.btn-secondary {
  background: #f3f4f6;
  color: #1f2937;
  padding: 0.75rem;
  border-radius: 8px;
  display: block;
  text-align: center;
  font-weight: 600;
  margin-top: 0.5rem;
  transition: all 0.2s;
}
.btn-secondary:hover {
  background: #e5e7eb;
}

/* Loading & Error */
.loading-overlay {
  position: absolute;
  inset: 0;
  background: rgba(255, 255, 255, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10;
}
.loading-spinner {
  width: 3rem;
  height: 3rem;
  border: 3px solid #e2e8f0;
  border-top: 3px solid #3b82f6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}
@keyframes spin {
  0% { transform: rotate(0); }
  100% { transform: rotate(360deg); }
}
.error-message {
  position: fixed;
  top: 2rem;
  right: 2rem;
  background: #fee2e2;
  color: #dc2626;
  padding: 1rem 1.5rem;
  border-radius: 8px;
  border: 1px solid #fecaca;
  box-shadow: 0 4px 12px rgba(220, 38, 38, 0.15);
  z-index: 20;
  display: flex;
  align-items: center;
  gap: 1rem;
}
.error-close {
  background: none;
  border: none;
  color: #dc2626;
  font-size: 1.5rem;
  cursor: pointer;
}
</style>
