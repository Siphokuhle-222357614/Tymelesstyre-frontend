<template>
  <div class="admin-users-container">
    <h2>User Management</h2>

    <table class="users-table">
      <thead>
        <tr>
          <th>ID</th>
          <th>Username</th>
          <th>Email</th>
          <th>Role</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="user in users" :key="user.userId">
          <td>{{ user.userId }}</td>
          <td>
            <input
              v-if="editUser && editUser.userId === user.userId"
              v-model="editUser.username"
            />
            <span v-else>{{ user.username }}</span>
          </td>
          <td>
            <input
              v-if="editUser && editUser.userId === user.userId"
              v-model="editUser.email"
            />
            <span v-else>{{ user.email }}</span>
          </td>
          <td>
            <select
              v-if="editUser && editUser.userId === user.userId"
              v-model="editUser.role"
              disabled
            >
              <option value="CUSTOMER">CUSTOMER</option>
            </select>
            <span v-else>{{ user.role }}</span>
          </td>
          <td>
            <button
              v-if="editUser && editUser.userId === user.userId"
              @click="updateUser(user.userId)"
            >
              Save
            </button>
            <button
              v-if="editUser && editUser.userId === user.userId"
              @click="cancelEdit"
            >
              Cancel
            </button>
            <button v-else @click="startEdit(user)">Edit</button>
            <button @click="deleteUser(user.userId)">Delete</button>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script>
import api from "@/services/api.js";
import Auth from "@/stores/auth.js";

export default {
  name: "AdminUsersManagement",
  data() {
    return {
      users: [],
      editUser: null,
    };
  },
  methods: {
    async fetchUsers() {
      try {
        const data = await api.getAllUsers();
        this.users = data.filter((u) => u.role === "CUSTOMER");
      } catch (err) {
        console.error("Error fetching users:", err);
        alert("Failed to load users");
      }
    },
    startEdit(user) {
      this.editUser = { ...user };
    },
    cancelEdit() {
      this.editUser = null;
    },
    async updateUser(userId) {
      try {
        const response = await fetch(
          `http://localhost:8080/tymelesstyre/admin/users/${userId}`,
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(this.editUser),
          }
        );
        if (!response.ok) throw new Error("Update failed");
        this.editUser = null;
        await this.fetchUsers();
      } catch (err) {
        console.error("Error updating user:", err);
        alert("Update failed");
      }
    },
    async deleteUser(userId) {
      if (!confirm("Are you sure you want to delete this user?")) return;
      try {
        await api.deleteUser(userId);
        await this.fetchUsers();
      } catch (err) {
        console.error("Error deleting user:", err);
        alert("Delete failed");
      }
    },
  },
  mounted() {
  const currentUser = Auth.getCurrentUser();
    if (!currentUser || currentUser.role !== "ADMIN") {
      this.$router.push("/login");
    } else {
      this.fetchUsers();
    }
  },
};
</script>

<style scoped>
.admin-users-container {
  max-width: 900px;
  margin: 40px auto;
  padding: 30px;
  background-color: #fff;
  border-radius: 10px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
  font-family: Arial, sans-serif;
}

h2 {
  text-align: center;
  margin-bottom: 20px;
}

.users-table {
  width: 100%;
  border-collapse: collapse;
}

.users-table th,
.users-table td {
  border: 1px solid #ccc;
  padding: 8px;
  text-align: left;
}

.users-table th {
  background-color: #f4f4f4;
}

.users-table tr:hover {
  background-color: #f9f9f9;
}

.users-table input,
.users-table select {
  width: 100%;
  padding: 4px;
  border-radius: 4px;
  border: 1px solid #ccc;
}

button {
  margin-right: 5px;
  padding: 5px 10px;
  border: none;
  border-radius: 5px;
  font-weight: bold;
  cursor: pointer;
}

button:hover {
  opacity: 0.9;
}

button:nth-child(1) {
  background-color: #28a745;
  color: white;
}
button:nth-child(2) {
  background-color: #6c757d;
  color: white;
}
button:nth-child(3) {
  background-color: #007bff;
  color: white;
}
button:nth-child(4) {
  background-color: #dc3545;
  color: white;
}
</style>
