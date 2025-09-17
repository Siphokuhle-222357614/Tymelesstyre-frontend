import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useCartStore = defineStore('cart', () => {
  const cartItems = ref([])
  const discount = ref(0)

  const cartSubtotal = computed(() =>
    cartItems.value.reduce((total, item) => total + (item.price * item.quantity), 0)
  )

  const cartDiscount = computed(() => discount.value)

  const cartTotal = computed(() => cartSubtotal.value - discount.value)

  const addToCart = (product) => {
    const existingItem = cartItems.value.find(item => item.id === product.id)
    if (existingItem) {
      existingItem.quantity += 1
    } else {
      cartItems.value.push({ ...product, quantity: 1 })
    }
  }

  const removeFromCart = (productId) => {
    cartItems.value = cartItems.value.filter(item => item.id !== productId)
  }

  const updateQuantity = (productId, newQuantity) => {
    const item = cartItems.value.find(item => item.id === productId)
    if (item) {
      item.quantity = newQuantity
    }
  }

  const clearCart = () => {
    cartItems.value = []
    discount.value = 0
  }

  const applyDiscount = (amount) => {
    discount.value = amount
  }

  return {
    cartItems,
    discount,
    cartSubtotal,
    cartDiscount,
    cartTotal,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    applyDiscount
  }
})
