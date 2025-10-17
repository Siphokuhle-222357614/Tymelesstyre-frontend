export default class auth {
  static API_URL = "http://localhost:8080/tymelesstyre/user/";


  static async login(username, password) {
    try {
      const response = await fetch(this.API_URL + "login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const result = await response.text();
      if (!response.ok) {
        throw new Error(result || "Login failed. Please check your credentials.");
      }

      let role = "";
      let redirectPath = "/";
      if (result.includes("/admin/dashboard")) {
        role = "ADMIN";
        redirectPath = "/admin/users";
      } else if (result.includes("/customer/dashboard")) {
        role = "CUSTOMER";
        redirectPath = "/";
      } else {
        throw new Error("Unknown role returned from backend");
      }

      const user = { username, role, redirectPath };
      localStorage.setItem("user", JSON.stringify(user));

      
      window.dispatchEvent(new Event("auth-change"));

      return user;
    } catch (err) {
      throw err;
    }
  }

  
  static async register(name, surname, username, email, phoneNumber, password, confirmPassword, role) {
    try {
      const payload = {
        name,
        surname,
        username,
        email,
        phoneNumber,
        password,
        confirmPassword,
        role: role.toUpperCase(),
      };

      const response = await fetch(this.API_URL + "register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await response.text();
      if (!response.ok) {
        throw new Error(result || "Registration failed");
      }

      return result;
    } catch (err) {
      throw err;
    }
  }

  
  static logout() {
    localStorage.removeItem("user");
    
    window.dispatchEvent(new Event("auth-change"));
  }


  static getCurrentUser() {
    const user = localStorage.getItem("user");
    return user ? JSON.parse(user) : null;
  }

  
  static isAuthenticated() {
    return !!this.getCurrentUser();
  }

  static isAdmin() {
    const user = this.getCurrentUser();
    return user && user.role === "ADMIN";
  }

  static isCustomer() {
    const user = this.getCurrentUser();
    return user && user.role === "CUSTOMER";
  }

 
  static async fetchUserDetails(username) {
    try {
      const response = await fetch(this.API_URL + `readByUsername/${username}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch user details");
      }

      const data = await response.json();
      return data;
    } catch (err) {
      console.error(err);
      throw err;
    }
  }
}
