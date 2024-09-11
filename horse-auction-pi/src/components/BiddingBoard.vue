<template>
  <div id="bidding-board">
    <!-- Header Section -->
    <header class="bidding-board-header">
      <h1>Current Running Auctions</h1>
    </header>

    <!-- Auction Cards -->
    <div class="container mt-5">
      <div class="row">
        <!-- Iterate through the filtered running auctions and display each one as a card -->
        <div class="col-md-4" v-for="auction in runningAuctions" :key="auction.id">
          <div class="card mb-4">
            <img :src="auction.horseImage" class="card-img-top" :alt="auction.horseName" />
            <div class="card-body">
              <h5 class="card-title">{{ auction.horseName }}</h5>
              <p class="card-text">
                <strong>{{ auction.hasBid ? 'Current Bid:' : 'Starting Bid:' }}</strong>
                ${{ auction.currentBid || auction.startingBid }}
              </p>
              <p class="card-text">
                <strong>Auction Ends In:</strong> 
                <span v-if="auction.timeRemaining > 0">{{ formatTime(auction.timeRemaining) }}</span>
                <span v-else class="text-danger">This auction has ended</span>
              </p>
              <!-- New: Display last bid placed time -->
              <p v-if="auction.lastBidPlacedAt" class="card-text">
                <strong>Last Bid Placed At:</strong> {{ formatDate(auction.lastBidPlacedAt) }}
              </p>
              <!-- View Details Button -->
              <button @click="viewDetails(auction.id)" class="btn btn-primary mb-2" :disabled="auction.timeRemaining <= 0">View Details</button>
              <!-- Bid Now Button (disabled if auction has ended) -->
              <button @click="placeBid(auction.id)" class="btn btn-success" :disabled="auction.timeRemaining <= 0">Bid Now</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "BiddingBoard",
  data() {
    return {
      auctions: [
        {
          id: 1,
          horseName: "Fenix",
          startingBid: 5000,
          currentBid: null,
          startDate: new Date('2024-09-10T00:00:00'), // Set auction start date
          endDate: new Date('2024-12-30T23:59:59'), // Set auction end date
          horseImage: "https://www.nzequestrian.org.nz/wp-content/uploads/Meg-Bisset-Freestyle-Twyst-Shout-winners-of-the-Country-TV-Pony-Grand-Prix-Photo-Credit-Elise-Ford-1-600x419.jpg",
          hasBid: false,
          timeRemaining: 0, // This will be updated with the actual time remaining
          lastBidPlacedAt: new Date('2024-09-01T14:30:00'), // Example: no bid yet placed
        },
        {
          id: 2,
          horseName: "Carrisima PRIMA",
          startingBid: 10000,
          currentBid: 12000,
          startDate: new Date('2025-01-10T00:00:00'), // Future auction, start date is in the future
          endDate: new Date('2025-01-15T23:59:59'),
          horseImage: "https://path-to-horse-image2.jpg",
          hasBid: true,
          timeRemaining: 0,
          lastBidPlacedAt: null, // Example last bid date and time
        },
        // Add more auctions as needed
      ],
    };
  },
  computed: {
    // Filter auctions that are currently running (startDate <= now and endDate > now)
    runningAuctions() {
      const now = new Date();
      return this.auctions.filter(auction => auction.startDate <= now && auction.endDate > now);
    }
  },
  methods: {
    // Method to calculate the time remaining (endDate - current date)
    calculateTimeRemaining(endDate) {
      const now = new Date();
      return Math.max(Math.floor((endDate - now) / 1000), 0); // Return time in seconds or 0 if auction has ended
    },
    // Method to format the time into days, hours, minutes, seconds
    formatTime(seconds) {
      const days = Math.floor(seconds / (24 * 60 * 60));
      const hours = Math.floor((seconds % (24 * 60 * 60)) / (60 * 60));
      const minutes = Math.floor((seconds % (60 * 60)) / 60);
      const sec = seconds % 60;
      return `${days}d : ${hours}h : ${minutes}m : ${sec}s`;
    },
    // Method to format date and time for last bid
    formatDate(date) {
      const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' };
      return new Date(date).toLocaleDateString(undefined, options);
    },
    // Navigate to the Horse Listing Page
    viewDetails(horseId) {
      this.$router.push({ name: "HorseListing", params: { id: horseId } });
    },
    // Navigate to the Bidding Page
    placeBid(horseId) {
      this.$router.push({ name: "BidBoard", params: { id: horseId } });
    }
  },
  mounted() {
    // Update the time remaining for each auction
    this.timer = setInterval(() => {
      this.auctions.forEach(auction => {
        auction.timeRemaining = this.calculateTimeRemaining(auction.endDate);
      });
    }, 1000);
  },
  beforeUnmount() {
    // Clear the interval when the component is destroyed
    clearInterval(this.timer);
  }
};
</script>

<style scoped>
/* Header Styling */
.bidding-board-header {
  background-color: #2e3c4f;
  color: white;
  padding: 20px;
  text-align: center;
}

/* Auction Card Styling */
.card {
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.card-img-top {
  height: 200px;
  object-fit: cover;
}

.card-body {
  padding: 15px;
}

.card-title {
  font-weight: bold;
}

.btn-primary {
  background-color: #007bff;
  border-color: #007bff;
}

.btn-success {
  background-color: #28a745;
  border-color: #28a745;
}

.text-danger {
  color: #dc3545 !important;
}
</style>
