<template>
  <div v-if="isAuthenticated" id="horse-registration">
    <!-- Header Section -->
    <header class="registration-header">
      <h1>HORSE REGISTRATION</h1>
    </header>

    <!-- Form Section -->
    <form @submit.prevent="submitForm">
      <!-- Horse Information -->
      <section class="horse-info">
        <h2>Horse Information</h2>
        <div class="form-group">
          <label for="horseName">Horse Name:</label>
          <input type="text" v-model="form.horseName" id="horseName" required />
        </div>
        <div class="form-group">
          <label for="breed">Breed:</label>
          <input type="text" v-model="form.breed" id="breed" required />
        </div>
        <div class="form-group">
          <label for="age">Age:</label>
          <input type="number" v-model="form.age" id="age" required />
        </div>
        <div class="form-group">
          <label for="color">Color:</label>
          <input type="text" v-model="form.color" id="color" required />
        </div>
        <div class="form-group">
          <label for="gender">Gender:</label>
          <select v-model="form.gender" id="gender" required>
            <option value="" disabled>Select Gender</option>
            <option value="Mare">Mare</option>
            <option value="Gelding">Gelding</option>
            <option value="Stallion">Stallion</option>
          </select>
        </div>
        <div class="form-group">
          <label for="size">Size (cm):</label>
          <input type="number" v-model="form.size" id="size" required />
        </div>
        <div class="form-group">
          <label for="dob">Date of Birth:</label>
          <input type="date" v-model="form.dob" id="dob" required />
        </div>

        <!-- Horse Pictures Upload -->
        <div class="form-group">
          <label for="horsePictures">Upload Horse Pictures:</label>
          <input type="file" id="horsePictures" @change="handleHorsePicturesUpload" multiple accept="image/*" />
          <ul>
            <li v-for="(picture, index) in uploadedHorsePictures" :key="index">{{ picture.name }}</li>
          </ul>
        </div>
      </section>

      <!-- Auction Information -->
      <section class="auction-info">
        <h2>Auction Information</h2>
        <div class="form-group">
          <label for="startAuction">Start Auction:</label>
          <input type="date" v-model="form.startAuction" id="startAuction" required />
        </div>
        <div class="form-group">
          <label for="endAuction">End Auction:</label>
          <input type="date" v-model="form.endAuction" id="endAuction" required />
        </div>
        <div class="form-group">
          <label for="startingPrice">Starting Price (USD):</label>
          <input type="number" v-model="form.startingPrice" id="startingPrice" required min="1" />
        </div>
        <div class="form-group">
          <label for="setIncrement">Set Increment (USD):</label>
          <input type="number" v-model="form.setIncrement" id="setIncrement" required min="1" />
        </div>
      </section>
      <div class="form-group">
  <label for="latitude">Latitude:</label>
  <input type="number" v-model="form.latitude" id="latitude" step="any" required />
</div>

<div class="form-group">
  <label for="longitude">Longitude:</label>
  <input type="number" v-model="form.longitude" id="longitude" step="any" required />
</div>


      <!-- File Upload Section for Documents -->
      <section class="file-upload">
        <h2>Upload Documents</h2>
        <div class="form-group">
          <label for="documents">Upload Horse Documents:</label>
          <input type="file" id="documents" @change="handleDocumentUpload" accept="application/pdf" />
          <ul>
            <li v-for="(document, index) in uploadedDocuments" :key="index">{{ document.name }}</li>
          </ul>
        </div>
      </section>

      <!-- Description Section -->
      <section class="description">
        <h2>Description</h2>
        <div class="form-group">
          <textarea v-model="form.description" placeholder="Description of the horse" required></textarea>
        </div>
      </section>

      <!-- Register Button -->
      <button type="submit" class="btn btn-register">REGISTER HORSE</button>
    </form>

    <!-- Confirmation Popup -->
    <div v-if="showPopup" class="popup">
      <div class="popup-content">
        <p>Do you want to place the horse for bidding?</p>
        <button @click="confirmRegistration">Yes</button>
        <button @click="cancelRegistration">No</button>
      </div>
    </div>
  </div>

  <div v-else>
    <p>Redirecting to login...</p>
  </div>
</template>

