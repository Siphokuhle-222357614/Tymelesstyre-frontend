<template>
  <div class="profile-container">
    <h2>Welcome, {{ userDetails.username || 'User' }}</h2>

    <div class="details-group" v-for="field in fields" :key="field.key">
      <label>{{ field.label }}:</label>

      <!-- Editable input -->
      <input
        v-if="editDetails && editing[field.key]"
        v-model="editDetails[field.key]"
        :type="field.type"
      />

      <!-- Display value -->
      <span v-else>{{ userDetails[field.key] }}</span>

      <!-- Buttons -->
      <button v-if="!editing[field.key]" @click="startEdit(field.key)">Edit</button>
      <button v-else @click="saveEdit(field.key)">Save</button>
      <button v-if="editing[field.key]" @click="cancelEdit(field.key)">Cancel</button>
    </div>
  </div>
</template>

<script>
import auth from '@/stores/auth.js'

export default {
  name: 'PersonalDetails',
  data() {
    return {
      userDetails: {
        username: '',
        name: '',
        surname: '',
        email: '',
        phoneNumber: ''
      },
      editDetails: null,
      editing: {},
      fields: [
        { key: 'name', label: 'Name', type: 'text' },
        { key: 'surname', label: 'Surname', type: 'text' },
        { key: 'username', label: 'Username', type: 'text' },
        { key: 'email', label: 'Email', type: 'email' },
        { key: 'phoneNumber', label: 'Phone Number', type: 'tel' }
      ]
    }
  },
  async created() {
    const currentUser = auth.getCurrentUser()
    if (currentUser && currentUser.username) {
      try {
        const data = await auth.fetchUserDetails(currentUser.username)
        this.userDetails = data
        this.fields.forEach(f => (this.editing[f.key] = false))
      } catch (err) {
        console.error('Failed to fetch user details:', err)
        alert('Failed to load profile details.')
      }
    }
  },
  methods: {
    startEdit(field) {
      this.editDetails = { ...this.userDetails }
      this.editing[field] = true
    },
    cancelEdit(field) {
      this.editing[field] = false
      this.editDetails = null
    },
    async saveEdit(field) {
      try {
        const response = await fetch(`http://localhost:8080/tymelesstyre/user/update/${this.userDetails.userId}`,
          {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(this.editDetails)
          }
        )

        if (!response.ok) throw new Error('Update failed')

        const updatedUser = await response.json()
        this.userDetails = updatedUser
        this.editing[field] = false
        this.editDetails = null
        alert(`${field.charAt(0).toUpperCase() + field.slice(1)} updated successfully!`)
      } catch (err) {
        console.error(err)
        alert('Failed to update profile.')
      }
    }
  }
}
</script>

<style scoped>
.profile-container {
  max-width: 600px;
  margin: 40px auto;
  padding: 30px;
  background-color: #fff;
  border-radius: 10px;
  box-shadow: 0 4px 10px rgba(0,0,0,0.1);
}
h2 {
  text-align: center;
  margin-bottom: 25px;
  color: #333;
}
.details-group {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 15px;
}
.details-group label {
  font-weight: bold;
  width: 120px;
}
.details-group span,
.details-group input {
  flex: 1;
}
.details-group input {
  padding: 5px 8px;
  border-radius: 5px;
  border: 1px solid #ccc;
}
.details-group button {
  margin-left: 5px;
  padding: 5px 10px;
  border-radius: 5px;
  border: none;
  background-color: #007bff;
  color: white;
  cursor: pointer;
  transition: background-color 0.2s;
}
.details-group button:hover {
  background-color: #0056b3;
}
</style>
