<template>
  <div class="section-container">
    <h3>Address Book</h3>
    <ul>
      <li v-for="address in addresses" :key="address.addressId">
        {{ address.street }}, {{ address.city }}, {{ address.state }} - {{ address.postalCode }}
      </li>
    </ul>
  </div>
</template>

<script>
export default {
  name: "AddressBook",
  data() {
    return {
      addresses: [
        // Example: replace with backend call to /api/addresses/user/:id
        { addressId: 1, street: "123 Main Street", city: "Cape Town", state: "Western Cape", postalCode: 8001 },
        { addressId: 2, street: "456 Side Ave", city: "Johannesburg", state: "Gauteng", postalCode: 2000 },
      ],
    };
  },
};
</script>

<style scoped>
.section-container {
  padding: 20px;
  border-radius: 8px;
  background-color: #f9f9f9;
}
.section-container h3 {
  margin-bottom: 15px;
  color: #333;
}
.section-container ul {
  list-style-type: disc;
  padding-left: 20px;
}
.section-container li {
  margin-bottom: 8px;
  color: #555;
}
</style>
