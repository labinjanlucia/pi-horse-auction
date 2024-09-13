<template>
  <div id="bidding-board">
    <header class="bidding-board-header">
      <h1>Current Running Auctions</h1>
    </header>

    <div class="container mt-5">
      <div class="row">
        <div class="col-md-6" v-for="auction in runningAuctions" :key="auction.id">
          <div v-if="auction && auction.id" class="card mb-4">
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
           
              <p class="card-text">
                <strong>Highest Bidder:</strong> {{ auction.highestBidderName || "No bids yet" }}
              </p>

              <button @click="viewDetails(auction.id)" class="btn btn-primary mb-2" :disabled="auction.timeRemaining <= 0">View Details</button>
              <button @click="openBidModal(auction)" class="btn btn-success" :disabled="auction.timeRemaining <= 0">Bid Now</button>
            </div>
          </div>

          <div v-if="leaderboards[auction.id]" class="leaderboard mb-4">
            <h5>Leaderboard</h5>
            <ul v-if="leaderboards[auction.id] && leaderboards[auction.id].length > 0">
              <li v-for="(bid, index) in leaderboards[auction.id]" :key="index">
                {{ bid.username }} - ${{ bid.amount }}
              </li>
            </ul>
            <p v-else>No bids yet.</p>
          </div>
        </div>
      </div>
    </div>

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
        <button @click="placeBid" class="btn btn-primary">Place a direct bid of {{ currentBid }} {{ currency }}</button>

        <button @click="closeBidModal" class="btn btn-secondary">Cancel</button>
      </div>
    </div>
  </div>
</template>

<script>
import { collection, getDocs, doc, updateDoc, getDoc, setDoc, query, orderBy } from 'firebase/firestore'; 
import { auth, db } from '@/firebase'; 

export default {
  name: "BiddingBoard",
  data() {
    return {
      auctions: [],
      showBidModal: false,
      currentAuction: null,
      currentBid: 0,
      currency: 'eu',
      leaderboards: {}, 
      yourAuctions: [],  
      biddedAuctions: [],  
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
        this.auctions = querySnapshot.docs.map((doc) => {
          const auction = doc.data();
          if (auction.status === 'completed') {
            return null;
          }

          return {
            id: doc.id,
            ...auction,
            startAuction: new Date(auction.startAuction),
            endAuction: new Date(auction.endAuction),
            timeRemaining: this.calculateTimeRemaining(new Date(auction.endAuction)),
            highestBidderName: auction.highestBidderName || 'N/A', 
          };
        }).filter(auction => auction !== null);
        this.startCountdown();
      } catch (error) {
        console.error('Error fetching auctions:', error);
      }
    },

    async handleAuctionEnd(auction) {
      try {
        const auctionDoc = doc(db, 'Auctions', auction.id);

        if (!auction.highestBidder) {
          console.log("No bids placed. Auction has ended without a winner.");
          return;
        }

        const userWonAuctionsRef = doc(db, 'users', auction.highestBidder, 'wonAuctions', auction.id);
        await setDoc(userWonAuctionsRef, {
          horseName: auction.horseName,
          horsePictures: auction.horsePictures,
          winningBid: auction.currentBid,
          wonAt: new Date(),
        });

        await updateDoc(auctionDoc, {
          status: 'completed',
          winner: auction.highestBidder,  
        });

        this.auctions = this.auctions.filter(a => a.id !== auction.id);

        console.log(`Auction ${auction.horseName} has ended. Winner: ${auction.highestBidderName}`);
      } catch (error) {
        console.error('Error handling auction end:', error);
      }
    },

    async fetchLeaderboard(auctionId) {
      try {
        const bidsRef = collection(db, 'Auctions', auctionId, 'bids');
        const bidsQuery = query(bidsRef, orderBy('bidTime', 'desc')); 
        const bidsSnapshot = await getDocs(bidsQuery);

        const bids = await Promise.all(bidsSnapshot.docs.map(async bidDoc => {
          const bidData = bidDoc.data();
          const userDoc = await getDoc(doc(db, 'users', bidData.userId));
          const username = userDoc.exists() ? userDoc.data().username : 'Unknown User';
          return {
            username,
            amount: bidData.amount,
          };
        }));

        this.$set(this.leaderboards, auctionId, bids);
      } catch (error) {
        console.error('Error fetching leaderboard:', error);
      }
    },

    openBidModal(auction) {
      this.currentAuction = auction;
      this.currentBid = auction.currentBid || auction.startingPrice;
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

        if (this.currentBid <= existingBid) {
          alert("Your bid must be higher than the current bid.");
          return;
        }

        const newBid = this.currentBid; 
        const bidTime = new Date();

        const userId = auth.currentUser.uid;
        const userDoc = await getDoc(doc(db, 'users', userId));
        if (!userDoc.exists()) {
          throw new Error("User data not found.");
        }
        const username = userDoc.data().username || 'Unknown User';

        await updateDoc(auctionDoc, {
          currentBid: newBid,
          lastBidPlacedAt: bidTime,
          highestBidder: userId,
          highestBidderName: username, 
        });

        const bidDocRef = doc(collection(db, 'Auctions', this.currentAuction.id, 'bids'));
        await setDoc(bidDocRef, {
          userId,
          amount: newBid,
          bidTime: bidTime,
        });

        this.closeBidModal();
        await this.fetchAuctions();
      } catch (error) {
        console.error('Error placing bid:', error);
        alert('There was an error placing your bid. Please try again.');
      }
    },

    startCountdown() {
      this.timer = setInterval(() => {
        this.auctions = this.auctions.map(auction => {
          auction.timeRemaining = this.calculateTimeRemaining(auction.endAuction);
          
          if (auction.timeRemaining === 0) {
            this.handleAuctionEnd(auction);
          }

          return auction;
        });
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
