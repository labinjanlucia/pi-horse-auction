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
        <img :src="getHorseImage(auction)" alt="Horse Image" class="card-img-top">
        <div class="card-body">
          <h5 class="card-title">{{ auction.horseName }}</h5>
          <p class="card-text"><strong>Current Bid:</strong> ${{ auction.currentBid }}</p>
          <p class="card-text"><strong>Time Left:</strong> {{ auction.remainingTime }}</p>
          <button @click="viewDetails(auction.id)" class="btn btn-primary">View Details</button>
        </div>
      </div>
    </section>

    <!-- Future Auctions -->
    <section v-if="selectedAuctionType === 'future'">
      <h2>Future Auctions</h2>
      <div v-if="futureAuctions.length > 0">
        <div v-for="(auction, index) in futureAuctions" :key="index" class="auction-card">
          <img :src="getHorseImage(auction)" alt="Horse Image" class="card-img-top">
          <div class="card-body">
            <h5 class="card-title">{{ auction.horseName }}</h5>
            <p class="card-text"><strong>Starting Bid:</strong> ${{ auction.currentBid }}</p>
            <p class="card-text"><strong>Start Date:</strong> {{ auction.startAuction }}</p>
            <button @click="viewDetails(auction.id)" class="btn btn-primary">View Details</button>
          </div>
        </div>
      </div>
      <div v-else>
        <p>There are no future auctions yet.</p> <!-- Message for empty future auctions -->
      </div>
    </section>
  </div>
</template>

<script>
import { collection, getDocs } from 'firebase/firestore';  // Firestore functions
import { db } from '@/firebase';  // Firebase Firestore instance

export default {
  data() {
    return {
      auctions: [],  // All fetched auctions
      currentAuctions: [],  // Auctions currently running
      futureAuctions: [],  // Auctions scheduled for the future
      selectedAuctionType: 'current',  // Filter state (current or future)
    };
  },
  async mounted() {
    await this.fetchAuctionsFromFirestore();  // Fetch auctions from Firestore on mount
    this.filterAuctions();  // Filter auctions into current and future
    this.startCountdown();  // Start countdown timer for current auctions
  },
  methods: {
    // Fetch auctions from Firestore
    async fetchAuctionsFromFirestore() {
      try {
        const querySnapshot = await getDocs(collection(db, 'Auctions'));
        const auctionData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));

        this.auctions = auctionData;
      } catch (error) {
        console.error('Error fetching auctions from Firestore:', error);
      }
    },
    // Filter auctions into current and future based on the auction start date
    filterAuctions() {
    const today = new Date(); // Get current date and time

    if (this.selectedAuctionType === 'current') {
      // Filter auctions where the start date is today or earlier and end date is in the future (current auctions)
      this.currentAuctions = this.auctions.filter(auction => 
        new Date(auction.startAuction) <= today && new Date(auction.endAuction) > today
      );
    } else {
      // Filter auctions where the start date is in the future
      this.futureAuctions = this.auctions.filter(auction => 
        new Date(auction.startAuction) > today
      );
    }
  },
    // Get the first horse image or a fallback image
    getHorseImage(auction) {
      // Check if there are pictures and return the first one, or a fallback
      return auction.horsePictures && auction.horsePictures.length > 0
        ? auction.horsePictures[0]  // Since horsePictures is an array of strings, return the first string
        : 'https://via.placeholder.com/150';  // Fallback placeholder image
    },
      // Start the countdown for current auctions
      startCountdown() {
      setInterval(() => {
        this.currentAuctions.forEach(auction => {
          auction.remainingTime = this.countdown(auction.endAuction);
        });
      }, 1000);  // Update every second
    },
    // Countdown logic
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
    this.$router.push({ name: 'HorseListing', params: { id: auctionId } });

    }
  }
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
  
  