<script>
import { auth } from '@/firebase'; // Import Firebase auth
import { onAuthStateChanged } from 'firebase/auth'; // Import auth state listener
import { db, storage } from "@/firebase";
import { collection, addDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

export default {
  data() {
    return {
      isAuthenticated: false, // To check if user is authenticated
      form: {
        horseName: "",
        breed: "",
        age: "",
        color: "",
        gender: "", // Added gender field
        size: "",   // Added size field
        dob: "",    // Added date of birth field
        startAuction: "",
        endAuction: "",
        startingPrice: 1,
        setIncrement: 1,
        description: "",
        currentBid: 1,
        auctionOwner: "",
        highestBidder: "",
        latitude: "",    // Add latitude field
  longitude: "",   // Add longitude field

      },
      uploadedHorsePictures: [],
      uploadedDocuments: [],
      showPopup: false,
    };
  },
  methods: {
    handleHorsePicturesUpload(event) {
      this.uploadedHorsePictures = Array.from(event.target.files);
    },
    handleDocumentUpload(event) {
      this.uploadedDocuments = Array.from(event.target.files);
    },
    async submitForm() {
      try {
        // Validate form
        if (!this.validateForm()) return;

        // Get the current user
        const user = auth.currentUser;
        if (!user) {
          console.error("User is not logged in.");
          this.$router.push({ name: 'Login' });
          return;
        }

        // Upload horse pictures
        const pictureUrls = await Promise.all(
          this.uploadedHorsePictures.map((file) => this.uploadFile(file, "horse-pictures"))
        );

        // Upload document files (if any)
        const documentUrls = await Promise.all(
          this.uploadedDocuments.map((file) => this.uploadFile(file, "documents"))
        );

        // Save the data to Firestore
        await addDoc(collection(db, "Auctions"), {
          horseName: this.form.horseName,
          breed: this.form.breed,
          age: this.form.age,
          color: this.form.color,
          gender: this.form.gender,      // Added gender
          size: this.form.size,          // Added size
          dob: this.form.dob,            // Added date of birth
          lat: this.form.latitude,  // Save latitude
  long: this.form.longitude, // Save longitude
          startAuction: this.form.startAuction,
          endAuction: this.form.endAuction,
          startingPrice: this.form.startingPrice,
          setIncrement: this.form.setIncrement,
          description: this.form.description,
          horsePictures: pictureUrls,  // Storing the uploaded image URLs
          documents: documentUrls,
          currentBid: this.form.startingPrice,
          auctionOwner: user.uid,
          highestBidder: user.uid,
          contact: user.email,
        });

        // Show success popup
        this.showPopup = true;
      } catch (error) {
        console.error("Error submitting form: ", error);
      }
    },
    async uploadFile(file, folder) {
      const storageRef = ref(storage, `${folder}/${file.name}`);
      await uploadBytes(storageRef, file);
      return await getDownloadURL(storageRef);
    },
    validateForm() {
      // Implement form validation logic here
      return true; // Assume validation passes for simplicity
    },
    confirmRegistration() {
      this.showPopup = false;
      this.$router.push({ name: 'Profile' });
    },
    cancelRegistration() {
      this.showPopup = false;
    },
  },
  mounted() {
    // Check if the user is authenticated
    onAuthStateChanged(auth, (user) => {
      if (user) {
        // User is signed in
        this.isAuthenticated = true;
      } else {
        // User is not signed in, redirect to login
        this.$router.push({ name: 'Login' });
      }
    });
  }
};
</script>


  <style scoped>
  /* Header Styling */
  .registration-header {
    background-color: #2e3c4f;
    color: white;
    padding: 20px;
    text-align: center;
  }
  
  .registration-header h1 {
    margin: 0;
  }
  
  /* Form Styling */
  form {
    padding: 20px;
  }
  
  .form-group {
    margin-bottom: 20px;
  }
  
  .form-group label {
    display: block;
    margin-bottom: 5px;
    font-weight: bold;
  }
  
  .form-group input,
  .form-group textarea {
    width: 100%;
    padding: 10px;
    border: 1px solid #ccc;
    border-radius: 4px;
  }
  
  textarea {
    height: 100px;
  }
  
  /* Error Message Styling */
  .error {
    color: red;
    font-size: 12px;
  }
  
  /* Button Styling */
  .btn-register {
    background-color: #007bff;
    color: white;
    padding: 10px;
    border: none;
    cursor: pointer;
    border-radius: 4px;
    transition: background-color 0.3s ease;
  }
  
  .btn-register:hover {
    background-color: blue; /* Turns blue on hover */
  }
  
  /* Popup Styling */
  .popup {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
  }
  
  .popup-content {
    background-color: white;
    padding: 20px;
    text-align: center;
    border-radius: 8px;
  }
  
  .popup-content p {
    font-size: 18px;
    margin-bottom: 20px;
  }
  
  .popup-content button {
    padding: 10px 20px;
    border: none;
    cursor: pointer;
    border-radius: 4px;
    background-color: #28a745;
    color: white;
  }
  </style>
  