<template>
  <div id="profile" class="profile-container">
    <header class="profile-header">
      <h1>Profile</h1>
    </header>

    <!-- Loading State -->
    <div v-if="loading" class="loading-indicator">
      <p>Loading auctions...</p>
    </div>

    <!-- Content after data has loaded -->
    <div v-else>
      <!-- Display Current Username -->
      <section class="username-section mt-4">
        <h2>Username: {{ username }}</h2>
        <div>
          <button @click="showUsernameChange = !showUsernameChange" class="btn btn-outline-primary">
            Change Username
          </button>
        </div>

        <!-- Change Username Section -->
        <div v-if="showUsernameChange" class="change-username mt-4">
          <form @submit.prevent="changeUsername">
            <div class="form-group">
              <label for="newUsername">New Username:</label>
              <input type="text" v-model="newUsername" id="newUsername" required />
            </div>
            <button type="submit" class="btn btn-primary">Update Username</button>
          </form>
        </div>
      </section>

      <!-- Logout Button -->
      <div class="logout-button mt-4">
        <button @click="logout" class="btn btn-outline-danger">Log out</button>
      </div>

      <!-- Bidded Auctions Section -->
      <section class="bidded-auctions mt-5">
        <h2>Bidded Auctions</h2>
        <div v-if="biddedAuctions.length > 0">
          <div class="auction-card" v-for="(auction, index) in biddedAuctions" :key="index">
            <div class="row g-0">
              <div class="col-md-4">
                <img :src="auction.horsePictures[0]" class="img-fluid rounded-start" alt="Horse Image">
              </div>
              <div class="col-md-8">
                <div class="card-body">
                  <h5 class="card-title">{{ auction.horseName }}</h5>
                  <p class="card-text"><strong>Start Bid:</strong> ${{ auction.startingPrice }}</p>
                  <p class="card-text"><strong>Current Bid:</strong> ${{ auction.currentBid }}</p>
                  <p class="card-text">
                    <strong v-if="new Date(auction.startAuction) <= today">Time Left:</strong> 
                    <strong v-else>Start Date:</strong>
                    <span v-if="new Date(auction.startAuction) <= today">{{ auction.remainingTime }}</span>
                    <span v-else>{{ formatDate(auction.startAuction) }}</span>
                  </p>
                  <button @click="viewDetails(auction.id)" class="btn btn-primary">View Details</button>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div v-else>
          <p>You haven't placed any bids yet.</p>
        </div>
      </section>

      <!-- Your Auctions Section -->
      <section class="your-auctions mt-5">
        <h2>Your Auctions</h2>
        <div v-if="yourAuctions.length > 0">
          <div class="auction-card" v-for="(auction, index) in yourAuctions" :key="index">
            <div class="row g-0">
              <div class="col-md-4">
                <img :src="auction.horsePictures[0]" class="img-fluid rounded-start" alt="Horse Image">
              </div>
              <div class="col-md-8">
                <div class="card-body">
                  <h5 class="card-title">{{ auction.horseName }}</h5>
                  <p class="card-text"><strong>Current Bid:</strong> ${{ auction.currentBid }}</p>
                  <p class="card-text">
                    <strong v-if="new Date(auction.startAuction) <= today">Time Left:</strong> 
                    <strong v-else>Start Date:</strong>
                    <span v-if="new Date(auction.startAuction) <= today">{{ auction.remainingTime }}</span>
                    <span v-else>{{ formatDate(auction.startAuction) }}</span>
                  </p>
                  <button @click="viewDetails(auction.id)" class="btn btn-primary">View Details</button>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div v-else>
          <p>You haven't registered any horses yet.</p>
        </div>
      </section>
    </div>
  </div>
</template>

<script>
import { signOut } from 'firebase/auth';  
import { auth } from '@/firebase';  
import { db } from '@/firebase';  
import { collection, query, where, getDocs, getDoc, doc, updateDoc } from 'firebase/firestore';  

