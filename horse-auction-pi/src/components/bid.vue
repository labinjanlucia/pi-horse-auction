<template>
    <div class="bid-popup">
      <div v-if="showPopup" class="popup-container">
        <div class="popup-content">
          <h2>{{ horseName }}</h2>
          
          <!-- Section for Direct Bid -->
          <div v-if="!automaticBidActive">
            <h3>PLACE YOUR BID</h3>
            <div class="bid-section">
              <button @click="decreaseBid" :disabled="bidAmount <= currentBid">-</button>
              <span>{{ bidAmount }}</span>
              <button @click="increaseBid">+{{ increment }}</button>
            </div>
            <p><strong>Total Amount:</strong> ${{ bidAmount }}</p>
            <button class="btn-place-bid" @click="placeDirectBid">Place direct bid of ${{ bidAmount }}</button>
            <p>or</p>
            <button class="btn-automatic-bid" @click="activateAutomaticBid">Set an automatic bid</button>
          </div>
  
          <!-- Section for Automatic Bid -->
          <div v-else>
            <h3>Automatic Bid</h3>
            <p>If you set an automatic bid, the system will automatically outbid incoming bids up to your highest bid.</p>
            <div class="bid-section">
              <span>Max Bid Amount: </span>
              <input type="number" v-model="maxBid" min="bidAmount" />
            </div>
            <button class="btn-set-max-bid" @click="confirmMaxBid">Set automatic bid of ${{ maxBid }}</button>
            <button class="btn-back" @click="automaticBidActive = false">Back to manual bidding</button>
          </div>
  
          <!-- Confirmation Popup for Automatic Bid -->
          <div v-if="showConfirmationPopup" class="confirmation-popup">
            <p>Are you sure you want to place an automatic bid up to ${{ maxBid }}?</p>
            <button class="btn-confirm" @click="placeAutomaticBid">Yes</button>
            <button class="btn-cancel" @click="showConfirmationPopup = false">No</button>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script>
  export default {
    props: {
      horseName: {
        type: String,
        default: "Horse Name"
      },
      startingBid: {
        type: Number,
        default: 0
      },
      currentBid: {
        type: Number,
        default: 0
      },
      increment: {
        type: Number,
        default: 250 // The default increment value
      }
    },
    data() {
      return {
        bidAmount: this.currentBid || this.startingBid, // Start at current bid or starting bid
        maxBid: null, // Max bid for automatic bidding
        automaticBidActive: false, // Tracks if automatic bid mode is active
        showPopup: true, // Controls showing the popup
        showConfirmationPopup: false // Controls showing confirmation for automatic bid
      };
    },
    methods: {
      increaseBid() {
        this.bidAmount += this.increment; // Increase bid by increment value
      },
      decreaseBid() {
        if (this.bidAmount > this.currentBid) {
          this.bidAmount -= this.increment; // Decrease bid but not below current bid
        }
      },
      placeDirectBid() {
        alert(`Direct bid of $${this.bidAmount} has been placed!`);
        this.closePopup(); // Close the popup after placing a bid
      },
      activateAutomaticBid() {
        this.automaticBidActive = true; // Switch to automatic bid mode
      },
      confirmMaxBid() {
        if (this.maxBid > this.bidAmount) {
          this.showConfirmationPopup = true; // Show confirmation popup
        } else {
          alert("Max bid should be higher than the current bid.");
        }
      },
      placeAutomaticBid() {
        alert(`Automatic bid set with max bid of $${this.maxBid}`);
        this.showConfirmationPopup = false;
        this.closePopup(); // Close the popup after setting the automatic bid
      },
      closePopup() {
        this.showPopup = false; // Close the bid popup
        this.$emit("close"); // Emit close event to the parent component
      }
    }
  };
  </script>
  
  <style scoped>
  .bid-popup {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
  }
  
  .popup-container {
    background-color: white;
    padding: 20px;
    width: 400px;
    border-radius: 10px;
    text-align: center;
  }
  
  .popup-content h2, h3 {
    margin-bottom: 20px;
  }
  
  .bid-section {
    display: flex;
    justify-content: center;
    align-items: center;
    margin: 15px 0;
  }
  
  .bid-section span {
    font-size: 20px;
    margin: 0 10px;
  }
  
  button {
    padding: 10px 15px;
    margin: 10px 5px;
    cursor: pointer;
  }
  
  .btn-place-bid {
    background-color: blue;
    color: white;
  }
  
  .btn-automatic-bid, .btn-set-max-bid, .btn-back, .btn-confirm, .btn-cancel {
    background-color: #007bff;
    color: white;
  }
  
  .confirmation-popup {
    margin-top: 20px;
  }
  </style>
  