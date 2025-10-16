<template>
  <div class="section-container">
    <h3>Personal Details</h3>
    <p>Name: {{ user.name }}</p>
    <p>Email: {{ user.email }}</p>
    <p>Phone: {{ user.phone || 'Not provided' }}</p>
    <!-- Add more fields as needed -->
  </div>
</template>

<script>
export default {
  name: "PersonalDetails",
  data() {
    return {
      user: {
        name: "John Doe",  // Replace with real backend/store data
        email: "john@example.com",
        phone: "",
      },
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
.section-container p {
  margin-bottom: 10px;
  color: #555;
}
</style>
