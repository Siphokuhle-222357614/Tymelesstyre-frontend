<template>
  <div class="profile-container">
    <h2>Personal Details</h2>

    <!-- Personal Information -->
    <div class="section">
      <h3>Personal Information</h3>
      <div class="details-group" v-for="field in fields" :key="field.key">
        <label>{{ field.label }}:</label>

        <!-- Editable input -->
        <input
          v-if="editDetails && editing[field.key]"
          v-model="editDetails[field.key]"
          :type="field.type"
        />

        <!-- Display value -->
        <span v-else>{{ userDetails[field.key] || 'Not provided' }}</span>

        <!-- Buttons -->
        <div class="button-group">
          <button v-if="!editing[field.key]" @click="startEdit(field.key)" class="btn-edit">Edit</button>
          <button v-else @click="saveEdit(field.key)" class="btn-save">Save</button>
          <button v-if="editing[field.key]" @click="cancelEdit(field.key)" class="btn-cancel">Cancel</button>
        </div>
      </div>
    </div>

    <!-- Password Change Section -->
    <div class="section">
      <h3>Change Password</h3>
      <div v-if="!showPasswordForm" class="password-section">
        <p>Update your account password for security.</p>
        <button @click="showPasswordForm = true" class="btn-primary">Change Password</button>
      </div>

      <div v-else class="password-form">
        <div class="form-group">
          <label>Current Password:</label>
          <input
            v-model="passwordData.currentPassword"
            type="password"
            placeholder="Enter current password"
            required
          />
        </div>

        <div class="form-group">
          <label>New Password:</label>
          <input
            v-model="passwordData.newPassword"
            type="password"
            placeholder="Enter new password"
            required
          />
        </div>

        <div class="form-group">
          <label>Confirm New Password:</label>
          <input
            v-model="passwordData.confirmPassword"
            type="password"
            placeholder="Confirm new password"
            required
          />
        </div>

        <div class="button-group">
          <button @click="changePassword" class="btn-save" :disabled="changingPassword">
            {{ changingPassword ? 'Changing...' : 'Update Password' }}
          </button>
          <button @click="cancelPasswordChange" class="btn-cancel">Cancel</button>
        </div>
      </div>
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
      ],
      // Password change functionality
      showPasswordForm: false,
      changingPassword: false,
      passwordData: {
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      }
    }
  },
  async created() {
    try {
      // Use the new profile endpoint for current user
      const data = await auth.getCurrentProfile()
      this.userDetails = data
      this.fields.forEach(f => (this.editing[f.key] = false))
      console.log('✅ Personal details loaded:', data)
    } catch (err) {
      console.error('Failed to fetch user details:', err)

      // Fallback: try to get from localStorage
      const currentUser = auth.getCurrentUser()
      if (currentUser) {
        this.userDetails = currentUser
        this.fields.forEach(f => (this.editing[f.key] = false))
      } else {
        alert('Failed to load profile details. Please login again.')
        this.$router.push('/login')
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
        const updatedUser = await auth.updateUser(this.userDetails.userId, this.editDetails)
        this.userDetails = { ...this.userDetails, ...updatedUser }
        this.editing[field] = false
        this.editDetails = null
        alert(`${field.charAt(0).toUpperCase() + field.slice(1)} updated successfully!`)
      } catch (err) {
        console.error('Update failed:', err)
        alert(`Failed to update ${field}: ${err.message}`)
      }
    },

    async changePassword() {
      // Validation
      if (!this.passwordData.currentPassword) {
        alert('Please enter your current password')
        return
      }

      if (!this.passwordData.newPassword) {
        alert('Please enter a new password')
        return
      }

      if (this.passwordData.newPassword.length < 6) {
        alert('New password must be at least 6 characters long')
        return
      }

      if (this.passwordData.newPassword !== this.passwordData.confirmPassword) {
        alert('New passwords do not match')
        return
      }

      this.changingPassword = true

      try {
        await auth.changePassword(
          this.passwordData.currentPassword,
          this.passwordData.newPassword
        )

        alert('Password updated successfully!')
        this.cancelPasswordChange()
      } catch (err) {
        console.error('Password change failed:', err)
        alert(`Failed to change password: ${err.message}`)
      } finally {
        this.changingPassword = false
      }
    },

    cancelPasswordChange() {
      this.showPasswordForm = false
      this.passwordData = {
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      }
    }
  }
}
</script>

<style scoped>
.profile-container {
  max-width: 700px;
  margin: 40px auto;
  padding: 30px;
  background-color: #fff;
  border-radius: 10px;
  box-shadow: 0 4px 10px rgba(0,0,0,0.1);
}

h2 {
  text-align: center;
  margin-bottom: 30px;
  color: #333;
  font-size: 2rem;
}

.section {
  margin-bottom: 40px;
  padding: 20px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  background-color: #fafafa;
}

.section h3 {
  margin: 0 0 20px 0;
  color: #444;
  font-size: 1.3rem;
  border-bottom: 2px solid #007bff;
  padding-bottom: 10px;
}

.details-group {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 15px;
  padding: 10px;
  background-color: white;
  border-radius: 6px;
  border: 1px solid #e9ecef;
}

.details-group label {
  font-weight: bold;
  width: 140px;
  color: #495057;
}

.details-group span,
.details-group input {
  flex: 1;
  margin: 0 15px;
}

.details-group input {
  padding: 8px 12px;
  border-radius: 4px;
  border: 1px solid #ced4da;
  font-size: 14px;
}

.details-group input:focus {
  outline: none;
  border-color: #007bff;
  box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.25);
}

.button-group {
  display: flex;
  gap: 8px;
}

.details-group button,
.btn-primary,
.btn-edit,
.btn-save,
.btn-cancel {
  padding: 6px 12px;
  border-radius: 4px;
  border: none;
  cursor: pointer;
  font-size: 13px;
  font-weight: 500;
  transition: all 0.2s;
}

.btn-edit,
.btn-primary {
  background-color: #007bff;
  color: white;
}

.btn-edit:hover,
.btn-primary:hover {
  background-color: #0056b3;
}

.btn-save {
  background-color: #28a745;
  color: white;
}

.btn-save:hover {
  background-color: #1e7e34;
}

.btn-save:disabled {
  background-color: #6c757d;
  cursor: not-allowed;
}

.btn-cancel {
  background-color: #6c757d;
  color: white;
}

.btn-cancel:hover {
  background-color: #545b62;
}

/* Password Section Specific Styles */
.password-section {
  text-align: center;
  padding: 20px;
}

.password-section p {
  margin-bottom: 15px;
  color: #666;
}

.password-form {
  max-width: 400px;
  margin: 0 auto;
}

.form-group {
  margin-bottom: 20px;
  text-align: left;
}

.form-group label {
  display: block;
  margin-bottom: 5px;
  font-weight: bold;
  color: #495057;
}

.form-group input {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #ced4da;
  border-radius: 4px;
  font-size: 14px;
  box-sizing: border-box;
}

.form-group input:focus {
  outline: none;
  border-color: #007bff;
  box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.25);
}

@media (max-width: 768px) {
  .profile-container {
    margin: 20px;
    padding: 20px;
  }

  .details-group {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }

  .details-group label {
    width: 100%;
  }

  .details-group span,
  .details-group input {
    width: 100%;
    margin: 0;
  }

  .button-group {
    width: 100%;
    justify-content: flex-end;
  }
}
</style>
