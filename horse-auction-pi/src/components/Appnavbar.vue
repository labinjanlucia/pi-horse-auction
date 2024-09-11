<template>
    <nav class="navbar navbar-expand-lg navbar-dark bg-dark">
      <div class="container">
        <router-link class="navbar-brand" to="/home">
          CROATIAN HORSE TRADING
        </router-link>
        <button
          class="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
          aria-controls="navbarNav"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span class="navbar-toggler-icon"></span>
        </button>
        <div class="collapse navbar-collapse" id="navbarNav">
          <ul class="navbar-nav me-auto mb-2 mb-lg-0">
            <li class="nav-item">
              <router-link class="nav-link active" aria-current="page" to="/home">
                HOME PAGE
              </router-link>
            </li>
            <li class="nav-item">
              <router-link class="nav-link" to="/collection">
                COLLECTION
              </router-link>
              
            </li>
            <li class="nav-item">
              <router-link class="nav-link" to="/register-horse">
                REGISTER HORSE
              </router-link>
            </li>
            <li class="nav-item">
              <router-link class="nav-link" to="/bid/:id'">
                BIDDING BOARD
              </router-link>
            </li>
            <li class="nav-item">
              <router-link class="nav-link" to="/info">
                INFO
              </router-link>
            </li>
          </ul>
          <ul class="navbar-nav">
            <li class="nav-item">
              <router-link class="nav-link" to="/Profile">
                PROFILE
              </router-link>
              
            </li>
            
          </ul>
        </div>
      </div>
    </nav>
  </template>
  
  <script>
  export default {
    name: 'Navbar',
  };
  </script>
  
  <style scoped>
  /* Add any additional styling here if needed */
  </style>
  