<template>
  <div id="profile" class="profile-container">
    <!-- Header Section -->
    <header class="profile-header">
      <h1>Profile</h1>
    </header>

    <!-- User Information Section -->
    <section class="user-info mt-4">
      <h2>Your Information</h2>
      <div class="form-group">
        <label for="username">Username:</label>
        <input 
          type="text" 
          id="username" 
          v-model="editableUser.username" 
          :disabled="!isEditing" 
        />
      </div>

      <div class="form-group">
        <label for="password">Password:</label>
        <input 
          type="password" 
          id="password" 
          v-model="editableUser.password" 
          :disabled="!isEditing" 
        />
      </div>

      <!-- Edit and Save Buttons -->
      <div class="action-buttons">
        <button v-if="!isEditing" @click="enableEdit" class="btn btn-primary">Edit Profile</button>
        <button v-else @click="saveProfile" class="btn btn-success">Save</button>
        <button v-if="isEditing" @click="cancelEdit" class="btn btn-danger">Cancel</button>
      </div>

      <!-- Logout Button -->
      <div class="logout-button mt-4">
        <button @click="logout" class="btn btn-outline-danger">Logout</button>
      </div>
    </section>

    <!-- Bidded Auctions Section -->
    <section class="bidded-auctions mt-4">
      <h2>Bidded Auctions</h2>
      <div v-if="biddedAuctions.length > 0">
        <div class="auction-card" v-for="(auction, index) in biddedAuctions" :key="index">
          <div class="row g-0">
            <div class="col-md-4">
              <img :src="auction.horseImage" class="img-fluid rounded-start" alt="Horse Image">
            </div>
            <div class="col-md-8">
              <div class="card-body">
                <h5 class="card-title">{{ auction.title }}</h5>
                <p class="card-text"><strong>Horse Name:</strong> {{ auction.horseName }}</p>
                <p class="card-text"><strong>Current Bid:</strong> ${{ auction.currentBid }}</p>
                <p class="card-text"><strong>Auction ends in:</strong> {{ auction.timeRemaining }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div v-else>
        <p>You have not placed any bids yet.</p>
      </div>
    </section>

    <!-- Your Auctions Section -->
    <section class="your-auctions mt-5">
      <h2>Your Auctions</h2>
      <div v-if="yourAuctions.length > 0">
        <div class="auction-card" v-for="(auction, index) in yourAuctions" :key="index">
          <div class="row g-0">
            <div class="col-md-4">
              <!-- Display the uploaded horse image -->
              <img :src="auction.horsePictures[0].url" class="img-fluid rounded-start" alt="Horse Image">
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
export default {
  data() {
    return {
      registeredHorses: [],
      user: {
        username: 'john_doe',
        password: '********'
      },
      editableUser: {
        username: '',
        password: ''
      },
      isEditing: false,
      biddedAuctions: [
        {
          title: "LIVE AUCTION - Zagreb, HR",
          horseName: "Prima Carissima",
          horseImage: "https://www.eurodressage.com/sites/default/files/styles/max_650x650/public/database-story-thumb/2021-07/auctions_blackhorses_noirbh.jpg?itok=1qjtLYPB",
          currentBid: 8250,
          timeRemaining: "23d 7h 29m 41s"
        }
      ],
      yourAuctions: []
    };
  },
  mounted(){
    const savedHorses = JSON.parse(localStorage.getItem("registeredHorses"));
    if (savedHorses) {
      this.yourAuctions = savedHorses;
    }
  },
  methods: {
    enableEdit() {
      this.isEditing = true;
      this.editableUser = { ...this.user };
    },
    saveProfile() {
      this.user = { ...this.editableUser };
      this.isEditing = false;
      console.log('Profile updated:', this.user);
    },
    cancelEdit() {
      this.isEditing = false;
      this.editableUser = { ...this.user };
    },
    logout() {
      console.log('User logged out');
      this.$router.push({ name: 'Login' });
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
  },
  created() {
    this.editableUser = { ...this.user };
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
