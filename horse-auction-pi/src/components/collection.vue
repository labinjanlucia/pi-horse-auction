<template>
    <div id="collection" class="container">
      <!-- Auction Type Filter -->
      <div class="auction-type-filter mb-3">
        <label for="auctionType">Select Auction Type:</label>
        <select id="auctionType" v-model="selectedAuctionType" @change="filterAuctions">
          <option value="current">Current Auction</option>
          <option value="future">Future Auction</option>
        </select>
      </div>
  
      <!-- Current Auctions -->
      <section v-if="selectedAuctionType === 'current'">
        <h2>Current Auctions</h2>
        <div v-for="(auction, index) in currentAuctions" :key="index" class="auction-card">
          <img :src="auction.horsePictures[0].url" alt="Horse Image" class="card-img-top">
          <div class="card-body">
            <h5 class="card-title">{{ auction.horseName }}</h5>
            <p class="card-text"><strong>Start Bid:</strong> ${{ auction.startingPrice }}</p>
            <p class="card-text"><strong>Time Left:</strong> {{ countdown(auction.endAuction) }}</p>
            <button @click="viewDetails(auction.id)" class="btn btn-primary">View Details</button>
          </div>
        </div>
      </section>
  
      <!-- Future Auctions -->
      <section v-if="selectedAuctionType === 'future'">
        <h2>Future Auctions</h2>
        <div v-for="(auction, index) in futureAuctions" :key="index" class="auction-card">
          <img :src="auction.horsePictures[0].url" alt="Horse Image" class="card-img-top">
          <div class="card-body">
            <h5 class="card-title">{{ auction.horseName }}</h5>
            <p class="card-text"><strong>Start Bid:</strong> ${{ auction.startingPrice }}</p>
            <p class="card-text"><strong>Start Date:</strong> {{ auction.startAuction }}</p>
            <button @click="viewDetails(auction.id)" class="btn btn-primary">View Details</button>
          </div>
        </div>
      </section>
    </div>
  </template>
  
  <script>
  export default {
    data() {
      return {
        auctions: [], // Will contain all the auctions
        currentAuctions: [], // Auctions that are running currently
        futureAuctions: [], // Auctions that are scheduled for the future
        selectedAuctionType: 'current', // The current filter selection
      };
    },
    mounted() {
      // Fetch registered horses from localStorage
      const savedHorses = JSON.parse(localStorage.getItem('registeredHorses')) || [];
  
      console.log('Saved horses from localStorage:', savedHorses); // Check if horses are being retrieved
  
      // Get today's date
      const today = new Date().toISOString().split('T')[0];
  
      // Filter current and future auctions based on auction dates
      this.currentAuctions = savedHorses.filter((auction) => {
        console.log('Checking current auction:', auction.horseName, auction.startAuction, today);
        return auction.startAuction <= today;
      });
  
      this.futureAuctions = savedHorses.filter((auction) => {
        console.log('Checking future auction:', auction.horseName, auction.startAuction, today);
        return auction.startAuction > today;
      });
  
      // Log filtered auctions
      console.log('Current Auctions:', this.currentAuctions);
      console.log('Future Auctions:', this.futureAuctions);
    },
    methods: {
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
      viewDetails(auctionId) {
        // Navigate to the horse listing page for the selected auction
        this.$router.push({ name: 'HorseListings', params: { id: auctionId } });
      },
      filterAuctions() {
        // Get today's date
        const today = new Date().toISOString().split('T')[0];
  
        // Filter based on the selected auction type
        if (this.selectedAuctionType === 'current') {
          this.currentAuctions = this.auctions.filter((auction) => auction.startAuction <= today);
        } else {
          this.futureAuctions = this.auctions.filter((auction) => auction.startAuction > today);
        }
      },
    },
  };
  </script>
  
  <style scoped>
  .auction-card {
    background-color: #f8f9fa;
    border: none;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    margin-bottom: 20px;
    padding: 20px;
  }
  
  .card-img-top {
    width: 100%;
    height: 200px;
    object-fit: cover;
  }
  
  .card-body {
    padding: 20px;
  }
  
  .card-title {
    font-size: 24px;
    font-weight: bold;
  }
  
  .card-text {
    font-size: 16px;
    color: #555;
  }
  </style>
  
  