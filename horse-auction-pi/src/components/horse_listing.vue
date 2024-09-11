<template>
  <div id="horse-listing">
    <!-- Loading and Error States -->
    <div class="container text-center" v-if="loading">Loading horse details...</div>
    <div class="container text-center text-danger" v-if="error">{{ error }}</div>

    <!-- Horse Details Section (only show when horse data is loaded) -->
    <div v-if="!loading && horse">
      <!-- Header Section -->
      <header class="listing-header">
        <h1>{{ horse.horseName }}</h1>
      </header>

      <!-- Bidding Board Button -->
      <div class="container text-center mt-4">
        <button class="btn btn-outline-dark" @click="goToBiddingBoard">View the Bidding Board</button>
      </div>

      <!-- Horse Details Section -->
      <section class="horse-details mt-5">
        <div class="container">
          <div class="row">
            <!-- Horse Images -->
            <div class="col-md-8">
              <div class="card">
                <img :src="horse.horsePictures[0]" alt="Horse Image">
                <div class="card-body">
                  <h5 class="card-title">{{ horse.horseName }}</h5>
                  <p class="card-text">{{ horse.tagline }}</p>
                </div>
              </div>
            </div>

            <!-- Horse Information -->
            <div class="col-md-4">
              <ul class="list-group">
                <li class="list-group-item"><strong>Gender:</strong> {{ horse.gender }}</li>
                <li class="list-group-item"><strong>Date of Birth:</strong> {{ horse.dob }}</li>
                <li class="list-group-item"><strong>Breed:</strong> {{ horse.breed }}</li>
                <li class="list-group-item"><strong>Color:</strong> {{ horse.color }}</li>
                <li class="list-group-item"><strong>Size:</strong> {{ horse.size }} cm</li>
                
                <!-- Documents -->
                <li class="list-group-item">
                  <i class="fas fa-file-alt"></i> Documents:
                  <ul>
                    <li v-for="(document, index) in horse.documents" :key="index">
                      <a :href="document" target="_blank">{{ 'Document ' + (index + 1) }}</a>
                    </li>
                  </ul>
                </li>
                
                <!-- Auction Terms -->
                <li class="list-group-item">
                  <i class="fas fa-gavel"></i> Auction Terms:
                  <a href="/path-to-auction-terms.pdf" download>Auction Terms File</a>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <!-- Description Section -->
      <section class="horse-description mt-5 mb-5">
        <div class="container">
          <h3>Description</h3>
          <p>{{ horse.description }}</p>
        </div>
      </section>
    </div>
  </div>
</template>

<script>
import { doc, getDoc } from "firebase/firestore";  // Firestore functions
import { db } from "@/firebase";  // Firebase Firestore instance

export default {
  data() {
    return {
      horse: null,  // The horse object will be fetched from Firestore
      loading: true,  // For loading state
      error: null,  // For error state
    };
  },
  methods: {
    async fetchHorseDetails(horseId) {
      this.loading = true; // Start loading
      this.error = null; // Reset error

      try {
        const horseRef = doc(db, "Auctions", horseId);  // Reference to the specific horse document
        const horseSnap = await getDoc(horseRef);

        if (horseSnap.exists()) {
          this.horse = horseSnap.data();  // Set the horse data from Firestore
        } else {
          this.error = "Horse not found!";
        }
      } catch (error) {
        console.error("Error fetching horse details:", error);
        this.error = "Failed to load horse details.";
      } finally {
        this.loading = false; // Stop loading once data is fetched
      }
    },
    goToBiddingBoard() {
      // Navigate to the Bidding Board page for this horse
      this.$router.push({ name: 'BiddingBoard', params: { id: this.horse.id } });
    }
  },
  async created() {
    const horseId = this.$route.params.id;  // Get horse ID from the route
    await this.fetchHorseDetails(horseId);  // Fetch horse details based on the ID
  }
};
</script>

  
  <style scoped>
  /* Header Styling */
  .listing-header {
    background-color: #2e3c4f;
    color: white;
    padding: 20px;
    text-align: center;
  }
  
  .listing-header h1 {
    margin: 0;
  }
  
  /* Button Styling */
  .btn-outline-dark {
    margin-bottom: 20px;
    padding: 10px 20px;
    font-size: 16px;
  }
  
  /* Horse Details Styling */
  .horse-details .card {
    margin-bottom: 20px;
    border: none;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  }
  
  .horse-details .list-group-item {
    font-size: 16px;
    padding: 15px;
  }
  
  /* Description Section Styling */
  .horse-description {
    background-color: #f8f9fa;
    padding: 20px;
  }
  
  .horse-description h3 {
    margin-bottom: 15px;
  }
  
  .horse-description p {
    font-size: 16px;
    color: #555;
  }
  
  /* Card Body Text */
  .card-title {
    font-size: 24px;
    font-weight: bold;
  }
  
  .card-text {
    font-size: 18px;
    color: #555;
  }
  </style>
  