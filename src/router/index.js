import { createRouter, createWebHistory } from 'vue-router'
import CheckoutView from '../views/CheckoutView.vue'
import { useAuthStore } from '@/stores/auth'

const routes = [
  {
    path: '/checkout',
    name: 'Checkout',
    component: CheckoutView,
    meta: { requiresAuth: true }
  },
  //{
    //path: '/Login',
    //name: 'Login',
    //component: () => import('@/components/Login.vue')
  //},
  //{
    //path: '/order-confirmation/:status',
    //name: 'OrderConfirmation',
    //component: () => import('@/components/OrderConfirmation.vue')
  //}
  // Add other routes as needed
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// Navigation guard for authentication
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()

  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    next('/login')
  } else {
    next()
  }
})

export default router
