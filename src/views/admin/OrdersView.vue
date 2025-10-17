<template>
  <div class="orders-view">
    <h1>Orders</h1>
    <table>
      <thead>
        <tr>
          <th>Order ID</th>
          <th>Date</th>
          <th>Status</th>
          <th>Total</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="order in orders" :key="order.id">
          <td>{{ order.id }}</td>
          <td>{{ order.date }}</td>
          <td>{{ order.status }}</td>
          <td>{{ order.total }}</td>
        </tr>
      </tbody>
    </table>
  </div>

</template>

<script>
export default {
  name: 'OrdersView',
  data() {
    return {
      // Initialize orders so the template can access it without type errors.
      orders: [
        // Example placeholder; replace with real data or fetch in created()/mounted()
        { id: 1, date: '2025-01-01', status: 'Pending', total: 100.0 },

      ],
    };
  },
  // Uncomment and implement fetching if you need to load orders from an API.
  created() {
    this.fetchOrders();
  },
  methods: {
    async fetchOrders() {
      const res = await fetch('/api/orders');
      this.orders = await res.json();
    }
  },
};
</script>
