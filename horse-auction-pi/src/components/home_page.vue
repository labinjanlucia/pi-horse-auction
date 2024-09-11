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
        <h2 class="text-center">Currently running</h2>
        <div class="card">
          <div class="row g-0">
            <div class="col-md-4">
              <img src="https://www.nzequestrian.org.nz/wp-content/uploads/Meg-Bisset-Freestyle-Twyst-Shout-winners-of-the-Country-TV-Pony-Grand-Prix-Photo-Credit-Elise-Ford-1-600x419.jpg" class="img-fluid rounded-start" alt="Horse Image">
            </div>
            <div class="col-md-8">
              <div class="card-body">
                <h5 class="card-title">ONLINE AUCTION</h5>
                <p class="card-text"><strong>Horse Name:</strong>Fenix</p>
                <p class="card-text"><strong>Current Bid:</strong> $5,000</p>
                <p class="card-text"><strong>Auction ends in:</strong> 6d : 3h : 25m : 31s</p>
                <a href="#" class="btn btn-primary">View Details</a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Future Auctions Section -->
    <section class="future-auctions mt-5 mb-5">
      <div class="container">
        <h2 class="text-center">Future Auctions</h2>
        <div class="card">
          <div class="row g-0">
            <div class="col-md-4">
              <img src="https://www.eurodressage.com/sites/default/files/styles/max_650x650/public/database-story-thumb/2021-07/auctions_blackhorses_noirbh.jpg?itok=1qjtLYPB" class="img-fluid rounded-start" alt="Horse Image">
            </div>
            <div class="col-md-8">
              <div class="card-body">
                <h5 class="card-title">UPCOMING AUCTION</h5>
                <p class="card-text"><strong>Horse Name:</strong>Carrisima PRIMA</p>
                <p class="card-text"><strong>Starting Bid:</strong> $10,000</p>
                <p class="card-text"><strong>Auction starts on:</strong> 15.04.2024</p>
                <!-- Button to navigate to Horse Listing -->
                <button @click="viewDetails(auction.id)" class="btn btn-primary">View Details</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script>
export default {
  name: "HomePage",
  methods: {
    goToCollection() {
      // Navigate to the Collection Page
      this.$router.push({ name: 'collection' });
    }
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

  