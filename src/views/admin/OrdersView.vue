<template>
  <div class="orders-view">
    <div class="orders-header">
      <h1>Order Management</h1>
      <div class="orders-stats">
        <div class="stat-card">
          <h3>Total Orders</h3>
          <p>{{ orders.length }}</p>
        </div>
        <div class="stat-card">
          <h3>Pending Orders</h3>
          <p>{{ orders.filter(o => o.status === 'PENDING').length }}</p>
        </div>
        <div class="stat-card">
          <h3>Completed Orders</h3>
          <p>{{ orders.filter(o => o.status === 'COMPLETED').length }}</p>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="loading-container">
      <div class="loading-spinner"></div>
      <p>Loading orders...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="error-container">
      <h3>Error Loading Orders</h3>
      <p>{{ error }}</p>
      <button @click="fetchOrders" class="btn-retry">Try Again</button>
    </div>

    <!-- Orders Table -->
    <div v-else-if="orders.length > 0" class="orders-table-container">
      <div class="table-controls">
        <input 
          v-model="searchTerm" 
          placeholder="Search orders..." 
          class="search-input"
        />
        <select v-model="statusFilter" class="status-filter">
          <option value="">All Statuses</option>
          <option value="PENDING">Pending</option>
          <option value="PROCESSING">Processing</option>
          <option value="SHIPPED">Shipped</option>
          <option value="COMPLETED">Completed</option>
          <option value="CANCELLED">Cancelled</option>
        </select>
      </div>

      <table class="orders-table">
        <thead>
          <tr>
            <th>Order ID</th>
            <th>Customer</th>
            <th>Date</th>
            <th>Status</th>
            <th>Items</th>
            <th>Total</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="order in filteredOrders" :key="order.orderId" class="order-row">
            <td class="order-id">#{{ order.orderId }}</td>
            <td class="customer-info">
              <div>{{ order.user?.name }} {{ order.user?.surname }}</div>
              <small>{{ order.user?.email }}</small>
            </td>
            <td class="order-date">{{ formatDate(order.orderDate) }}</td>
            <td class="order-status">
              <select 
                v-model="order.status" 
                @change="updateOrderStatus(order.orderId, order.status)"
                class="status-select"
                :class="'status-' + order.status.toLowerCase()"
              >
                <option value="PENDING">Pending</option>
                <option value="PROCESSING">Processing</option>
                <option value="SHIPPED">Shipped</option>
                <option value="COMPLETED">Completed</option>
                <option value="CANCELLED">Cancelled</option>
              </select>
            </td>
            <td class="order-items">{{ order.orderItems?.length || 0 }} items</td>
            <td class="order-total">R{{ (order.totalPrice || 0).toFixed(2) }}</td>
            <td class="order-actions">
              <button @click="viewOrderDetails(order)" class="btn-view">View</button>
              <button @click="deleteOrder(order.orderId)" class="btn-delete">Delete</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Empty State -->
    <div v-else class="empty-state">
      <h3>No Orders Found</h3>
      <p>There are no orders in the system yet.</p>
    </div>

    <!-- Order Details Modal -->
    <div v-if="selectedOrder" class="modal-overlay" @click="closeModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h2>Order Details - #{{ selectedOrder.orderId }}</h2>
          <button @click="closeModal" class="modal-close">&times;</button>
        </div>
        <div class="modal-body">
          <div class="order-info">
            <div class="info-section">
              <h3>Customer Information</h3>
              <p><strong>Name:</strong> {{ selectedOrder.user?.name }} {{ selectedOrder.user?.surname }}</p>
              <p><strong>Email:</strong> {{ selectedOrder.user?.email }}</p>
              <p><strong>Phone:</strong> {{ selectedOrder.user?.phoneNumber || 'Not provided' }}</p>
            </div>
            <div class="info-section">
              <h3>Order Information</h3>
              <p><strong>Date:</strong> {{ formatDate(selectedOrder.orderDate) }}</p>
              <p><strong>Status:</strong> {{ selectedOrder.status }}</p>
              <p><strong>Total:</strong> R{{ (selectedOrder.totalPrice || 0).toFixed(2) }}</p>
            </div>
          </div>
          <div class="order-items-section">
            <h3>Order Items</h3>
            <table class="items-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Quantity</th>
                  <th>Price</th>
                  <th>Subtotal</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="item in selectedOrder.orderItems" :key="item.orderItemId">
                  <td>{{ item.product?.productName || 'Unknown Product' }}</td>
                  <td>{{ item.quantity }}</td>
                  <td>R{{ (item.price || 0).toFixed(2) }}</td>
                  <td>R{{ ((item.price || 0) * (item.quantity || 0)).toFixed(2) }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import api from '@/services/api'

// Reactive data
const orders = ref([])
const loading = ref(false)
const error = ref('')
const searchTerm = ref('')
const statusFilter = ref('')
const selectedOrder = ref(null)

// Computed properties
const filteredOrders = computed(() => {
  let filtered = orders.value

  // Filter by search term
  if (searchTerm.value) {
    const term = searchTerm.value.toLowerCase()
    filtered = filtered.filter(order => 
      order.orderId.toString().includes(term) ||
      (order.user?.name || '').toLowerCase().includes(term) ||
      (order.user?.email || '').toLowerCase().includes(term)
    )
  }

  // Filter by status
  if (statusFilter.value) {
    filtered = filtered.filter(order => order.status === statusFilter.value)
  }

  return filtered
})

// Methods
const fetchOrders = async () => {
  loading.value = true
  error.value = ''
  
  try {
    console.log('Fetching all orders for admin...')
    const response = await api.getAllOrdersForAdmin()
    orders.value = response.data || []
    console.log('Orders fetched successfully:', orders.value.length, 'orders')
  } catch (err) {
    console.error('Error fetching orders:', err)
    error.value = err.response?.data?.message || 'Failed to load orders'
  } finally {
    loading.value = false
  }
}

const updateOrderStatus = async (orderId, newStatus) => {
  try {
    console.log(`Updating order ${orderId} status to ${newStatus}`)
    await api.updateOrderStatus(orderId, newStatus)
    console.log('Order status updated successfully')
    // No need to refetch - the status is already updated in the UI
  } catch (err) {
    console.error('Error updating order status:', err)
    // Revert the status change in the UI
    const order = orders.value.find(o => o.orderId === orderId)
    if (order) {
      // This will trigger a re-render and revert the select
      await fetchOrders()
    }
    alert('Failed to update order status')
  }
}

const deleteOrder = async (orderId) => {
  if (!confirm('Are you sure you want to delete this order? This action cannot be undone.')) {
    return
  }

  try {
    console.log(`Deleting order ${orderId}`)
    await api.deleteOrder(orderId)
    console.log('Order deleted successfully')
    
    // Remove from local array
    orders.value = orders.value.filter(order => order.orderId !== orderId)
  } catch (err) {
    console.error('Error deleting order:', err)
    alert('Failed to delete order: ' + (err.response?.data?.message || 'Unknown error'))
  }
}

const viewOrderDetails = (order) => {
  selectedOrder.value = order
}

const closeModal = () => {
  selectedOrder.value = null
}

const formatDate = (dateString) => {
  if (!dateString) return 'Unknown'
  
  try {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-ZA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  } catch (error) {
    console.error('Error formatting date:', error)
    return 'Invalid Date'
  }
}

// Lifecycle
onMounted(() => {
  fetchOrders()
})
</script>

<style scoped>
.orders-view {
  padding: 2rem;
  max-width: 1400px;
  margin: 0 auto;
}

.orders-header {
  margin-bottom: 2rem;
}

.orders-header h1 {
  color: #333;
  margin-bottom: 1rem;
}

.orders-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
}

