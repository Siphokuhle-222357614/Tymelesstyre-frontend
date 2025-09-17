<template>
  <div class="checkoutView">
    <h1>Checkout</h1>

    <div class="checkout-grid">
      <div class="checkout-form">
        <h2>Shipping Information</h2>
        <form @submit.prevent="handleSubmit">
          <div class="form-group">
            <label>Full Name</label>
            <input v-model="shippingInfo.fullName" class="form-input" required />
          </div>

          <div class="form-group">
            <label>Address</label>
            <input v-model="shippingInfo.address" class="form-input" required />
          </div>

          <div class="form-group">
            <label>City</label>
            <input v-model="shippingInfo.city" class="form-input" required />
          </div>

          <div class="form-group">
            <label>Postal Code</label>
            <input v-model="shippingInfo.postalCode" class="form-input" required />
          </div>

          <h2>Payment Method</h2>
          <div class="payment-methods">
            <label v-for="method in paymentMethods" :key="method" class="payment-method">
              <input type="radio" v-model="paymentMethod" :value="method" class="payment-radio" />
              {{ method }}
            </label>
          </div>

          <button type="submit" class="btn-primary" :disabled="processing">
            {{ processing ? 'Processing...' : 'Place Order' }}
          </button>
        </form>
      </div>

      <div class="order-summary">
        <h2>Order Summary</h2>

        <!-- Voucher slot -->
        <div class="voucher-slot">
          <label for="voucher">Voucher Code:</label>
          <input id="voucher" v-model="voucherCode" class="form-input" placeholder="Enter voucher code" />
          <button class="btn-primary" @click="applyVoucher" :disabled="voucherApplying">
            {{ voucherApplying ? 'Applying...' : 'Apply Voucher' }}
          </button>
          <span v-if="voucherError" class="voucher-error">{{ voucherError }}</span>
        </div>

        <div class="summary-header">
          <span>Product</span>
          <span>Description</span>
          <span>Price</span>
          <span>Quantity</span>
          <span>Subtotal</span>
        </div>

        <div v-for="item in cartItems" :key="item.id" class="summary-item">
          <span>{{ item.brand }} {{ item.model }}</span>
          <span>{{ item.description || 'No description' }}</span>
          <span>R{{ item.price.toFixed(2) }}</span>
          <span>{{ item.quantity }}</span>
          <span>R{{ (item.price * item.quantity).toFixed(2) }}</span>
        </div>
        <div class="summary-total">
          <strong>Subtotal: R{{ cartSubtotal }}</strong>
        </div>
        <div v-if="cartDiscount > 0" class="summary-discount">
          <strong>Discount: -R{{ cartDiscount }}</strong>
        </div>
        <div class="summary-total">
          <strong>Total: R{{ cartTotal }}</strong>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useCartStore } from '@/stores/cart'
