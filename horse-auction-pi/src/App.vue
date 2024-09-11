<template>
  <div id="app">
  <Navbar /> 
  <!-- <horse_registration/> -->
  
    <router-view />  
  </div>
</template>

<script>
import { registerRuntimeCompiler } from 'vue';
import Navbar from './components/Appnavbar.vue';  // Ensure this path is correct
// import Register_login from './components/register_login.vue';
// import home_page from './components/home_page.vue';
// import info_page from './components/info_page.vue';
// import horse_registration from  './components/horse_registration.vue';
// import collection from './components/collection.vue';
//import HorseListing from './components/horse_lisitng.vue';


export default {
  name: 'App',
  components: {
    Navbar,
    

    
  }
};
</script>


<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}
</style>
