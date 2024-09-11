<template>
    <div id="horse-listing">
      <!-- Header Section -->
      <header class="listing-header">
        <h1>COLLECTION - DRESSAGE</h1>
      </header>
  
      <!-- Bidding Board Button -->
      <div class="container text-center mt-4">
        <!-- Use router push to navigate to the Bidding Board -->
        <button class="btn btn-outline-dark" @click="goToBiddingBoard">View the Bidding Board</button>
      </div>
  
      <!-- Horse Details Section -->
      <section class="horse-details mt-5">
        <div class="container">
          <div class="row">
            <!-- Horse Images -->
            <div class="col-md-8">
              <div class="card">
                <img :src="horse.mainImage" alt="Horse Image">
                <div class="card-body">
                  <h5 class="card-title">{{ horse.name }}</h5>
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
                  <li v-for="(document, index) in horse.Documents" :key="index">
                    <a :href="document.url" target="_blank">{{ document.name }}</a>
                  </li>
                </ul>
              </li>
              
              <!-- Auction Terms -->
              <li class="list-group-item">
                <i class="fas fa-gavel"></i> Auction Terms:
                <a href="/path-to-auction-terms.pdf" download>Auction Terms File</a> <!-- Auction terms download link -->
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
  </template>
  
  <script>
  export default {
    name: 'HorseListing',
    data() {
      return {
        horse: {
          id:1,
          name: 'Fenix',
          tagline: 'Young eventing champion',
          gender: 'Gelding',
          dob: '04.04.2020',
          breed: 'Netherland sport horse',
          color: 'Grey',
          size: 165,
          mainImage: 'https://www.nzequestrian.org.nz/wp-content/uploads/Meg-Bisset-Freestyle-Twyst-Shout-winners-of-the-Country-TV-Pony-Grand-Prix-Photo-Credit-Elise-Ford-1-600x419.jpg', 
          description: 'Young and elegant gelding, with smooth movements. Perfect for higher levels of jumping.',
          Documents: [
          { name: "Vet Report 2023", url: "https://example.com/vet-report-2023.pdf" },
          { name: "Family tree", url: "https://example.com/family-tree.pdf" },
        ],
        },
      };
    },
    methods: {
      goToBiddingBoard() {
        // Navigate to the Bidding Board page for this horse
        this.$router.push({ name: 'BiddingBoard', params: { id: this.horse.id } });
      }
    },
    created() {
      // Fetch the horse details here using the ID from the route
      const horseId = this.$route.params.id;
      // Fetch the horse data based on the horseId
      // For now, we're using static data (you can fetch from an API here)
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
  