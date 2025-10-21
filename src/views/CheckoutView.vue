<template>

  <div class="checkout-page">
    <h1>Checkout</h1>

    <div class="checkout-grid">
      <div class="checkout-form">
        <h2>Shipping Information</h2>
        <form @submit.prevent="handleSubmit">
          <div class="form-group">
            <label for="fullName">Full Name</label>
            <input
              id="fullName"
              v-model="shippingInfo.fullName"
              class="form-input"
              :class="{ 'form-input-error': formErrors.fullName }"
              required
              aria-describedby="fullName-error"
            />
            <span v-if="formErrors.fullName" id="fullName-error" class="form-error">{{ formErrors.fullName }}</span>
          </div>

          <div class="form-group">
            <label for="address">Address</label>
            <input
              id="address"
              v-model="shippingInfo.address"
              class="form-input"
              :class="{ 'form-input-error': formErrors.address }"
              required
              aria-describedby="address-error"
            />
            <span v-if="formErrors.address" id="address-error" class="form-error">{{ formErrors.address }}</span>
          </div>

          <div class="form-group">
            <label for="city">City</label>
            <input
              id="city"
              v-model="shippingInfo.city"
              class="form-input"
              :class="{ 'form-input-error': formErrors.city }"
              required
              aria-describedby="city-error"
            />
            <span v-if="formErrors.city" id="city-error" class="form-error">{{ formErrors.city }}</span>
          </div>

          <div class="form-group">
            <label for="postalCode">Postal Code</label>
            <input
              id="postalCode"
              v-model="shippingInfo.postalCode"
              class="form-input"
              :class="{ 'form-input-error': formErrors.postalCode }"
              pattern="[0-9]{4}"
              maxlength="4"
              required
              aria-describedby="postalCode-error"
            />
            <span v-if="formErrors.postalCode" id="postalCode-error" class="form-error">{{ formErrors.postalCode }}</span>
          </div>

          <h2>Payment Method</h2>
          <div class="payment-methods" role="radiogroup" aria-labelledby="payment-method-label">
            <h3 id="payment-method-label" class="sr-only">Select Payment Method</h3>
            <label v-for="method in paymentMethods" :key="method" class="payment-method">
              <input
                type="radio"
                v-model="paymentMethod"
                :value="method"
                class="payment-radio"
                :aria-label="'Pay with ' + method"
              />
              {{ method }}
            </label>
          </div>

          <div v-if="orderError" class="order-error" role="alert">
            {{ orderError }}
          </div>

          <button
            type="submit"
            class="btn-primary"
            :disabled="processing || !isFormValid"
            :aria-label="processing ? 'Processing order...' : 'Place order'"
          >
            {{ processing ? 'Processing...' : 'Place Order' }}
          </button>
        </form>
      </div>

      <div class="order-summary">
        <h2>Order Summary</h2>

        <!-- Voucher slot -->
        <div class="voucher-slot">
          <label for="voucher">Voucher Code:</label>
          <input
            id="voucher"
            v-model="voucherCode"
            class="form-input"
            placeholder="Enter voucher code"
            :disabled="voucherApplying"
          />
          <button
            class="btn-primary"
            @click="applyVoucher"
            :disabled="voucherApplying || !voucherCode.trim()"
            :aria-label="voucherApplying ? 'Applying voucher...' : 'Apply voucher'"
          >
            {{ voucherApplying ? 'Applying...' : 'Apply Voucher' }}
          </button>
          <span v-if="voucherError" class="voucher-error" role="alert">{{ voucherError }}</span>
          <span v-if="voucherSuccess" class="voucher-success" role="status">{{ voucherSuccess }}</span>
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
          <span>R{{ (item.price ? item.price : 0).toFixed(2) }}</span>
          <span>{{ item.quantity }}</span>
          <span>R{{ ((item.price ? item.price : 0) * (item.quantity ? item.quantity : 0)).toFixed(2) }}</span>
        </div>

        <div class="summary-totals">
          <div class="summary-line">
            <span>Subtotal:</span>
            <span>R{{ cartSubtotal ? cartSubtotal : '0.00' }}</span>
          </div>
          <div v-if="cartDiscount > 0" class="summary-discount">
            <span>Discount:</span>
            <span>-R{{ cartDiscount ? cartDiscount : '0.00' }}</span>
          </div>
          <div class="summary-total">
            <span>Total:</span>
            <span>R{{ cartTotal ? cartTotal : '0.00' }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useCartStore } from '@/stores/cart'
