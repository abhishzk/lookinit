export const CONFIG = {
  // App settings
  baseUrl: "https://lookinit.com",
  
  // Firebase (public config)
  firebase: {
    apiKey: "AIzaSyBt0Bt7dvjFkp_dNB439ht5xAAZ_qOu8SU",
    authDomain: "lookinit-ai.firebaseapp.com",
    projectId: "lookinit-ai",
    storageBucket: "lookinit-ai.firebasestorage.app",
    messagingSenderId: "399977683522",
    appId: "1:399977683522:web:ff705ac1b58172d73c2bdb",
    measurementId: "G-CBBH14F2N7",
    // Server-side config
    clientEmail: "firebase-adminsdk-fbsvc@lookinit-ai.iam.gserviceaccount.com"
  },
  
  // Stripe (public config)
  stripe: {
    publishableKey: "pk_test_51QfoAsB9l3mkM5VX43i8kKA1bpKci3ANkyNkkd4zOO6bjLsGpoNfvzfGF8YcZogMMRyTdVhpYhdIdwfFd6ymvm0900gt63sE3o",
    basicPriceId: "price_1Qw7XMB9l3mkM5VXZW4OGm8w",
    proPriceId: "price_1QwOWKB9l3mkM5VXvYJ3PMo5"
  },
  
  // Supabase (public config)
  supabase: {
    url: "https://fkouvghngbgtxtwrorei.supabase.co",
    anonKey: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZrb3V2Z2huZ2JndHh0d3JvcmVpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDMzMjAzNjcsImV4cCI6MjA1ODg5NjM2N30.Qcy4ABWdZQ0c6WlqaYhE2OwgGAI7x8Cqa6AnqCIo630"
  },
  
  // Email settings
  email: {
    host: "smtp.sendgrid.net",
    port: 587,
    secure: false,
    from: "team@lookinit.com",
    notificationEmail: "team@lookinit.com"
  },
};
