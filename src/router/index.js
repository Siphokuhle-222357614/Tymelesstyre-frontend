import { createRouter, createWebHistory } from 'vue-router';
import HomeView from '../views/HomeView.vue';
import LoginView from '../views/LoginView.vue';
import RegisterView from '../views/RegisterView.vue';
import AdminUsersManagement from '../views/admin/AdminUsersManagement.vue';
import CartView from '../views/CartView.vue';
import ProfileView from '../views/ProfileView.vue';
import PersonalDetails from '../views/PersonalDetails.vue';
import AddressBook from '../views/AddressBook.vue';
import AdminOrdersView from '../views/admin/OrdersView.vue';
import CustomerOrdersView from '../views/CustomerOrdersView.vue';
import ProductsView from '@/views/ProductsView.vue';
import AdminProductsView from '../views/admin/ProductsView.vue';
import auth from '../stores/auth.js';
import CheckoutView from '../views/CheckoutView.vue';

const routes = [
  { path: '/', name: 'home', component: HomeView },
  { path: '/login', name: 'login', component: LoginView },
  { path: '/register', name: 'register', component: RegisterView },
  { path: '/cart', name: 'cart', component: CartView },
  { path: '/products', name: 'products', component: ProductsView },
  { path: '/checkout', name: 'checkout', component: CheckoutView },
  {
    path: '/admin/products',
    name: 'admin-products',
    component: AdminProductsView,
    meta: { requiresAdmin: true },
  },
  {
    path: '/admin/orders',
    name: 'admin-orders',
    component: AdminOrdersView,
    meta: { requiresAdmin: true },
  },

   {
    path: '/profile',
    name: 'profile',
    component: ProfileView,
    meta: { requiresAuth: true },
    children: [
      { path: '', redirect: '/profile/personal-details' },
      { path: 'personal-details', name: 'personal-details', component: PersonalDetails },
      { path: 'address-book', name: 'address-book', component: AddressBook },
      { path: 'orders', name: 'orders', component: CustomerOrdersView },
    ],
  },

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
  } else if (to.meta.requiresAuth) {
    if (!auth.isAuthenticated()) {
      next('/login');
    } else {
      next();
    }
  } else {
    next();
  }
});

export default router;
