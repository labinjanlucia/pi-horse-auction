
<template>
  <div id="homepage">
    <!-- Main Section -->
    <section class="main-section text-center">
      <div class="bg-image">
        <h1>HORSE AUCTION</h1>
        <p v-if="currentDisplayedAuction" class="auction-horse-name">{{ currentDisplayedAuction.horseName }}</p>
        <p>Auction ends in:</p>
        <div class="countdown">
          <span>{{ countdown(currentDisplayedAuction.endAuction) }}</span>
        </div>
        <!-- Discover Horse Button -->
        <button class="btn btn-outline-light mt-4" @click="goToHorseListing">DISCOVER HORSE</button>
      </div>
    </section>

    <!-- Currently Running Section -->
    <section class="currently-running mt-5 mb-5">
      <div class="container">
        <h2 class="text-center">Currently Running</h2>

        <!-- Auction Cards -->
        <div v-if="auctions.length">
          <div class="card mb-3" v-for="auction in auctions" :key="auction.id">
            <div class="row g-0">
              <div class="col-md-4">
                <img :src="auction.horsePictures[0]" class="img-fluid rounded-start" alt="Horse Image">
              </div>
              <div class="col-md-8">
                <div class="card-body">
                  <h5 class="card-title">ONLINE AUCTION</h5>
                  <p class="card-text"><strong>Horse Name:</strong> {{ auction.horseName }}</p>
                  <p class="card-text"><strong>Current Bid:</strong> ${{ auction.currentBid }}</p>
                  <p class="card-text"><strong>Auction ends in:</strong> {{ countdown(auction.endAuction) }}</p>
                 
                  <button @click="viewDetails(auction.id)" class="btn btn-primary">View Details</button>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div v-else>
          <p>No auctions currently running.</p>
        </div>
      </div>
    </section>
  </div>
</template>

<script>
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase"; // Import the Firestore database

export default {
  name: "HomePage",
  data() {
    return {
      auctions: [], // Holds the auction data from Firebase
      currentAuctionIndex: 0, // Index to track the currently displayed auction
      countdownTimer: null, // Holds the interval for updating the countdown
      currentTime: new Date(), // Track current time for real-time countdown updates
    };
  },
  computed: {
    // Get the currently displayed auction based on the index
    currentDisplayedAuction() {
      return this.auctions.length > 0 ? this.auctions[this.currentAuctionIndex] : {};
    },
  },
  methods: {
    viewDetails(auctionId) {
      this.$router.push({ name: 'HorseListing', params: { id: auctionId } });
    },
    goToHorseListing() {
      if (this.currentDisplayedAuction && this.currentDisplayedAuction.id) {
        this.$router.push({ name: 'HorseListing', params: { id: this.currentDisplayedAuction.id } });
      }
    },
    formatDate(dateString) {
      const options = { year: 'numeric', month: 'long', day: 'numeric' };
      return new Date(dateString).toLocaleDateString(undefined, options);
    },
    countdown(endDate) {
      if (!endDate) return 'N/A';

      const now = this.currentTime.getTime(); // Use updated currentTime
      const end = new Date(endDate).getTime();
      const timeLeft = end - now;

      if (timeLeft < 0) return 'Auction ended';

      const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
      const hours = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);

      return `${days}d : ${hours}h : ${minutes}m : ${seconds}s`;
    },
    async fetchAuctions() {
      try {
        const querySnapshot = await getDocs(collection(db, "Auctions"));
        const auctionsData = [];
        const today = new Date();

        querySnapshot.forEach((doc) => {
          const auction = doc.data();
          // Convert startAuction and endAuction to Date objects
          auction.startAuction = new Date(auction.startAuction);
          auction.endAuction = new Date(auction.endAuction);
          auction.lastBidPlacedAt = auction.lastBidPlacedAt ? new Date(auction.lastBidPlacedAt) : null;

          // Only push auctions that are currently running (startAuction <= today)
          if (auction.startAuction <= today) {
            auctionsData.push({ id: doc.id, ...auction });
          }
        });

        // Sort by the last bid placed date (most recent bids at the top)
        auctionsData.sort((a, b) => {
          const aBidTime = a.lastBidPlacedAt ? new Date(a.lastBidPlacedAt) : 0;
          const bBidTime = b.lastBidPlacedAt ? new Date(b.lastBidPlacedAt) : 0;
          return bBidTime - aBidTime;
        });

        this.auctions = auctionsData;
      } catch (error) {
        console.error("Error fetching auctions: ", error);
      }
    },
    // Update auction index every 30 seconds
    rotateAuction() {
      setInterval(() => {
        this.currentAuctionIndex = (this.currentAuctionIndex + 1) % this.auctions.length;
      }, 30000); // 30 seconds
    },
    // Continuously update countdown for the currently displayed auction
    startCountdownUpdate() {
      this.countdownTimer = setInterval(() => {
        this.currentTime = new Date(); // Update current time every second
      }, 1000); // Update every second
    },
  },
  created() {
    this.fetchAuctions(); // Fetch auction data when the component is created
  },
  mounted() {
    this.rotateAuction(); // Start rotating the displayed auction every 30 seconds
    this.startCountdownUpdate(); // Start continuously updating the countdown
  },
  beforeUnmount() {
    // Clear intervals when component is destroyed to avoid memory leaks
    clearInterval(this.countdownTimer);
  }
};
</script>





<style>
/* General Styling */
body {
  background-color: #f8f9fa;
}

/* Navbar Styling */
.navbar {
  padding: 1rem;
}

.nav-link {
  color: #ffffff !important;
}

.navbar-brand {
  font-weight: bold;
  color: #ffffff !important;
}

/* Main Section Styling */
.main-section {
  height: 500px;
  background-image: url('https://keyassets.timeincuk.net/inspirewp/live/wp-content/uploads/sites/14/2019/11/Hello-Sanctos-DSC_0200-40.jpg');
  background-size: cover;
  background-position: center;
  color: #ffffff;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.main-section h1 {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.countdown {
  font-size: 2rem;
  font-weight: bold;
}

/* Currently Running Auction Styling */
.currently-running .card {
  border: none;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.card-title {
  font-weight: bold;
}

.card-text {
  font-size: 1rem;
}

.btn-outline-light {
  border-color: #ffffff;
  color: #ffffff;
}

.btn-outline-light:hover {
  background-color: #ffffff;
  color: #000000;
}
</style>

  