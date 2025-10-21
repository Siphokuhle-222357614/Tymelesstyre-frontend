import api from '../services/api'

export default class Auth {
  // ==============================
  // 🔹 Update User
  // ==============================
  static async updateUser(userId, userData) {
    try {
      const updatedUser = await api.updateUser(userId, userData)

      // If the currently logged-in user is the one being updated, refresh localStorage
      const currentUser = this.getCurrentUser()
      if (currentUser && updatedUser.username === currentUser.username) {
        const newUserData = {
          ...currentUser,
          ...updatedUser,
          role: (updatedUser.role || currentUser.role || '').toUpperCase(),
        }
        localStorage.setItem('user', JSON.stringify(newUserData))
        window.dispatchEvent(new Event('auth-change'))
      }

      return updatedUser
    } catch (err) {
      const message = err?.response?.data || err.message || 'Error updating user'
      throw new Error(message)
    }
  }

  // ==============================
  // 🔹 Login
  // ==============================
  static async login(username, password) {
    try {
      const data = await api.login({ username, password })

      // Backend returns { token: '...', userId: ... }
      const token = data?.token || data?.accessToken || data?.jwt
      const userId = data?.userId
      if (!token) throw new Error('Login failed: No token returned from server')

      // Store token and userId
      localStorage.setItem('authToken', token)
      if (userId) {
        localStorage.setItem('userId', userId)
      }

      // Fetch user profile using the new /user/profile endpoint
      let userDetails = null
      try {
        userDetails = await api.getCurrentUserProfile()
      } catch (err) {
        console.warn('Could not fetch user profile, using fallback:', err)
        // Fallback: fetch user by username
        try {
          userDetails = await api.getUserByUsername(username)
        } catch {
          userDetails = { username }
        }
      }

      // Determine role and redirect path
      const role = (userDetails?.role || 'CUSTOMER').toUpperCase()
      let redirectPath = '/'
      if (role === 'ADMIN' || role === 'ROLE_ADMIN') redirectPath = '/admin/users'

      // Build user object
      const user = {
        userId: userDetails.userId || userId,
        username: userDetails.username || username,
        name: userDetails.name,
        surname: userDetails.surname,
        email: userDetails.email,
        phoneNumber: userDetails.phoneNumber,
        role,
        redirectPath,
      }

      // Save user in localStorage
      localStorage.setItem('user', JSON.stringify(user))
      window.dispatchEvent(new Event('auth-change'))

      return user
    } catch (err) {
      localStorage.removeItem('authToken')
      localStorage.removeItem('userId')
      const message = err?.response?.data || err.message || 'Login failed'
      throw new Error(message)
    }
  }

  // ==============================
  // 🔹 Register
  // ==============================
  static async register(name, surname, username, email, phoneNumber, password, confirmPassword, _role, street, city, state, postalCode, country) {
    try {
      const payload = {
        name,
        surname,
        username,
        email,
        phoneNumber,
        password,
        confirmPassword,
        // role omitted — backend defaults to CUSTOMER
        street,
        city,
        state,
        postalCode,
        country,
      }

      return await api.registerUser(payload)
    } catch (err) {
      const message = err?.response?.data || err.message || 'Registration failed'
      throw new Error(message)
    }
  }

  // ==============================
  // 🔹 Logout
  // ==============================
  static logout() {
    localStorage.removeItem('user')
    localStorage.removeItem('authToken')
    localStorage.removeItem('userId')
    window.dispatchEvent(new Event('auth-change'))
  }

  // ==============================
  // 🔹 Get Current User Profile
  // ==============================
  static async getCurrentProfile() {
    try {
      const userDetails = await api.getCurrentUserProfile()

      // Update localStorage with fresh data
      const currentUser = this.getCurrentUser()
      const updatedUser = {
        ...currentUser,
        ...userDetails,
        role: (userDetails.role || currentUser?.role || 'CUSTOMER').toUpperCase()
      }

      localStorage.setItem('user', JSON.stringify(updatedUser))
      window.dispatchEvent(new Event('auth-change'))

      return updatedUser
    } catch (err) {
      const message = err?.response?.data || err.message || 'Failed to fetch profile'
      throw new Error(message)
    }
  }

  // ==============================
  // 🔹 Change Password
  // ==============================
  static async changePassword(currentPassword, newPassword) {
    try {
      const currentUser = this.getCurrentUser()
      if (!currentUser?.userId) {
        throw new Error('User not found. Please login again.')
      }

      const passwordData = {
        currentPassword,
        newPassword
      }

      await api.changePassword(currentUser.userId, passwordData)
      return { success: true, message: 'Password updated successfully' }
    } catch (err) {
      const message = err?.response?.data || err.message || 'Password change failed'
      throw new Error(message)
    }
  }

  // ==============================
  // 🔹 Current User Helpers
  // ==============================
  static getCurrentUser() {
    const user = localStorage.getItem('user')
    return user ? JSON.parse(user) : null
  }

  static getAuthToken() {
    return localStorage.getItem('authToken')
  }

  static isAuthenticated() {
    return !!this.getAuthToken()
  }

  static isAdmin() {
    const user = this.getCurrentUser()
    return user && (user.role === 'ADMIN' || user.role === 'ROLE_ADMIN')
  }

  static isCustomer() {
    const user = this.getCurrentUser()
    return user && user.role === 'CUSTOMER'
  }

  // ==============================
  // 🔹 Fetch User Details
  // ==============================
  static async fetchUserDetails(username) {
    // Try to use the profile endpoint first (for current user)
    try {
      const currentUser = this.getCurrentUser()
      if (currentUser && currentUser.username === username) {
        return await this.getCurrentProfile()
      }
    } catch {
      console.warn('Could not use profile endpoint, falling back to username lookup')
    }

    // Fallback to username lookup
    return api.getUserByUsername(username)
  }
}
