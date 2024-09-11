<template>
  <div id="homepage">
    <!-- Main Section -->
    <section class="main-section text-center">
      <div class="bg-image">
        <h1>HORSE AUCTION</h1>
        <p>Show Jumpers 08.04.2024 - 14.04.2024</p>
        <p>Auction ends in:</p>
        <div class="countdown">
          <span>6d : 3h : 25m : 31s</span>
        </div>
        <!-- Discover Collection Button -->
        <button class="btn btn-outline-light mt-4" @click="goToCollection">DISCOVER COLLECTION</button>
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
                <img :src="auction.horsePictures" class="img-fluid rounded-start" alt="Horse Image">
              </div>
              <div class="col-md-8">
                <div class="card-body">
                  <h5 class="card-title">ONLINE AUCTION</h5>
                  <p class="card-text"><strong>Horse Name:</strong> {{ auction.horseName }}</p>
                  <p class="card-text"><strong>Current Bid:</strong> ${{ auction.currentBid }}</p>
                  <p class="card-text"><strong>Auction ends in:</strong> {{ auction.endAuction }}</p>
                  <a href="#" class="btn btn-primary">View Details</a>
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
      auctions: [] // Holds the auction data from Firebase
    };
  },
  methods: {
    goToCollection() {
      this.$router.push({ name: 'collection' });
    },
    async fetchAuctions() {
      try {
        const querySnapshot = await getDocs(collection(db, "Auctions"));
        const auctionsData = [];
        querySnapshot.forEach((doc) => {
          // Push each document into the auctions array with id and data
          auctionsData.push({ id: doc.id, ...doc.data() });
        });
        this.auctions = auctionsData; // Assign fetched data to auctions
      } catch (error) {
        console.error("Error fetching auctions: ", error);
      }
    }
  },
  created() {
    this.fetchAuctions(); // Fetch auction data when the component is created
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

  