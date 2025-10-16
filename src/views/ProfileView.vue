<template>
  <div class="profile-container">
    <h2>Welcome, {{ user.name }}</h2>

    <div class="profile-nav">
      <button
        @click="$router.push('/profile/personal-details')"
        :class="{ active: $route.path.startsWith('/profile/personal-details') }"
      >
        Personal Details
      </button>
      <button
        @click="$router.push('/profile/address-book')"
        :class="{ active: $route.path.startsWith('/profile/address-book') }"
      >
        Address Book
      </button>
      <button
        @click="$router.push('/profile/orders')"
        :class="{ active: $route.path.startsWith('/profile/orders') }"
      >
        Orders
      </button>
    </div>

    <div class="profile-content">
      <router-view></router-view>
    </div>
  </div>
</template>

<script>
import auth from '@/stores/auth.js';

export default {
  name: 'ProfileView',
  data() {
    return {
      user: {
        name: 'User', // fallback
      },
    };
  },
  created() {
    const currentUser = auth.getCurrentUser();
    if (currentUser) {
      this.user.name = currentUser.username; // or `currentUser.name` if you stored full name
    }
  },
};
</script>

<style scoped>
.profile-container {
  max-width: 800px;
  margin: 40px auto;
  padding: 30px;
  background-color: #fff;
  border-radius: 10px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
}
.profile-container h2 {
  text-align: center;
  margin-bottom: 25px;
  color: #333;
}
.profile-nav {
  display: flex;
  justify-content: center;
  gap: 15px;
  margin-bottom: 30px;
  flex-wrap: wrap;
}
.profile-nav button {
  padding: 10px 20px;
  border: none;
  border-radius: 6px;
  background-color: #007bff;
  color: white;
  font-weight: bold;
  cursor: pointer;
  transition: background-color 0.2s;
}
.profile-nav button.active {
  background-color: #0056b3;
}
.profile-nav button:hover:not(.active) {
  background-color: #0069d9;
}
.profile-content {
  /* Child content area */
}
</style>
