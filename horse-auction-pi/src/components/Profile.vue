<template>
  <div id="profile" class="profile-container">
    <!-- Header Section -->
    <header class="profile-header">
      <h1>Profile</h1>
    </header>

    <!-- Logout Button -->
    <div class="logout-button mt-4">
      <button @click="logout" class="btn btn-outline-danger">Logout</button>
    </div>

    <!-- Your Auctions Section -->
    <section class="your-auctions mt-5">
      <h2>Your Auctions</h2>
      <div v-if="yourAuctions.length > 0">
        <div class="auction-card" v-for="(auction, index) in yourAuctions" :key="index">
          <div class="row g-0">
            <div class="col-md-4">
              <!-- Display the uploaded horse image -->
              <img :src="auction.horsePictures[0]" class="img-fluid rounded-start" alt="Horse Image">
            </div>
            <div class="col-md-8">
              <div class="card-body">
                <!-- Display horse name -->
                <h5 class="card-title">{{ auction.horseName }}</h5>

                <!-- Display the starting bid -->
                <p class="card-text"><strong>Start Bid:</strong> ${{ auction.startingPrice }}</p>

                <!-- Display the countdown timer -->
                <p class="card-text"><strong>Time Left:</strong> {{ countdown(auction.endAuction) }}</p>

                <!-- View Details button -->
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
</template>

<script>
import { signOut } from 'firebase/auth';  // Import Firebase signOut
import { auth } from '@/firebase';  // Import Firebase auth
import { db } from '@/firebase';  // Import Firestore database instance
import { collection, query, where, getDocs } from 'firebase/firestore';  // Firestore functions

export default {
  data() {
    return {
      yourAuctions: []  // Array to hold the user's auctions
    };
  },
  mounted() {
    this.fetchUserAuctions();  // Fetch auctions when component is mounted
  },
  methods: {
    // Fetch auctions created by the logged-in user
    async fetchUserAuctions() {
      try {
        const user = auth.currentUser;
        if (!user) {
          this.$router.push({ name: 'Login' });  // If not logged in, redirect to login
          return;
        }

        // Query Firestore to get auctions created by the current user
        const auctionsRef = collection(db, 'Auctions');
        const q = query(auctionsRef, where('auctionOwner', '==', user.uid));  // Filter by auctionOwnerId
        const querySnapshot = await getDocs(q);
        // Map the query result to the yourAuctions array
        this.yourAuctions = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        })
      );

      } 
      catch (error) {
        console.error('Error fetching user auctions:', error);
      }

    },
    // Logout function
    async logout() {
      try {
        await signOut(auth);  // Log out the user using Firebase Authentication
        this.$router.push({ name: 'Login' });  // Redirect to the login page after logging out
      } catch (error) {
        console.error('Logout failed:', error);
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
    viewDetails(auctionId) {
      this.$router.push({ name: 'HorseListings', params: { id: auctionId } });
    }
  }
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
