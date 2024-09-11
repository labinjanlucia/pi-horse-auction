// src/router.js
import { createRouter, createWebHistory } from 'vue-router';
import HomePage from './components/home_page.vue';  // Ensure this file exists
import Profile from './components/Profile.vue';  // Ensure this file exists
import info_page from './components/info_page.vue';
import horse_registration from './components/horse_registration.vue';
import collection from './components/collection.vue';
import HorseListing from './components/horse_listing.vue';
import BiddingBoard from './components/BiddingBoard.vue';
import Register from './components/Register.vue';
import Login from '@/components/Login.vue';


const routes = [
  { path: '/home', name: 'HomePage', component: HomePage },  // Route for Home
  { path: '/Profile', name: 'Profile', component: Profile },  // Route for Profile
  { path: '/register', name: 'Register', component: Register },
  {path: '/info', name:'InfoPage', component: info_page},
  {path:'/register-horse', name:'HorseRegistration', component: horse_registration},
  {path:'/collection', name:'collection', component: collection},
  {path: '/horse/:id', name: 'HorseListing', component: HorseListing },
  { path: '/bid/:id', name: 'BiddingBoard', component: BiddingBoard },
  { path: '/login', name: 'Login', component: Login },

  { path: '/:pathmatch(.*)*', redirect: '/home' }  // Redirect root to home page
];

export const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
