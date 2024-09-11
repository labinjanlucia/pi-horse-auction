<template>
    <div id="info-page">
      <!-- Header Section -->
      <header class="info-header">
        <h2>INFO PAGE</h2>
      </header>
  
      <!-- Contact and Map Section -->
      <section class="contact-map-section">
        <div class="contact-details">
          <h3>HORSE STABLES CROATIA</h3>
          <p>Our contact information:</p>
          <p>Email: <a href="mailto:stables@example.com">stables@example.com</a></p>
          <p>Phone: +385 7037 1221</p>
          <p>Location: Zagreb, Croatia</p>
          <p>Street: Ulica Ivena Grobnicka</p>
        </div>
        <div class="map">
          <img src="path-to-map-image" alt="Map Image" />
        </div>
      </section>
  
      <!-- How to Bid Section -->
      <section class="how-to-bid">
        <h2>HOW TO BID</h2>
        <p> In the first bidding phase of the auction, direct bids or automatic bids can be submitted using one or more bidding steps. 
This means that you can set the amount of your bid for the respective horse or foal and then decide whether you want to submit your bid as a "direct bid" or as an "automatic bid". If you do not make any changes during the bidding process in the bidding tool, the system is preset so that you simply make the next possible bid step. 

However, this only allows you to place a "direct bid". In order to be able to submit an "automatic bid", at least two bidding steps must be entered. The corresponding price is shown directly in the view.
An automatic bid ensures that your bid is automatically increased with the next minimum bid step as soon as another bid is received. This continues until your specified maximum amount is reached.The amount of the bidding steps (in the following step size) can vary according to the auction and the bid price. You can see the increment of the respective lot if you press to bid more (+) and to bid less again (-).
Example:The bid steps increase up to a bid price of EUR 10,000 each by EUR 250, from a bid price of more than EUR 10,000 each by EUR 500 and from a bid price of EUR 25,000 by EUR 1,000. </p>
      </section>
    </div>
  </template>
  
  <script>
  export default {
    name: "InfoPage",
  };
  </script>
  
  <style scoped>
  /* Header styling */
  .info-header {
    background-color: #2e3c4f;
    color: white;
    padding: 20px;
    text-align: center;
  }
  
  .info-header h1 {
    font-size: 24px;
    margin: 0;
  }
  
  .info-header h2 {
    font-size: 18px;
    margin: 5px 0 0;
  }
  
  /* Contact and Map Section Styling */
  .contact-map-section {
    display: flex;
    justify-content: space-between;
    padding: 20px;
  }
  
  .contact-details {
    width: 50%;
    padding: 20px;
    background-color: #f8f9fa;
  }
  
  .map {
    width: 50%;
    padding: 20px;
  }
  
  .map img {
    width: 100%;
    height: auto;
    border-radius: 8px;
  }
  
  /* How to Bid Section Styling */
  .how-to-bid {
    padding: 20px;
  }
  
  .how-to-bid h2 {
    text-align: center;
    font-weight: bold;
    margin-bottom: 20px;
  }
  
  .how-to-bid p {
    margin: 10px 0;
    line-height: 1.6;
  }
  </style>
  