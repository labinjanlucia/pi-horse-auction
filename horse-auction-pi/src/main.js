// src/main.js
import { createApp } from 'vue';
import App from './App.vue';
import {router} from './router'; 

// Import Bootstrap CSS and JS
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';

// Create Vue app and use the router
createApp(App)
  .use(router)
  .mount('#app');
