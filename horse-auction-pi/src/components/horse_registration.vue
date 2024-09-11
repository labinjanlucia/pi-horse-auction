<template>
    <div id="horse-registration">
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
            <span v-if="errors.endAuction" class="error">{{ errors.endAuction }}</span>
          </div>
          <div class="form-group">
            <label for="startingPrice">Starting Price (USD):</label>
            <input type="number" v-model="form.startingPrice" id="startingPrice" required min="1" />
            <span v-if="errors.startingPrice" class="error">{{ errors.startingPrice }}</span>
          </div>
          <div class="form-group">
            <label for="setIncrement">Set Increment (USD):</label>
            <input type="number" v-model="form.setIncrement" id="setIncrement" required min="1" />
            <span v-if="errors.setIncrement" class="error">{{ errors.setIncrement }}</span>
          </div>
        </section>
  
        <!-- File Upload Section for Documents -->
        <section class="file-upload">
          <h2>Upload Documents</h2>
          <div class="form-group">
            <label for="documents">Upload Horse Documents:</label>
            <input type="file" id="documents" @change="handleDocumentUpload" multiple />
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
  </template>
  
  <script>
  export default {
    data() {
      return {
        form: {
          horseName: '',
          breed: '',
          age: '',
          color: '',
          startAuction: '',
          endAuction: '',
          startingPrice: 1,
          setIncrement: 1,
          description: '',
        },
        uploadedHorsePictures: [],
        uploadedDocuments: [],
        showPopup: false, // Popup for successful registration
        errors: {
          endAuction: '',
          startingPrice: '',
          setIncrement: ''
        }
      };
    },
    methods: {
      handleHorsePicturesUpload(event) {
        // Allow multiple images
        this.uploadedHorsePictures = Array.from(event.target.files);
      },
      handleDocumentUpload(event) {
        // Allow multiple documents
        this.uploadedDocuments = Array.from(event.target.files);
      },
      validateForm() {
        let isValid = true;
        const today = new Date().toISOString().split('T')[0]; // Get today's date
        const startDate = this.form.startAuction;
        const endDate = this.form.endAuction;
        
        // Validate auction dates
        if (startDate < today) {
          this.errors.endAuction = 'Start auction date cannot be in the past.';
          isValid = false;
        } else if (endDate <= startDate) {
          this.errors.endAuction = 'End auction date must be at least one day after the start date.';
          isValid = false;
        } else {
          this.errors.endAuction = '';
        }
  
        // Validate starting price
        if (this.form.startingPrice < 1) {
          this.errors.startingPrice = 'Starting price must be at least 1 USD.';
          isValid = false;
        } else {
          this.errors.startingPrice = '';
        }
  
        // Validate set increment
        if (this.form.setIncrement < 1) {
          this.errors.setIncrement = 'Set increment must be at least 1 USD.';
          isValid = false;
        } else {
          this.errors.setIncrement = '';
        }
  
        return isValid;
      },
      submitForm() {
        // Validate form before proceeding
        if (!this.validateForm()) {
          return;
        }
        // Show success popup after validation
        this.showPopup = true;
      },
      confirmRegistration() {
        // Save the registered horse to localStorage (or your backend)
        const newHorse = {
          horseName: this.form.horseName,
          breed: this.form.breed,
          age: this.form.age,
          color: this.form.color,
          startAuction: this.form.startAuction,
          endAuction: this.form.endAuction,
          startingPrice: this.form.startingPrice,
          setIncrement: this.form.setIncrement,
          description: this.form.description,
          horsePictures: this.uploadedHorsePictures,
          documents: this.uploadedDocuments,
        };
  
        // Save to localStorage (replace this with API/backend storage logic)
        let savedHorses = JSON.parse(localStorage.getItem("registeredHorses")) || [];
        savedHorses.push(newHorse);
        localStorage.setItem("registeredHorses", JSON.stringify(savedHorses));
  
        // Redirect to profile and scroll to "Your Auctions"
        this.$router.push({ name: 'Profile' }).then(() => {
          // Scroll to the "Your Auctions" section after redirection
          this.$nextTick(() => {
            const yourAuctionsSection = document.querySelector('.your-auctions');
            if (yourAuctionsSection) {
              yourAuctionsSection.scrollIntoView({ behavior: 'smooth' });
            }
          });
        });
      },
      cancelRegistration() {
        this.showPopup = false;
      }
    },
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
  