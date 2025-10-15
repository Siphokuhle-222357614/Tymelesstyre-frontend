import { createRouter, createWebHistory } from 'vue-router';
import HomeView from '../views/HomeView.vue';
import LoginView from '../views/LoginView.vue';
import RegisterView from '../views/RegisterView.vue';
import AdminUsersManagement from '../views/admin/AdminUsersManagement.vue';
import CartView from '../views/CartView.vue';
import auth from '../stores/auth.js';

const routes = [
  { path: '/', name: 'home', component: HomeView },
  { path: '/login', name: 'login', component: LoginView },
  { path: '/register', name: 'register', component: RegisterView },
  { path: '/cart', name: 'cart', component: CartView },

  
  {
    path: '/admin/users',
    name: 'admin-users',
    component: AdminUsersManagement,
    meta: { requiresAdmin: true },
  },

  
  { path: '/:pathMatch(.*)*', redirect: '/' },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});


router.beforeEach((to, from, next) => {
  if (to.meta.requiresAdmin) {
    if (!auth.isAuthenticated()) {
      next('/login');
    } else if (!auth.isAdmin()) {
      next('/');
    } else {
      next();
    }
  } else {
    next();
  }
});

export default router;
