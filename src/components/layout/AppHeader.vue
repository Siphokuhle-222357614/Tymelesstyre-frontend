<template>
  <header class="app-header">
    <div class="container">
      <div class="logo">
        <h1>🚗 Tymeless Tyre</h1>
      </div>

      <nav class="navigation">
        <router-link to="/" class="nav-link">Home</router-link>
        <router-link to="/products" class="nav-link">Products</router-link>

        <router-link v-if="!isLoggedIn" to="/login" class="nav-link">Login</router-link>

        <router-link to="/cart" class="nav-link">🛒 Cart ({{ cartItemCount }})</router-link>

        <div v-if="isLoggedIn" class="profile-dropdown">
          <svg class="profile-icon" @click="toggleDropdown" viewBox="0 0 24 24">
            <path
              d="M12 12c2.7 0 5-2.3 5-5s-2.3-5-5-5-5 2.3-5 5 2.3 5 5 5zm0 2c-3.3 0-10 1.7-10 5v3h20v-3c0-3.3-6.7-5-10-5z"
            />
          </svg>

          <div v-if="showDropdown" class="dropdown-menu">
            <router-link to="/profile" class="dropdown-item">Profile</router-link>
            <button class="dropdown-item logout-btn" @click="handleLogout">Logout</button>
          </div>
        </div>
      </nav>
    </div>
  </header>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useCartStore } from '@/stores/cart'
import { storeToRefs } from 'pinia'
import auth from '@/stores/auth.js' 

const router = useRouter()
const cartStore = useCartStore()
const { itemCount } = storeToRefs(cartStore)
const cartItemCount = itemCount

const isLoggedIn = ref(auth.isAuthenticated())
const showDropdown = ref(false)

onMounted(() => {
  const updateAuth = () => {
    isLoggedIn.value = auth.isAuthenticated()
  }

  window.addEventListener('auth-change', updateAuth)
  window.addEventListener('storage', updateAuth)

  onUnmounted(() => {
    window.removeEventListener('auth-change', updateAuth)
    window.removeEventListener('storage', updateAuth)
  })
})


function handleLogout() {
  auth.logout()
  showDropdown.value = false
  router.push('/login')
}

function toggleDropdown() {
  showDropdown.value = !showDropdown.value
}
</script>

<style scoped>
.app-header {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
  padding: 1rem 0;
  position: sticky;
  top: 0;
  z-index: 100;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between; 
  align-items: center;
  padding: 0 20px;
}

.logo h1 {
  background: linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  font-size: 1.8rem;
  font-weight: 700;
  margin: 0;
}

.navigation {
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

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


.profile-dropdown {
  position: relative;
  display: flex;
  align-items: center;
}

.profile-icon {
  width: 28px; 
  height: 28px;
  fill: var(--primary);
  cursor: pointer;
  transition: transform 0.2s ease, fill 0.2s ease;
}

.profile-icon:hover {
  transform: scale(1.1);
  fill: var(--primary-dark);
}

.dropdown-menu {
  position: absolute;
  top: 2.5rem;
  right: 0;
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 10px rgba(0,0,0,0.1);
  display: flex;
  flex-direction: column;
  min-width: 140px;
  overflow: hidden;
  z-index: 200;
}

.dropdown-item {
  padding: 0.8rem 1rem;
  text-align: left;
  background: none;
  border: none;
  width: 100%;
  font-size: 0.95rem;
  color: #333;
  text-decoration: none;
  cursor: pointer;
}

.dropdown-item:hover {
  background-color: #f3f3f3;
}

.logout-btn {
  color: #d9534f;
  font-weight: 600;
}

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
