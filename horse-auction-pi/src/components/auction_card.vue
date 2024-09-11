<template>
    <div>
      <section class="auction-section mt-5 mb-5">
        <div class="container">
          <div class="auction-header d-flex justify-content-between align-items-center">
            <h2>Select Auction Type:</h2>
            <select v-model="selectedAuctionType" @change="filterAuctions">
              <option value="current">Current Auction</option>
              <option value="future">Future Auction</option>
            </select>
          </div>
  
          <!-- Auction Card -->
          <div v-for="auction in filteredAuctions" :key="auction.id" class="auction-card mb-4">
            <div class="row g-0">
              <div class="col-md-4">
                <img :src="auction.image" class="img-fluid rounded-start" alt="Horse Image">
              </div>
              <div class="col-md-8">
                <div class="card-body">
                  <h5 class="card-title">LIVE AUCTION - {{ auction.location }}</h5>
                  <p class="card-text"><strong>Horse Name:</strong> {{ auction.horseName }}</p>
                  
                  <!-- Show Starting Bid if auction is new, otherwise show Current Bid -->
                  <p class="card-text">
                    <strong v-if="auction.currentBid === null">Starting Bid:</strong>
                    <strong v-else>Current Bid:</strong>
                    ${{ auction.currentBid !== null ? auction.currentBid : auction.startingBid }}
                  </p>
  
                  <!-- Display countdown or auction end message -->
                  <p v-if="auction.timeRemaining > 0" class="card-text">
                    <strong>Auction Ends In:</strong> {{ countdown(auction.endDate) }}
                  </p>
                  <p v-else class="card-text text-danger">This auction has ended</p>
  
                  <!-- View Details Button -->
                  <a @click="viewDetails(auction.id)" class="btn btn-primary">View Details</a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  </template>
  
  <script>
  export default {
    data() {
      return {
        selectedAuctionType: 'current',
        auctions: [
          {
            id: 1,
            horseName: 'Fenix',
            location: 'Zagreb, HR',
            startingBid: 5000,
            currentBid: null, // Set to null if no bids have been placed yet
            endDate: '2024-04-15T12:00:00',
            image: 'https://www.nzequestrian.org.nz/wp-content/uploads/Meg-Bisset-Freestyle-Twyst-Shout-winners-of-the-Country-TV-Pony-Grand-Prix-Photo-Credit-Elise-Ford-1-600x419.jpg',
            timeRemaining: 100000 // Some value in milliseconds for countdown
          },
          // Other auctions...
        ],
        filteredAuctions: []
      };
    },
    mounted() {
      this.filterAuctions();
    },
    methods: {
        methods: {
  submitForm() {
    if (!this.validateForm()) {
      return;
    }
    
    // Collect the horse registration data
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
      currentBid: null, // No bids placed initially
    };

    // Store the horse data (you can replace this with API or Firebase logic)
    let savedHorses = JSON.parse(localStorage.getItem("registeredHorses")) || [];
    savedHorses.push(newHorse);
    localStorage.setItem("registeredHorses", JSON.stringify(savedHorses));

    // Show confirmation popup
    this.showPopup = true;
  }
},

      filterAuctions() {
        // Filter auctions based on selected type
        if (this.selectedAuctionType === 'current') {
          this.filteredAuctions = this.auctions.filter(auction => auction.timeRemaining > 0);
        } else {
          this.filteredAuctions = this.auctions.filter(auction => auction.timeRemaining <= 0);
        }
      },
      countdown(endDate) {
        const end = new Date(endDate).getTime();
        const now = new Date().getTime();
        const timeLeft = end - now;
  
        if (timeLeft < 0) {
          return 'Auction has ended';
        }
  
        const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
        const hours = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);
  
        return `${days}d : ${hours}h : ${minutes}m : ${seconds}s`;
      },
      viewDetails(id) {
        // Navigate to auction details page
        this.$router.push({ name: 'HorseListings', params: { id } });
      }
    }
    
  };
  </script>
  
  <style scoped>
  .auction-section {
    padding: 20px;
  }
  .auction-card {
    border: none;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    border-radius: 8px;
  }
  .card-body {
    padding: 20px;
  }
  .card-title {
    font-size: 1.5rem;
    font-weight: bold;
  }
  .card-text {
    font-size: 1.2rem;
  }
  .btn-primary {
    background-color: #007bff;
    border: none;
  }
  </style>
  