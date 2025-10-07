<template>
  <div class="register-container">
    <h2>Register your account</h2>

    <form @submit.prevent="handleRegister">
      <div class="form-group">
        <label>Name</label>
        <input v-model="name" type="text" placeholder="Enter your name..." required />
      </div>

      <div class="form-group">
        <label>Surname</label>
        <input v-model="surname" type="text" placeholder="Enter your surname..." required />
      </div>

      <div class="form-group">
        <label>Username</label>
        <input v-model="username" type="text" placeholder="Enter a username..." required />
      </div>

      <div class="form-group">
        <label>Email address</label>
        <input v-model="email" type="email" placeholder="Enter your email address..." required />
      </div>

      <div class="form-group">
        <label>Phone Number</label>
        <input v-model="phoneNumber" type="tel" placeholder="Enter your phone number..." />
      </div>

      <div class="form-group">
        <label>Password</label>
        <input v-model="password" type="password" placeholder="Enter your password..." required />
      </div>

      <div class="form-group">
        <label>Confirm Password</label>
        <input v-model="confirmPassword" type="password" placeholder="Enter your password again..." required />
      </div>

      <div class="form-group">
        <label>Role</label>
        <select v-model="role" required>
          <option value="">Select role</option>
          <option value="CUSTOMER">Customer</option>
          <option value="ADMIN">Admin</option>
        </select>
      </div>

      <button type="submit">
        Sign up
      </button>
    </form>

    <p class="login-link">
      Already have an account? <router-link to="/login">Sign in</router-link>
    </p>
  </div>
</template>

<script>
import auth from '../stores/auth.js';

export default {
  name: "RegisterView",
  data() {
    return {
      name: "",
      surname: "",
      username: "",
      email: "",
      phoneNumber: "",
      password: "",
      confirmPassword: "",
      role: ""
    };
  },
  methods: {
    async handleRegister() {
      if (this.password !== this.confirmPassword) {
        alert("Passwords do not match!");
        return;
      }

      try {
        const result = await auth.register(
        this.name,
        this.surname,
        this.username,
        this.email,
        this.phoneNumber,
        this.password,
        this.confirmPassword, 
        this.role
);


        alert("Registration successful! Please login.");
        this.$router.push("/login");
      } catch (err) {
        alert(err.message || "Registration failed");
      }
    }
  }
};
</script>

<style scoped>
.register-container {
  max-width: 400px;
  margin: 40px auto;
  padding: 30px;
  background-color: #fff;
  border-radius: 10px;
  box-shadow: 0 4px 10px rgba(0,0,0,0.1);
}

h2 {
  text-align: center;
  margin-bottom: 20px;
}

.form-group {
  margin-bottom: 15px;
  display: flex;
  flex-direction: column;
}

label {
  margin-bottom: 5px;
  font-weight: bold;
}

input, select {
  padding: 8px;
  border-radius: 5px;
  border: 1px solid #ccc;
}

button {
  width: 100%;
  padding: 10px;
  background-color: #2f80ed;
  color: white;
  font-weight: bold;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}

.login-link {
  text-align: center;
  margin-top: 15px;
}
</style>