<template>
  <div class="auth-container">
    <h2>Register</h2>
    <hr class="divider">
    <form @submit.prevent="handleRegister">
      <div class="form-group">
        <label for="username">Username</label>
        <input type="text" v-model="username" id="username" required />
      </div>
      <div class="form-group">
        <label for="email">Email</label>
        <input type="email" v-model="email" id="email" required />
      </div>
      <div class="form-group">
        <label for="password">Password</label>
        <input type="password" v-model="password" id="password" required />
      </div>
      <div class="form-group">
        <label for="confirmPassword">Confirm Password</label>
        <input type="password" v-model="confirmPassword" id="confirmPassword" required />
      </div>
      <button type="submit" class="btn btn-primary">Register</button>

      <p>Already have an account? <router-link to="/login">Login</router-link></p>
    </form>
  </div>
</template>

<script>
import { auth, db } from '../firebase'; // Import Firebase auth and Firestore
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { collection, doc, setDoc } from 'firebase/firestore'; // Import Firestore functions

export default {
  data() {
    return {
      username: '', // Username added
      email: '',
      password: '',
      confirmPassword: '',
    };
  },
  methods: {
    async handleRegister() {
      if (this.password !== this.confirmPassword) {
        alert('Passwords do not match');
        return;
      }

      try {
        // Register the user with Firebase Authentication
        const userCredential = await createUserWithEmailAndPassword(auth, this.email, this.password);
        const userId = userCredential.user.uid;

        // Store user data in Firestore
        await setDoc(doc(db, "users", userId), {
          username: this.username, // Save the username
          email: this.email,
          userId: userId,
          auctionsBiddedOn: [] // Initialize an empty array for bidded auctions
        });

        alert('Registration successful!');
        this.$router.push({ name: 'Profile' });
      } catch (error) {
        alert(`Error: ${error.message}`);
      }
    }
  }
};
</script>

  
  <style scoped>
  .auth-container {
    width: 350px;
    margin: 100px auto;
    padding: 20px;
    border: 1px solid #ccc;
    border-radius: 10px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    background-color: white;
    text-align: center;
  }
  
  h2 {
    font-size: 24px;
    margin-bottom: 10px;
    font-weight: bold;
  }
  
  .divider {
    width: 50px;
    border: 2px solid black;
    margin-bottom: 20px;
  }
  
  .form-group {
    margin-bottom: 15px;
    text-align: left;
  }
  
  .form-group label {
    display: block;
    font-size: 14px;
    font-weight: bold;
    margin-bottom: 5px;
  }
  
  .form-group input {
    width: 100%;
    padding: 10px;
    font-size: 14px;
    border: 1px solid #ccc;
    border-radius: 5px;
    box-sizing: border-box;
  }
  
  button {
    width: 100%;
    padding: 10px;
    font-size: 16px;
    color: white;
    background-color: #007bff;
    border: none;
    border-radius: 5px;
    cursor: pointer;
  }
  
  button:hover {
    background-color: #0056b3;
  }
  
  p {
    margin-top: 20px;
    font-size: 14px;
  }
  
  p a {
    color: #007bff;
  }
  
  p a:hover {
    text-decoration: underline;
  }
  </style>
  
  
  
  