import { useAuthStore } from '@/stores/auth'
import { useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'

const cartStore = useCartStore()
const authStore = useAuthStore()
const router = useRouter()

// Reactive cart data with proper reactivity
const { cartItems, cartTotal, cartDiscount, cartSubtotal } = storeToRefs(cartStore)

const shippingInfo = ref({
  fullName: '',
  address: '',
  city: '',
  postalCode: '',
  country: 'South Africa',
})

const paymentMethod = ref('Credit Card')
const paymentMethods = ['Credit Card', 'Debit Card', 'PayPal', 'Cash on Delivery']
const processing = ref(false)

const voucherCode = ref('')
const voucherApplying = ref(false)
const voucherError = ref('')
//const voucherSuccess = ref('')

const applyVoucher = async () => {
  if (!voucherCode.value.trim()) return

  voucherApplying.value = true
  voucherError.value = ''
  // Simulate voucher validation
  await new Promise((resolve) => setTimeout(resolve, 500))
  if (voucherCode.value === 'DISCOUNT10') {
    // Example: apply 10% discount
    cartStore.applyDiscount(cartStore.cartSubtotal * 0.1)
    voucherError.value = ''
  } else {
    voucherError.value = 'Invalid voucher code'
  }
  voucherApplying.value = false
}

const handleSubmit = async () => {
  // Validate form before submission
  // eslint-disable-next-line no-undef
  if (!validateForm()) {
    return
  }

  if (!authStore.isAuthenticated) {
    alert('Please login to complete your order')
    router.push('/login')
    return
  }

  processing.value = true
  // eslint-disable-next-line no-undef
  orderError.value = ''

  try {
    const orderData = {
      userId: authStore.user.id,
      items: cartItems,
      shippingAddress: shippingInfo.value,
      paymentMethod: paymentMethod.value,
      totalAmount: parseFloat(cartTotal),
    }

    // Simulate API call for now
    console.log('Order data would be sent to backend:', orderData)
    await new Promise((resolve) => setTimeout(resolve, 1000)) // Simulate API delay

    // Clear cart after successful order
    cartStore.clearCart()

    // Redirect to confirmation page
    router.push('/order-confirmation/success')
  } catch (error) {
    alert('Failed to place order. Please try again.')
    console.error('Order error:', error)
  } finally {
    processing.value = false
  }
}
</script>

<style scoped>
/* Add styles for voucher slot and summary header */
.voucher-slot {
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  gap: 1rem;
}
.voucher-error {
  color: rgba(133, 131, 131, 0.614);
  margin-left: 1rem;
}
.summary-header {
  display: grid;
  grid-template-columns: 2fr 2fr 1fr 1fr 1fr;
  font-weight: bold;
  padding: 0.5rem 0;
  border-bottom: 2px solid #e2e8f0;
  margin-bottom: 0.5rem;
}
.summary-item {
  display: grid;
  grid-template-columns: 2fr 2fr 1fr 1fr 1fr;
  align-items: center;
  padding: 0.5rem 0;
  border-bottom: 1px solid #e2e8f0;
}
.summary-discount {
  color: rgb(8, 102, 217);
  font-weight: bold;
  margin-top: 0.5rem;
}
.checkout-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

.checkout-grid {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 2rem;
  margin-top: 2rem;
}

@media (max-width: 768px) {
  .checkout-grid {
    grid-template-columns: 1fr;
  }
}

.checkout-form {
  background: white;
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.order-summary {
  background: white;
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  height: fit-content;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 600;
}

.form-input {
  width: 100%;
  padding: 0.75rem;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  font-size: 1rem;
  transition: border-color 0.2s;
}

.form-input:focus {
  outline: none;
  border-color: var(--primary, #3b82f6);
}

.form-input-error {
  border-color: #ef4444;
}

.form-error {
  display: block;
  color: #ef4444;
  font-size: 0.875rem;
  margin-top: 0.25rem;
}

.payment-methods {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin: 1rem 0;
}

.payment-method {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  cursor: pointer;
  transition: border-color 0.2s;
}

.payment-method:hover {
  border-color: var(--primary);
}

.payment-radio {
  margin: 0;
}

.btn-primary {
  background-color: var(--primary, #3b82f6);
  color: white;
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s;
  width: 100%;
}

.btn-primary:hover:not(:disabled) {
  background-color: var(--primary-dark, #2563eb);
}

.btn-primary:disabled {
  background-color: #9ca3af;
  cursor: not-allowed;
}

.order-error {
  background-color: #fef2f2;
  border: 1px solid #fecaca;
  color: #dc2626;
  padding: 0.75rem;
  border-radius: 8px;
  margin-bottom: 1rem;
}

.voucher-slot {
  margin-bottom: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.voucher-slot label {
  font-weight: 600;
}

.voucher-slot .form-input {
  margin-bottom: 0.5rem;
}

.voucher-slot .btn-primary {
  align-self: flex-start;
  width: auto;
  padding: 0.5rem 1rem;
  font-size: 0.875rem;
}

.voucher-error {
  color: #ef4444;
  font-size: 0.875rem;
}

.voucher-success {
  color: #059669;
  font-size: 0.875rem;
}

.summary-header {
  display: grid;
  grid-template-columns: 2fr 2fr 1fr 1fr 1fr;
  gap: 0.5rem;
  font-weight: bold;
  padding: 0.75rem 0;
  border-bottom: 2px solid #e2e8f0;
  margin-bottom: 0.5rem;
  font-size: 0.875rem;
}

.summary-item {
  display: grid;
  grid-template-columns: 2fr 2fr 1fr 1fr 1fr;
  gap: 0.5rem;
  align-items: center;
  padding: 0.75rem 0;
  border-bottom: 1px solid #e2e8f0;
  font-size: 0.875rem;
}

.summary-totals {
  margin-top: 1.5rem;
  padding-top: 1rem;
  border-top: 2px solid #e2e8f0;
}

.summary-line,
.summary-discount,
.summary-total {
  display: flex;
  justify-content: space-between;
  padding: 0.5rem 0;
  border-bottom: 1px solid #e2e8f0;
}

.summary-total {
  display: flex;
  justify-content: space-between;
  padding: 1rem 0;
  border-top: 2px solid #e2e8f0;
  margin-top: 1rem;
  font-size: 1.2rem;
}
</style>

