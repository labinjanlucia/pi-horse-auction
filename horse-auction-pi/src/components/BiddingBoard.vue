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
            <img :src="auction.horsePictures[0]" class="card-img-top" :alt="auction.horseName" />
            <div class="card-body">
              <h5 class="card-title">{{ auction.horseName }}</h5>
              <p class="card-text">
                <strong>{{ auction.currentBid ? 'Current Bid:' : 'Starting Bid:' }}</strong>
                ${{ auction.currentBid || auction.startingPrice }}
              </p>
              <p class="card-text">
                <strong>Auction Ends In:</strong> 
                <span v-if="auction.timeRemaining > 0">{{ formatTime(auction.timeRemaining) }}</span>
                <span v-else class="text-danger">This auction has ended</span>
              </p>
              <p class="card-text">
                <strong>Last Bid Placed At:</strong> {{ formatDate(auction.lastBidPlacedAt || auction.startAuction) }}
              </p>
              <!-- View Details Button -->
              <button @click="viewDetails(auction.id)" class="btn btn-primary mb-2" :disabled="auction.timeRemaining <= 0">View Details</button>
              <!-- Bid Now Button (opens the bidding modal) -->
              <button @click="openBidModal(auction)" class="btn btn-success" :disabled="auction.timeRemaining <= 0">Bid Now</button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Bid Modal -->
    <div v-if="showBidModal" class="bid-modal">
      <div class="bid-modal-content">
        <h3>{{ currentAuction.horseName }}</h3>
        <p><strong>How much is your bid?</strong></p>
        <div class="bid-control">
          <button @click="decreaseBid">-{{ currentAuction.setIncrement }}</button>
          <span>{{ currentBid }} {{ currency }}</span>
          <button @click="increaseBid">+{{ currentAuction.setIncrement }}</button>
        </div>
        <p>Total Amount: {{ currentBid }} {{ currency }}</p>
        <p>Direct bid - Your bid will be set immediately</p>
        <button @click="placeBid" class="btn btn-primary">Place a direct bid of {{ currentBid }} {{ currency }}</button>
        <button @click="closeBidModal" class="btn btn-secondary">Cancel</button>
      </div>
    </div>
  </div>
</template>

<script>
import { collection, getDocs, doc, updateDoc, getDoc } from 'firebase/firestore'; // Firestore functions
import { db } from '@/firebase'; // Firebase Firestore instance

export default {
  name: "BiddingBoard",
  data() {
    return {
      auctions: [],  // Array to hold all the auctions
      showBidModal: false, // Flag to show or hide the bidding modal
      currentAuction: null, // The auction the user is bidding on
      currentBid: 0, // The current bid the user will place
      currency: 'eu', // The currency symbol (adjust as needed)
    };
  },
  computed: {
    // Filter auctions that are currently running (startAuction <= now and endAuction > now)
    runningAuctions() {
      const now = new Date();
      return this.auctions.filter(auction => auction.startAuction <= now && auction.endAuction > now);
    }
  },
  methods: {
    // Fetch auction data from Firestore
    async fetchAuctions() {
      try {
        const auctionsRef = collection(db, 'Auctions');
        const querySnapshot = await getDocs(auctionsRef);
        // Map the Firestore query result to the auctions array and convert date strings to actual Date objects
        this.auctions = querySnapshot.docs.map(doc => {
          const auction = doc.data();
          return {
            id: doc.id,
            ...auction,
            startAuction: new Date(auction.startAuction),  // Convert startAuction string to Date
            endAuction: new Date(auction.endAuction),      // Convert endAuction string to Date
            timeRemaining: this.calculateTimeRemaining(new Date(auction.endAuction))
          };
        });
        // Start countdown for each auction
        this.startCountdown();
      } catch (error) {
        console.error('Error fetching auctions:', error);
      }
    },
    // Open the bid modal and set the auction the user wants to bid on
    openBidModal(auction) {
      this.currentAuction = auction;
      this.currentBid = auction.currentBid || auction.startingPrice;
      this.showBidModal = true;
    },
    // Close the bid modal
    closeBidModal() {
      this.showBidModal = false;
    },
    // Increase the bid by the set increment
    increaseBid() {
      this.currentBid += this.currentAuction.setIncrement;
    },
    // Decrease the bid by the set increment, but ensure the bid doesn't go below the starting price
    decreaseBid() {
      const minimumBid = this.currentAuction.currentBid || this.currentAuction.startingPrice;
      if (this.currentBid - this.currentAuction.setIncrement >= minimumBid) {
        this.currentBid -= this.currentAuction.setIncrement;
      }
    },
    // Place the bid and update Firestore
    async placeBid() {
      try {
        const auctionDoc = doc(db, 'Auctions', this.currentAuction.id);

        // Retrieve the current bid from Firestore to ensure consistency
        const auctionSnapshot = await getDoc(auctionDoc);
        const auctionData = auctionSnapshot.data();
        const existingBid = auctionData.currentBid || auctionData.startingPrice;

        // Calculate the new bid by adding the user's placed bid to the existing bid
        const newBid = existingBid + (this.currentBid - existingBid);
        const bidTime = new Date();


        // Update Firestore with the new currentBid and lastBidPlacedAt
        await updateDoc(auctionDoc, {
          currentBid: newBid,  // Add the new bid to the current bid
          lastBidPlacedAt: bidTime,  // Set last bid time to now
          highestBidder: 'userID-placeholder' // Replace with actual user ID of the logged-in user
        });

        this.closeBidModal(); // Close the modal after placing the bid
        await this.fetchAuctions();  // Refresh auction data after placing the bid to update all components
      } catch (error) {
        console.error('Error placing bid:', error);
      }
    },
    // Start real-time countdown for each auction
    startCountdown() {
      this.timer = setInterval(() => {
        this.auctions = this.auctions.map(auction => ({
          ...auction,
          timeRemaining: this.calculateTimeRemaining(auction.endAuction),
        }));
      }, 1000);  // Update every second
    },
    // Calculate the time remaining (endDate - current date)
    calculateTimeRemaining(endDate) {
      const now = new Date().getTime();
      const end = new Date(endDate).getTime();
      return Math.max(Math.floor((end - now) / 1000), 0);  // Return time in seconds or 0 if auction has ended
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
  // Check if the date is a Firestore Timestamp and convert it to a JS Date
  if (date && date.toDate) {
    date = date.toDate();  // Convert Firestore Timestamp to JavaScript Date
  }
  
  const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' };
  return new Date(date).toLocaleDateString(undefined, options);
},
    // Navigate to the Horse Listing Page
    viewDetails(auctionId) {
      this.$router.push({ name: "HorseListing", params: { id: auctionId } });
    },
  },
  mounted() {
    this.fetchAuctions();  // Fetch auction data when the component is mounted

    // Update the time remaining for each auction in real-time
    this.timer = setInterval(() => {
      this.auctions.forEach(auction => {
        auction.timeRemaining = this.calculateTimeRemaining(auction.endAuction);
      });
    }, 1000);
  },
  beforeUnmount() {
    // Clear the interval when the component is destroyed
    clearInterval(this.timer);
  }
};
</script>



<!-- Add the following styles for the modal -->
<style scoped>
.bid-modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.6);
  display: flex;
  justify-content: center;
  align-items: center;
}

.bid-modal-content {
  background-color: white;
  padding: 20px;
  border-radius: 8px;
  text-align: center;
}

.bid-control {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 20px;
}

.bid-control button {
  padding: 10px;
  margin: 0 10px;
  font-size: 20px;
}

span {
  font-size: 24px;
  font-weight: bold;
}
</style>


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