.stat-card {
  background: white;
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  text-align: center;
}

.stat-card h3 {
  color: #666;
  font-size: 0.9rem;
  margin-bottom: 0.5rem;
  text-transform: uppercase;
}

.stat-card p {
  font-size: 2rem;
  font-weight: bold;
  color: #333;
  margin: 0;
}

.loading-container {
  text-align: center;
  padding: 3rem;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #007bff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 1rem;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.error-container {
  text-align: center;
  padding: 3rem;
  color: #dc3545;
}

.btn-retry {
  background: #007bff;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
  margin-top: 1rem;
}

.btn-retry:hover {
  background: #0056b3;
}

.orders-table-container {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.table-controls {
  padding: 1rem;
  border-bottom: 1px solid #eee;
  display: flex;
  gap: 1rem;
  align-items: center;
}

.search-input, .status-filter {
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 0.9rem;
}

.search-input {
  flex: 1;
  min-width: 200px;
}

.status-filter {
  min-width: 150px;
}

.orders-table {
  width: 100%;
  border-collapse: collapse;
}

.orders-table th,
.orders-table td {
  padding: 1rem;
  text-align: left;
  border-bottom: 1px solid #eee;
}

.orders-table th {
  background: #f8f9fa;
  font-weight: 600;
  color: #333;
}

.order-row:hover {
  background: #f8f9fa;
}

.order-id {
  font-weight: 600;
  color: #007bff;
}

.customer-info div {
  font-weight: 500;
}

.customer-info small {
  color: #666;
  font-size: 0.8rem;
}

.order-date {
  font-size: 0.9rem;
  color: #666;
}

.status-select {
  padding: 0.25rem 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 0.8rem;
  background: white;
}

.status-pending { border-color: #ffc107; background: #fff3cd; }
.status-processing { border-color: #17a2b8; background: #d1ecf1; }
.status-shipped { border-color: #007bff; background: #d1ecf1; }
.status-completed { border-color: #28a745; background: #d4edda; }
.status-cancelled { border-color: #dc3545; background: #f8d7da; }

.order-total {
  font-weight: 600;
  color: #333;
}

.order-actions {
  display: flex;
  gap: 0.5rem;
}

.btn-view, .btn-delete {
  padding: 0.25rem 0.75rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.8rem;
  transition: background-color 0.2s;
}

.btn-view {
  background: #007bff;
  color: white;
}

.btn-view:hover {
  background: #0056b3;
}

.btn-delete {
  background: #dc3545;
  color: white;
}

.btn-delete:hover {
  background: #c82333;
}

.empty-state {
  text-align: center;
  padding: 3rem;
  color: #666;
}

/* Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  border-radius: 8px;
  max-width: 800px;
  width: 90%;
  max-height: 90%;
  overflow-y: auto;
}

.modal-header {
  padding: 1.5rem;
  border-bottom: 1px solid #eee;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-header h2 {
  margin: 0;
  color: #333;
}

.modal-close {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #666;
  padding: 0;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-close:hover {
  background: #f0f0f0;
}

.modal-body {
  padding: 1.5rem;
}

.order-info {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
  margin-bottom: 2rem;
}

.info-section h3 {
  color: #333;
  margin-bottom: 1rem;
  font-size: 1.1rem;
}

.info-section p {
  margin: 0.5rem 0;
  color: #666;
}

.order-items-section h3 {
  color: #333;
  margin-bottom: 1rem;
  font-size: 1.1rem;
}

.items-table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 1rem;
}

.items-table th,
.items-table td {
  padding: 0.75rem;
  text-align: left;
  border-bottom: 1px solid #eee;
}

.items-table th {
  background: #f8f9fa;
  font-weight: 600;
  color: #333;
}

@media (max-width: 768px) {
  .orders-view {
    padding: 1rem;
  }
  
  .orders-stats {
    grid-template-columns: 1fr;
  }
  
  .table-controls {
    flex-direction: column;
    align-items: stretch;
  }
  
  .orders-table {
    font-size: 0.8rem;
  }
  
  .orders-table th,
  .orders-table td {
    padding: 0.5rem;
  }
  
  .order-actions {
    flex-direction: column;
  }
  
  .order-info {
    grid-template-columns: 1fr;
  }
  
  .modal-content {
    width: 95%;
    margin: 1rem;
  }
}
</style>
