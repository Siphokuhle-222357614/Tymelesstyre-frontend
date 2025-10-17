<template>
  <div class="home-page">
    <!-- Hero Section -->
    <section class="hero-section">
      <div class="container hero-content">
        <h1 class="hero-title">Welcome to TymeLess Tyre</h1>
        <p class="hero-subtitle">Find the perfect tyres for your vehicle at the best prices</p>
        <div class="hero-actions">
          <router-link to="/products" class="btn btn-accent">Shop Now</router-link>
        </div>
      </div>
    </section>

    <!-- Featured Products -->
    <section class="featured-products-section">
      <div class="container">
        <div class="section-header">
          <h2 class="section-title">Featured Products</h2>
          <router-link to="/products" class="view-all-link">View All →</router-link>
        </div>

        <!-- Loading State -->
        <div v-if="loading" class="loading-section">
          <div class="loading-spinner"></div>
          <p>Loading featured products...</p>
        </div>

        <!-- Error State -->
        <div v-else-if="error" class="error-section">
          <h3>Unable to load featured products</h3>
          <p>{{ error }}</p>
          <button @click="fetchFeaturedProducts" class="btn btn-primary">Try Again</button>
        </div>

        <!-- Products Grid -->
        <div v-else class="products-grid">
          <div
            v-for="product in featuredProducts.slice(0, 4)"
            :key="product.id"
            class="product-card"
          >
            <div class="product-image">
              <img
                v-if="product.imageUrl"
                :src="getImageUrl(product.imageUrl)"
                :alt="`${product.brand} ${product.model}`"
              />
              <div v-else class="tyre-placeholder">No Image</div>
              <span class="product-badge" v-if="product.featured">Featured</span>
            </div>

            <div class="product-info">
              <h3>{{ product.brand }} {{ product.model }}</h3>
              <p class="product-specs">{{ product.width }}/{{ product.aspectRatio }}R{{ product.rimDiameter }}</p>
              <div class="product-price">R{{ product.price }}</div>
              <div class="product-actions">
                <button @click="addToCart(product)" class="btn btn-primary">Add to Cart</button>
                <router-link :to="`/product/${product.id}`" class="btn btn-outline">Details</router-link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Services -->
    <section class="services-section">
      <div class="container">
        <h2 class="section-title">Our Services</h2>
        <div class="services-grid">
          <div class="service-card">
            <h3>Tyre Fitting</h3>
            <p>Professional tyre fitting with precision equipment</p>
          </div>
          <div class="service-card">
            <h3>Wheel Alignment</h3>
            <p>Ensuring smooth rides and longer tyre life</p>
          </div>
          <div class="service-card">
            <h3>Tyre Repair</h3>
            <p>Fast and safe repair services</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Testimonials -->
    <section class="testimonials-section">
      <div class="container">
        <h2 class="section-title">Customer Reviews</h2>
        <div class="testimonials-grid">
          <div class="testimonial-card">
            <p>"Great service and quick installation!"</p>
            <h4>- John D.</h4>
          </div>
          <div class="testimonial-card">
            <p>"Affordable tyres and helpful staff."</p>
            <h4>- Sarah J.</h4>
          </div>
          <div class="testimonial-card">
            <p>"Will definitely come back again!"</p>
            <h4>- Mike W.</h4>
          </div>
        </div>
      </div>
    </section>

    <!-- Call To Action -->
    <section class="cta-section">
      <div class="container">
        <h2>Ready to Shop?</h2>
        <router-link to="/products" class="btn btn-accent btn-large">Browse Collection</router-link>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useCartStore } from '@/stores/cart'

const cartStore = useCartStore()
const featuredProducts = ref([])
const loading = ref(true)
const error = ref(null)

const fetchFeaturedProducts = async () => {
  try {
    loading.value = true
    error.value = null
    const response = await fetch('http://localhost:8080/tymelesstyre/api/products')
    if (!response.ok) throw new Error('Failed to fetch products')
    const data = await response.json()
    featuredProducts.value = data.filter(p => p.featured).slice(0, 6)
  } catch (err) {
    error.value = 'Failed to load featured products.'
  } finally {
    loading.value = false
  }
}

const getImageUrl = (imageUrl) =>
  imageUrl?.startsWith('http')
    ? imageUrl
    : `http://localhost:8080/tymelesstyre${imageUrl}`

const addToCart = (product) => {
  cartStore.addItem(product)
}

onMounted(fetchFeaturedProducts)
</script>

<style scoped>
/* Hero */
.hero-section {
  background: url('https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=1920&h=800&fit=crop&crop=center') center/cover no-repeat;
  padding: 5rem 1rem;
  text-align: center;
  color: white;
}
.hero-title { font-size: 2.5rem; font-weight: bold; }
.hero-subtitle { margin: 1rem 0 2rem; font-size: 1.2rem; opacity: 0.9; }

/* Featured Products */
.featured-products-section { padding: 4rem 1rem; }
.section-header {
  display: flex; justify-content: space-between; align-items: center;
  margin-bottom: 2rem;
}
.products-grid {
  display: grid; gap: 1.5rem;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
}
.product-card {
  background: #fff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 6px rgba(0,0,0,0.1);
  display: flex; flex-direction: column;
}
.product-image { height: 180px; background: #f7f7f7; display: flex; justify-content: center; align-items: center; position: relative; }
.product-image img { width: 100%; height: 100%; object-fit: cover; }
.product-badge { position: absolute; top: 8px; right: 8px; background: #ff6a00; color: white; padding: 0.25rem 0.75rem; border-radius: 12px; font-size: 0.8rem; }
.product-info { padding: 1rem; flex: 1; display: flex; flex-direction: column; }
.product-price { font-weight: bold; color: #ff6a00; margin: 0.5rem 0; }
.product-actions { margin-top: auto; display: flex; gap: 0.5rem; }

/* Services */
.services-section { padding: 4rem 1rem; background: #f9f9f9; text-align: center; }
.services-grid { display: grid; gap: 1.5rem; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); }
.service-card { background: white; padding: 1.5rem; border-radius: 8px; box-shadow: 0 2px 6px rgba(0,0,0,0.05); }

/* Testimonials */
.testimonials-section { padding: 4rem 1rem; }
.testimonials-grid { display: grid; gap: 1.5rem; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); }
.testimonial-card { background: white; padding: 1.5rem; border-radius: 8px; box-shadow: 0 2px 6px rgba(0,0,0,0.05); font-style: italic; }

/* CTA */
.cta-section { padding: 4rem 1rem; text-align: center; background: #ff6a00; color: white; }
.btn { padding: 0.5rem 1rem; border-radius: 6px; font-weight: 600; cursor: pointer; }
.btn-accent { background: #ff6a00; color: white; }
.btn-outline { border: 1px solid #ccc; color: #333; background: white; }
.btn-large { padding: 0.75rem 1.5rem; }
</style>
