<template>
  <header class="app-header">
    <div class="container">
      <div class="logo">
        <h1>🚗 Tymeless Tyre</h1>
      </div>

      <nav class="navigation">
        <router-link to="/" class="nav-link">Home</router-link>
        <router-link to="/products" class="nav-link">Products</router-link>      
        <router-link to="/login" class="nav-link">Login</router-link>       

        <router-link to="/cart" class="nav-link">🛒 Cart ({{ cartItemCount }})</router-link>

        <!-- Profile icon -->
        <router-link v-if="isLoggedIn" to="/profile" class="profile-link">
          <svg class="profile-icon" viewBox="0 0 24 24">
            <path d="M12 12c2.7 0 5-2.3 5-5s-2.3-5-5-5-5 2.3-5 5 2.3 5 5 5zm0 2c-3.3 0-10 1.7-10 5v3h20v-3c0-3.3-6.7-5-10-5z"/>
          </svg>
        </router-link>
      </nav>
    </div>
  </header>
</template>

<script setup>
import { ref } from 'vue'
import { useCartStore } from '@/stores/cart'
import { storeToRefs } from 'pinia'
import auth from '@/stores/auth.js'

const cartStore = useCartStore()
const { itemCount } = storeToRefs(cartStore)
const cartItemCount = itemCount

const isLoggedIn = ref(auth.isAuthenticated())
</script>

<style scoped>
/* Header Container */
.app-header {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
  padding: 1rem 0;
  position: sticky;
  top: 0;
  z-index: 100;
}

/* Inner container to space logo and nav */
.container {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between; /* logo left, nav right */
  align-items: center;
  padding: 0 20px;
}

/* Logo */
.logo h1 {
  background: linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  font-size: 1.8rem;
  font-weight: 700;
  margin: 0;
}

/* Navigation */
.navigation {
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

/* Standard nav links */
.nav-link {
  text-decoration: none;
  color: var(--dark);
  font-weight: 500;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  transition: all 0.3s ease;
}

.nav-link:hover {
  background: rgba(37, 99, 235, 0.1);
  color: var(--primary);
}

.nav-link.router-link-active {
  background: var(--primary);
  color: white;
}

/* Cart icon */
.nav-link svg {
  margin-right: 5px;
}

/* Profile link */
.profile-link {
  display: flex;
  align-items: center;
}

.profile-icon {
  width: 28px; /* slightly bigger than 24px for better visibility */
  height: 28px;
  fill: var(--primary);
  cursor: pointer;
  transition: transform 0.2s ease, fill 0.2s ease;
}

.profile-icon:hover {
  transform: scale(1.1);
  fill: var(--primary-dark);
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .container {
    flex-direction: column;
    align-items: flex-start;
  }
  .navigation {
    gap: 1rem;
    margin-top: 0.5rem;
  }
}
</style>

