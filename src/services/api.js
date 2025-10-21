

import axios from 'axios'

const API_BASE_URL = 'http://localhost:8080/tymelesstyre'

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Add request interceptor for auth tokens if needed
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    console.log('API Request:', config.method?.toUpperCase(), config.url, config.data)
    return config
  },
  (error) => {
    console.error('Request interceptor error:', error)
    return Promise.reject(error)
  },
)

// Add response interceptor for better error handling
api.interceptors.response.use(
  (response) => {
    console.log('API Response:', response.status, response.config.url, response.data)
    return response
  },
  (error) => {
    console.error('API Error Response:', {
      status: error.response?.status,
      statusText: error.response?.statusText,
      url: error.config?.url,
      data: error.response?.data,
      message: error.message
    })
    return Promise.reject(error)
  }
)

// API methods
export default {
  // ===========================
  // USER MANAGEMENT ENDPOINTS
  // ===========================

  // Register a new user
  async registerUser(userData) {
    const response = await api.post('/user/register', userData)
    return response.data
  },

  // Login user
  async login(credentials) {
    const response = await api.post('/user/login', credentials)
    return response.data
  },

  // Get current user profile (using JWT token)
  async getCurrentUserProfile() {
    const response = await api.get('/user/profile')
    return response.data
  },

  // Get user by username
  async getUserByUsername(username) {
    const response = await api.get(`/user/readByUsername/${encodeURIComponent(username)}`)
    return response.data
  },

  // Get user by ID
  async getUserById(userId) {
    const response = await api.get(`/user/read/${userId}`)
    return response.data
  },

  // Update user profile
  async updateUser(userId, userData) {
    const response = await api.put(`/user/update/${userId}`, userData)
    return response.data
  },

  // Change user password
  async changePassword(userId, passwordData) {
    const response = await api.put(`/user/change-password/${userId}`, passwordData)
    return response.data
  },

  // Admin: Get all users
  async getAllUsers() {
    const response = await api.get('/user/getAll')
    return response.data
  },

  // Admin: Create user
  async createUser(userData) {
    const response = await api.post('/user/create', userData)
    return response.data
  },

  // Admin: Delete user
  async deleteUser(userId) {
    const response = await api.delete(`/user/delete/${userId}`)
    return response.data
  },

  // ===========================
  // ORDER MANAGEMENT ENDPOINTS
  // ===========================

  // Create a new order
  async createOrder(orderData) {
    const response = await api.post('/api/orders', orderData)
    return response.data
  },

  // Get current user's orders (customer)
  async getMyOrders() {
    const response = await api.get('/api/orders/my-orders')
    return response.data
  },

  // Get order by ID (with permission check)
  async getOrderById(orderId) {
    const response = await api.get(`/api/orders/${orderId}`)
    return response.data
  },

  // Update order
  async updateOrder(orderId, orderData) {
    const response = await api.put(`/api/orders/${orderId}`, orderData)
    return response.data
  },

  // Admin: Get all orders
  async getAllOrdersForAdmin() {
    const response = await api.get('/api/orders/all')
    return response.data
  },

  // Admin: Get orders by user ID
  async getOrdersByUserId(userId) {
    const response = await api.get(`/api/orders/user/${userId}`)
    return response.data
  },

  // Admin: Get orders by status
  async getOrdersByStatus(status) {
    const response = await api.get(`/api/orders/status/${status}`)
    return response.data
  },

  // Admin: Delete order
  async deleteOrder(orderId) {
    const response = await api.delete(`/api/orders/${orderId}`)
    return response.data
  },

  // Admin: Update order status
  async updateOrderStatus(orderId, status) {
    const response = await api.put(`/api/orders/${orderId}/status`, { status })
    return response.data
  },

  // ===========================
  // PRODUCT ENDPOINTS
  // ===========================
  async getAllProducts() {
    const response = await api.get('/api/products')
    return response.data
  },

  async createProductWithImage(formData) {
    const response = await api.post('/api/products/create-with-image', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
    return response.data
  },

  async deleteProduct(productId) {
    const response = await api.delete(`/api/products/${productId}`)
    return response.data
  },

  async updateProduct(productId, productData) {
    const response = await api.put(`/api/products/${productId}`, productData)
    return response.data
  },

  async getTyreById(id) {
    const response = await api.get(`/api/tyres/${id}`)
    return response.data
  },

  async createTyre(tyreData) {
    const response = await api.post('/api/tyres', tyreData)
    return response.data
  },

  async createTyresBulk(tyresData) {
    const response = await api.post('/api/tyres/bulk', tyresData)
    return response.data
  },

  // ===========================
  // LEGACY ENDPOINTS (to be removed)
  // ===========================

  // Health check
  async healthCheck() {
    try {
      const response = await api.get('/tyres')
      return response.status === 200
    } catch {
      return false
    }
  },
}