export default {
  data() {
    return {
      username: '',
      newUsername: '',
      showUsernameChange: false,
      yourAuctions: [],
      biddedAuctions: [],
      today: new Date(),
      loading: true, 
      timer: null,
    };
  },
  async mounted() {
    // Wait for all data to be fetched before showing the UI
    await this.fetchUsername(); 
    await this.fetchUserAuctions();  
    await this.fetchBiddedAuctions();
    
    this.startRealTimeCountdown(); // Start real-time countdown
    this.loading = false; // Set loading to false after data has been fetched
  },
  beforeUnmount() {
    if (this.timer) clearInterval(this.timer);
  },
  methods: {
    async fetchUsername() {
      try {
        const userId = auth.currentUser.uid;
        const userDocRef = doc(db, 'users', userId);
        const userDoc = await getDoc(userDocRef);

        if (userDoc.exists()) {
          this.username = userDoc.data().username;
        }
      } catch (error) {
        console.error('Error fetching username:', error);
      }
    },
    async changeUsername() {
      try {
        const userId = auth.currentUser.uid;
        const userDocRef = doc(db, 'users', userId);

        await updateDoc(userDocRef, {
          username: this.newUsername,
        });

        this.username = this.newUsername;
        this.newUsername = '';
        this.showUsernameChange = false;

        alert('Username updated successfully!');
      } catch (error) {
        console.error('Error updating username:', error);
      }
    },
    async fetchUserAuctions() {
      const userId = auth.currentUser.uid;
      const auctionsRef = collection(db, 'Auctions');
      const q = query(auctionsRef, where('auctionOwner', '==', userId));  
      const querySnapshot = await getDocs(q);
      this.yourAuctions = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
    },
    async fetchBiddedAuctions() {
      const userId = auth.currentUser.uid;
      const bidderDocRef = doc(db, 'bidders', userId);
      const bidderDoc = await getDoc(bidderDocRef);

      if (bidderDoc.exists()) {
        const { auctionIds } = bidderDoc.data();
        const auctionsRef = collection(db, 'Auctions');
        const auctionsQuery = query(auctionsRef, where('__name__', 'in', auctionIds)); 
        const querySnapshot = await getDocs(auctionsQuery);

        this.biddedAuctions = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));
      }
    },
    calculateTimeRemaining(endDate) {
      const now = new Date().getTime();
      const end = new Date(endDate).getTime();
      const timeLeft = Math.max(end - now, 0);
      const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
      const hours = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);
      return `${days}d : ${hours}h : ${minutes}m : ${seconds}s`;
    },
    startRealTimeCountdown() {
      // Update remainingTime for each auction every second
      this.timer = setInterval(() => {
        this.yourAuctions = this.yourAuctions.map(auction => ({
          ...auction,
          remainingTime: this.calculateTimeRemaining(auction.endAuction),
        }));
        this.biddedAuctions = this.biddedAuctions.map(auction => ({
          ...auction,
          remainingTime: this.calculateTimeRemaining(auction.endAuction),
        }));
      }, 1000);
    },

    formatDate(date) {
      if (!date) return 'No bids yet';
      const options = { year: 'numeric', month: 'long', day: 'numeric' };
      return new Date(date).toLocaleDateString(undefined, options);
    },
    viewDetails(auctionId) {
      this.$router.push({ name: 'HorseListing', params: { id: auctionId } });
    },
    async logout() {
      try {
        await signOut(auth);
        this.$router.push({ name: 'Login' });
      } catch (error) {
        console.error('Logout failed:', error);
      }
    },
  },
};
</script>


<style scoped>
.profile-container {
  width: 80%;
  margin: 0 auto;
}

.profile-header {
  background-color: #2e3c4f;
  color: white;
  padding: 20px;
  text-align: center;
}

.user-info {
  margin-bottom: 30px;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  font-size: 16px;
  font-weight: bold;
  margin-bottom: 5px;
}

.form-group input {
  width: 100%;
  padding: 10px;
  font-size: 16px;
  border: 1px solid #ccc;
  border-radius: 5px;
}

.action-buttons {
  margin-top: 20px;
}

.logout-button {
  text-align: center;
}

.auction-card {
  background-color: #f8f9fa;
  border: none;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  margin-bottom: 20px;
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