import Auth from '@/stores/auth'
import { useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import api from '@/services/api'

const cartStore = useCartStore()
const router = useRouter()

// Reactive cart data with proper reactivity
const { cartItems, cartTotal, cartDiscount, cartSubtotal } = storeToRefs(cartStore)

// Initialize cart on component mount
onMounted(() => {
  cartStore.initializeCart()
})

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
const orderError = ref('')

// Form validation
const formErrors = ref({})

const validateForm = () => {
  const errors = {}

  if (!shippingInfo.value.fullName.trim()) {
    errors.fullName = 'Full name is required'
  }

  if (!shippingInfo.value.address.trim()) {
    errors.address = 'Address is required'
  }

  if (!shippingInfo.value.city.trim()) {
    errors.city = 'City is required'
  }

  if (!shippingInfo.value.postalCode.trim()) {
    errors.postalCode = 'Postal code is required'
  } else if (!/^\d{4}$/.test(shippingInfo.value.postalCode)) {
    errors.postalCode = 'Postal code must be 4 digits'
  }

  formErrors.value = errors
  return Object.keys(errors).length === 0
}

const isFormValid = computed(() => {
  return Object.keys(formErrors.value).length === 0 &&
         shippingInfo.value.fullName.trim() &&
         shippingInfo.value.address.trim() &&
         shippingInfo.value.city.trim() &&
         /^\d{4}$/.test(shippingInfo.value.postalCode)
})

// Watch form fields for real-time validation
watch(shippingInfo, () => {
  if (Object.keys(formErrors.value).length > 0) {
    validateForm()
  }
}, { deep: true })

// Voucher functionality
const voucherCode = ref('')
const voucherApplying = ref(false)
const voucherError = ref('')
const voucherSuccess = ref('')

const applyVoucher = async () => {
  if (!voucherCode.value.trim()) return

  voucherApplying.value = true
  voucherError.value = ''
  voucherSuccess.value = ''

  try {
    // Simulate API call for voucher validation
    await new Promise((resolve) => setTimeout(resolve, 800))

    // Use store action instead of direct mutation
    const success = cartStore.applyVoucher(voucherCode.value)

    if (success) {
      voucherSuccess.value = 'Voucher applied successfully!'
    } else {
      voucherError.value = 'Invalid voucher code'
    }
  } catch (error) {
    voucherError.value = 'Failed to apply voucher. Please try again.'
    console.error('Voucher error:', error)
  } finally {
    voucherApplying.value = false
  }
}

// Helper functions for enhanced error handling
const showStockError = (errorText) => {
  orderError.value = `Stock Error: ${errorText}\n\nSome items in your cart may no longer be available. Please review your cart and try again.`
}

const handleSubmit = async () => {
  // Validate form before submission
  if (!validateForm()) {
    return
  }

  if (!Auth.isAuthenticated()) {
    orderError.value = 'Please login to complete your order'
    setTimeout(() => {
      router.push('/login')
    }, 2000)
    return
  }

  if (cartItems.value.length === 0) {
    orderError.value = 'Your cart is empty'
    return
  }

  processing.value = true
  orderError.value = ''

  console.log('🚀 Placing order with simplified validation - backend will handle stock checks...')

  try {
    // Build correct order payload for backend
    const userId = localStorage.getItem('userId')
    if (!userId || isNaN(parseInt(userId))) {
      orderError.value = 'User not found. Please login again.'
      setTimeout(() => {
        router.push('/login')
      }, 2000)
      processing.value = false
      return
    }

    // Ensure cart totals are calculated
    cartStore.calculateTotal()

    // Calculate totals manually to ensure accuracy
    const subtotal = cartItems.value.reduce((sum, item) => {
      const price = parseFloat(item.price) || 0
      const quantity = parseInt(item.quantity) || 0
      return sum + (price * quantity)
    }, 0)

    const discount = parseFloat(cartDiscount.value) || 0
    const finalTotal = subtotal - discount

    // Validate order items according to backend requirements
    const validOrderItems = cartItems.value.filter(item => {
      const hasValidId = item.id !== null && item.id !== undefined && !isNaN(parseInt(item.id))
      const hasValidPrice = !isNaN(parseFloat(item.price)) && parseFloat(item.price) > 0
      const hasValidQuantity = !isNaN(parseInt(item.quantity)) && parseInt(item.quantity) > 0
      return hasValidId && hasValidPrice && hasValidQuantity
    }).map(item => ({
      productId: parseInt(item.id),        // Long - Required
      quantity: parseInt(item.quantity),   // int - Required, must be positive
      price: parseFloat(item.price)        // BigDecimal - Required, must be positive
    }))

    if (validOrderItems.length === 0) {
      orderError.value = 'No valid items in cart. Please refresh and try again.'
      processing.value = false
      return
    }

    // Build order payload exactly as expected by backend OrderDto
    const orderData = {
      userId: parseInt(userId),            // Long - Required
      status: "pending",                   // String - Optional (will default to "pending")
      totalPrice: finalTotal,              // Double - Optional
      orderItems: validOrderItems          // Array - Required, must contain at least one item
    }

    console.log('Sending order data:', orderData)

    // Note: Shipping info collected but not sent to backend in this version
    // Future enhancement: Store shipping info separately or extend backend OrderDto
    console.log('Shipping info (for future use):', {
      fullName: shippingInfo.value.fullName.trim(),
      address: shippingInfo.value.address.trim(),
      city: shippingInfo.value.city.trim(),
      postalCode: shippingInfo.value.postalCode.trim(),
      country: shippingInfo.value.country,
      paymentMethod: paymentMethod.value
    })

    // Send order to backend
    const response = await api.createOrder(orderData)
    console.log('Order created successfully:', response)

    // Clear cart after successful order
    cartStore.clearCart()

    // Redirect to confirmation page
    router.push('/order-confirmation/success')
  } catch (error) {
    console.error('Full order error:', error)

    // More detailed error handling
    if (error.response) {
      // Server responded with error status
      const status = error.response.status
      const errorData = error.response.data

      console.error('Server error response:', errorData)

      if (status === 400) {
        const errorText = typeof errorData === 'string' ? errorData : (errorData.message || 'Validation failed')

        // Enhanced stock error handling
        if (errorText.includes('Insufficient stock') || errorText.includes('stock')) {
          showStockError(errorText)
        } else if (errorText.includes('Product with ID') && errorText.includes('not found')) {
          orderError.value = 'Some products in your cart are no longer available. Please refresh your cart and try again.'
        } else {
          orderError.value = `Order validation failed: ${errorText}`
        }
      } else if (status === 401) {
        orderError.value = 'Session expired. Please login again.'
        setTimeout(() => {
          Auth.logout()
          router.push('/login')
        }, 2000)
      } else if (status === 500) {
        orderError.value = 'Server error. Please try again later.'
      } else {
        orderError.value = `Failed to place order (${status}). Please try again.`
      }
    } else if (error.request) {
      // Network error
      orderError.value = 'Network error. Please check your connection and try again.'
    } else {
      // Other error
      orderError.value = error.message || 'Failed to place order. Please try again.'
    }
  } finally {
    processing.value = false
  }
}
</script>

<style scoped>
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
  padding: 0.75rem;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  cursor: pointer;
  transition: border-color 0.2s;
}

.payment-method:hover {
  border-color: var(--primary, #3b82f6);
}

.payment-method:has(input:checked) {
  border-color: var(--primary, #3b82f6);
  background-color: rgba(59, 130, 246, 0.1);
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
}

.summary-discount {
  color: #059669;
  font-weight: 600;
}

.summary-total {
  font-weight: bold;
  font-size: 1.2rem;
  border-top: 1px solid #e2e8f0;
  margin-top: 0.5rem;
  padding-top: 1rem;
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

@media (max-width: 1024px) {
  .summary-header,
  .summary-item {
    grid-template-columns: 1fr 1fr 80px 60px 80px;
    font-size: 0.8rem;
  }
}

@media (max-width: 768px) {
  .checkout-page {
    padding: 1rem;
  }

  .checkout-form,
  .order-summary {
    padding: 1rem;
  }

  .summary-header,
  .summary-item {
    grid-template-columns: 2fr 1fr 1fr;
    gap: 0.25rem;
  }

  .summary-header span:nth-child(2),
  .summary-header span:nth-child(4),
  .summary-item span:nth-child(2),
  .summary-item span:nth-child(4) {
    display: none;
  }
}

</style>

