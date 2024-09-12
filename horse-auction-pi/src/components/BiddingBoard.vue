<template>
  <div id="bidding-board">
    <!-- Header Section -->
    <header class="bidding-board-header">
      <h1>Current Running Auctions</h1>
    </header>

    <!-- Auction Cards -->
    <div class="container mt-5">
      <div class="row">
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
              <button @click="viewDetails(auction.id)" class="btn btn-primary mb-2" :disabled="auction.timeRemaining <= 0">View Details</button>
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

        <!-- Automatic Bidding Section -->
        <h4>Automatic Bid</h4>
        <p>Set an automatic bid - The system will bid on your behalf until the max bid is reached.</p>
        <div class="bid-control">
          <input type="number" v-model="maxAutoBid" placeholder="Enter maximum bid amount" />
        </div>
        <button @click="setAutoBid" class="btn btn-outline-primary">Set Automatic Bid</button>

        <button @click="closeBidModal" class="btn btn-secondary">Cancel</button>
      </div>
    </div>
  </div>
</template>
<script>
import { collection, getDocs, doc, updateDoc, getDoc, arrayUnion, setDoc } from 'firebase/firestore'; // Firestore functions
import { auth, db } from '@/firebase'; // Firebase Firestore instance

export default {
  name: "BiddingBoard",
  data() {
    return {
      auctions: [],
      showBidModal: false,
      currentAuction: null,
      currentBid: 0,
      maxAutoBid: 0, // To track the user's maximum automatic bid
      currency: 'eu',
      autoBidInterval: null, // To handle automatic bidding
    };
  },
  computed: {
    runningAuctions() {
      const now = new Date();
      return this.auctions.filter(auction => auction.startAuction <= now && auction.endAuction > now);
    }
  },
  methods: {
    async fetchAuctions() {
      try {
        const auctionsRef = collection(db, 'Auctions');
        const querySnapshot = await getDocs(auctionsRef);
        this.auctions = querySnapshot.docs.map(doc => {
          const auction = doc.data();
          return {
            id: doc.id,
            ...auction,
            startAuction: new Date(auction.startAuction),
            endAuction: new Date(auction.endAuction),
            timeRemaining: this.calculateTimeRemaining(new Date(auction.endAuction)),
          };
        });
        this.startCountdown();
      } catch (error) {
        console.error('Error fetching auctions:', error);
      }
    },
    openBidModal(auction) {
      this.currentAuction = auction;
      this.currentBid = auction.currentBid || auction.startingPrice;
      this.maxAutoBid = 0; // Reset the automatic bid input
      this.showBidModal = true;
    },
    closeBidModal() {
      this.showBidModal = false;
    },
    increaseBid() {
      this.currentBid += this.currentAuction.setIncrement;
    },
    decreaseBid() {
      const minimumBid = this.currentAuction.currentBid || this.currentAuction.startingPrice;
      if (this.currentBid - this.currentAuction.setIncrement >= minimumBid) {
        this.currentBid -= this.currentAuction.setIncrement;
      }
    },
    async placeBid() {
      try {
        const auctionDoc = doc(db, 'Auctions', this.currentAuction.id);
        const auctionSnapshot = await getDoc(auctionDoc);
        const auctionData = auctionSnapshot.data();
        const existingBid = auctionData.currentBid || auctionData.startingPrice;

        // Calculate the new bid
        const newBid = existingBid + (this.currentBid - existingBid);
        const bidTime = new Date();

        // Update Firestore with the new bid
        await updateDoc(auctionDoc, {
          currentBid: newBid,
          lastBidPlacedAt: bidTime,
          highestBidder: auth.currentUser.uid, // Set the highest bidder
        });

        // Now update the 'bidders' collection to track the auctions the user has bid on
        const userId = auth.currentUser.uid;
        const bidderDocRef = doc(db, 'bidders', userId);
        const bidderDoc = await getDoc(bidderDocRef);

        if (bidderDoc.exists()) {
          // If the bidder document exists, update it by adding the auctionId (ensure no duplicates)
          await updateDoc(bidderDocRef, {
            auctionIds: arrayUnion(this.currentAuction.id), // Add auction ID if not already present
          });
        } else {
          // If the bidder document doesn't exist, create it
          await setDoc(bidderDocRef, {
            auctionIds: [this.currentAuction.id], // Create with the current auction ID
          });
        }

        this.closeBidModal(); // Close the modal after placing the bid
        await this.fetchAuctions(); // Refresh auction data after placing the bid
      } catch (error) {
        console.error('Error placing bid:', error);
      }
    },    // Set the maximum automatic bid for the user
    async setAutoBid() {
      try {
        if (this.maxAutoBid <= this.currentBid) {
          alert("Max bid must be greater than the current bid.");
          return;
        }

        const auctionDoc = doc(db, 'Auctions', this.currentAuction.id);

        await updateDoc(auctionDoc, {
          autoBidder: auth.currentUser.uid,
          maxAutoBid: this.maxAutoBid,
        });

        alert(`Automatic bid of max ${this.maxAutoBid} ${this.currency} has been set.`);
        this.autoBid();
      } catch (error) {
        console.error('Error setting automatic bid:', error);
      }
    },
    // Handle automatic bidding logic
    async autoBid() {
      this.autoBidInterval = setInterval(async () => {
        const auctionDoc = doc(db, 'Auctions', this.currentAuction.id);
        const auctionSnapshot = await getDoc(auctionDoc);
        const auctionData = auctionSnapshot.data();
        const existingBid = auctionData.currentBid || auctionData.startingPrice;

        if (auctionData.autoBidder === auth.currentUser.uid && auctionData.maxAutoBid > existingBid) {
          const newAutoBid = existingBid + 1;
          await updateDoc(auctionDoc, {
            currentBid: newAutoBid,
            lastBidPlacedAt: new Date(),
            highestBidder: auth.currentUser.uid,
          });
        } else if (auctionData.maxAutoBid <= existingBid) {
          clearInterval(this.autoBidInterval); // Stop auto-bidding when max bid is reached
        }
      }, 3000); // Check every 3 seconds to place a bid
    },
    startCountdown() {
      this.timer = setInterval(() => {
        this.auctions = this.auctions.map(auction => ({
          ...auction,
          timeRemaining: this.calculateTimeRemaining(auction.endAuction),
        }));
      }, 1000);
    },
    calculateTimeRemaining(endDate) {
      const now = new Date().getTime();
      const end = new Date(endDate).getTime();
      return Math.max(Math.floor((end - now) / 1000), 0);
    },
    formatTime(seconds) {
      const days = Math.floor(seconds / (24 * 60 * 60));
      const hours = Math.floor((seconds % (24 * 60 * 60)) / (60 * 60));
      const minutes = Math.floor((seconds % (60 * 60)) / 60);
      const sec = seconds % 60;
      return `${days}d : ${hours}h : ${minutes}m : ${sec}s`;
    },
    formatDate(date) {
      if (date && date.toDate) {
        date = date.toDate();
      }
      const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' };
      return new Date(date).toLocaleDateString(undefined, options);
    },
    viewDetails(auctionId) {
      this.$router.push({ name: 'HorseListing', params: { id: auctionId } });
    },
  },
  mounted() {
    this.fetchAuctions();
    this.timer = setInterval(() => {
      this.auctions.forEach(auction => {
        auction.timeRemaining = this.calculateTimeRemaining(auction.endAuction);
      });
    }, 1000);
  },
  beforeUnmount() {
    clearInterval(this.timer);
    clearInterval(this.autoBidInterval); // Clear automatic bidding when the component is destroyed
  },
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
