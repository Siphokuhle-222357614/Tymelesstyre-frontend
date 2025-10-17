<template>
  <div class="products-view">
    <!-- Loading indicator -->
    <div v-if="loading" class="loading-overlay">
      <div class="loading-spinner"></div>
      <p>Loading products...</p>
    </div>

    <!-- Error message -->
    <div v-if="error" class="error-message">
      <h3>Error Loading Products</h3>
      <p>{{ error }}</p>
      <button @click="fetchTyres" class="btn-primary">Try Again</button>
    </div>

    <!-- Main content when data is loaded -->
    <template v-if="!loading && !error">
      <!-- Header Section -->
      <div class="page-header">
        <h1>Tyre Catalog</h1>
        <p>Find the perfect tyres for your vehicle from our extensive collection</p>
      </div>

      <!-- Main Content Area -->
      <div class="catalog-container">
        <!-- Filters Sidebar -->
        <div class="filters-sidebar">
          <div class="filter-section">
            <h3>Filters</h3>
            <button class="clear-filters" @click="clearAllFilters">Clear All</button>
          </div>

          <!-- Search Filter -->
          <div class="filter-group">
            <label for="search">Search</label>
            <input
              id="search"
              v-model="filters.searchTerm"
              type="text"
              placeholder="Search by brand, model..."
              @input="handleSearchInput"
            >
          </div>

          <!-- Brand Filter -->
          <div class="filter-group">
            <label>Brand</label>
            <div v-for="brand in availableBrands" :key="brand" class="checkbox-item">
              <input
                :id="`brand-${brand}`"
                v-model="filters.brands"
                type="checkbox"
                :value="brand"
              >
              <label :for="`brand-${brand}`">{{ brand }}</label>
            </div>
          </div>

          <!-- Size Filters -->
          <div class="filter-group">
            <label>Width (mm)</label>
            <div class="range-inputs">
              <input
                v-model.number="filters.widthMin"
                type="number"
                placeholder="Min"
                min="145"
                max="355"
              >
              <span>-</span>
              <input
                v-model.number="filters.widthMax"
                type="number"
                placeholder="Max"
                min="145"
                max="355"
              >
            </div>
          </div>

          <div class="filter-group">
            <label>Aspect Ratio (%)</label>
            <div class="range-inputs">
              <input
                v-model.number="filters.ratioMin"
                type="number"
                placeholder="Min"
                min="25"
                max="95"
              >
              <span>-</span>
              <input
                v-model.number="filters.ratioMax"
                type="number"
                placeholder="Max"
                min="25"
                max="95"
              >
            </div>
          </div>

          <div class="filter-group">
            <label>Rim Diameter (inches)</label>
            <div class="range-inputs">
              <input
                v-model.number="filters.diameterMin"
                type="number"
                placeholder="Min"
                min="13"
                max="22"
              >
              <span>-</span>
              <input
                v-model.number="filters.diameterMax"
                type="number"
                placeholder="Max"
                min="13"
                max="22"
              >
            </div>
          </div>

          <!-- Price Filter -->
          <div class="filter-group">
            <label>Price Range (R)</label>
            <div class="range-inputs">
              <input
                v-model.number="filters.priceMin"
                type="number"
                placeholder="Min"
                min="0"
              >
              <span>-</span>
              <input
                v-model.number="filters.priceMax"
                type="number"
                placeholder="Max"
                min="0"
              >
            </div>
          </div>

          <!-- Season Filter -->
          <div class="filter-group">
            <label>Season</label>
            <select v-model="filters.season">
              <option value="">All Seasons</option>
              <option value="SUMMER">Summer</option>
              <option value="WINTER">Winter</option>
              <option value="ALL_SEASON">All Season</option>
            </select>
          </div>

          <!-- Vehicle Type Filter -->
          <div class="filter-group">
            <label>Vehicle Type</label>
            <select v-model="filters.vehicleType">
              <option value="">All Vehicles</option>
              <option value="PASSENGER">Passenger</option>
              <option value="SUV">SUV</option>
              <option value="LIGHT_TRUCK">Light Truck</option>
              <option value="COMMERCIAL">Commercial</option>
            </select>
          </div>
        </div>

        <!-- Products Grid Area -->
        <div class="products-main">
          <!-- Controls Bar -->
          <div class="controls-bar">
            <div class="results-count">
              Showing {{ filteredTyres.length }} of {{ allTyres.length }} products
            </div>

            <div class="sort-controls">
              <label for="sort">Sort by:</label>
              <select id="sort" v-model="sortOption">
                <option value="featured">Featured</option>
                <option value="priceLowHigh">Price: Low to High</option>
                <option value="priceHighLow">Price: High to Low</option>
                <option value="brandAZ">Brand: A to Z</option>
                <option value="brandZA">Brand: Z to A</option>
              </select>
            </div>

            <div class="view-options">
              <button
                :class="['view-toggle', { active: gridView }]"
                @click="gridView = true"
                aria-label="Grid view"
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                  <rect x="1" y="1" width="6" height="6" rx="1" />
                  <rect x="9" y="1" width="6" height="6" rx="1" />
                  <rect x="1" y="9" width="6" height="6" rx="1" />
                  <rect x="9" y="9" width="6" height="6" rx="1" />
                </svg>
              </button>
              <button
                :class="['view-toggle', { active: !gridView }]"
                @click="gridView = false"
                aria-label="List view"
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                  <rect x="1" y="1" width="14" height="2" rx="1" />
                  <rect x="1" y="7" width="14" height="2" rx="1" />
                  <rect x="1" y="13" width="14" height="2" rx="1" />
                </svg>
              </button>
            </div>
          </div>

          <!-- Products Grid/List -->
          <div :class="['products-container', gridView ? 'grid-view' : 'list-view']">
            <div
              v-for="tyre in paginatedTyres"
              :key="tyre.id"
              class="tyre-card"
            >
              <div class="tyre-image">
                <img :src="getTyreImage(tyre)" :alt="tyre.brand + ' ' + tyre.model">
                <button
                  class="wishlist-btn"
                  @click="toggleWishlist(tyre)"
                  :aria-label="'Add ' + tyre.brand + ' to wishlist'"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" :fill="isInWishlist(tyre) ? '#f59e0b' : 'none'" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                </button>
              </div>

              <div class="tyre-details">
                <div class="tyre-brand">{{ tyre.brand }}</div>
                <h3 class="tyre-model">{{ tyre.model }}</h3>

                <div class="tyre-specs">
                  <span class="tyre-size">{{ tyre.width }}/{{ tyre.aspectRatio }}R{{ tyre.rimDiameter }}</span>
                  <span class="tyre-season" :class="tyre.season.toLowerCase()">{{ formatSeason(tyre.season) }}</span>
                </div>

                <div class="tyre-vehicle">{{ formatVehicleType(tyre.vehicleType) }}</div>

                <div class="tyre-price">
                  <span class="price-amount">R{{ tyre.price }}</span>
                  <span class="price-unit">each</span>
                </div>

                <div class="tyre-stock" :class="{'low-stock': tyre.stockQuantity <= 5, 'out-of-stock': tyre.stockQuantity === 0}">
                  {{ tyre.stockQuantity === 0 ? 'Out of stock' : `${tyre.stockQuantity} in stock` }}
                </div>

                <div class="tyre-actions">
                  <button
                    class="btn-primary"
                    @click="addToCart(tyre)"
                    :disabled="tyre.stockQuantity === 0"
                  >
                    Add to Cart
                  </button>
                  <button class="btn-secondary" @click="viewDetails(tyre)">
                    Details
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- No Results Message -->
          <div v-if="filteredTyres.length === 0" class="no-results">
            <h3>No tyres match your filters</h3>
            <p>Try adjusting your search criteria or <a href="#" @click.prevent="clearAllFilters">clear all filters</a></p>
          </div>

          <!-- Pagination Controls -->
          <div v-if="filteredTyres.length > 0" class="pagination-controls">
            <button
              :disabled="currentPage === 1"
              @click="currentPage--"
              class="pagination-btn"
            >
              Previous
            </button>

            <div class="page-numbers">
              <button
                v-for="page in displayedPages"
                :key="page"
                :class="['page-btn', { active: currentPage === page }]"
                @click="currentPage = page"
              >
                {{ page }}
              </button>
              <span v-if="pageCount > maxDisplayedPages && currentPage < pageCount - 2">...</span>
            </div>

            <button
              :disabled="currentPage === pageCount"
              @click="currentPage++"
              class="pagination-btn"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script>
import { ref, computed, reactive, watch, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useCartStore } from '@/stores/cart'
// import api from '@/services/api'

export default {
  name: 'ProductsView',
  setup() {
    const router = useRouter()
    const cartStore = useCartStore()

    // Data from backend API
    const allTyres = ref([])
    const loading = ref(true)
    const error = ref(null)

    // Filters state
    const filters = reactive({
      searchTerm: '',
      brands: [],
      widthMin: null,
      widthMax: null,
      aspectRatioMin: null,
      aspectRatioMax: null,
      rimDiameterMin: null,
      rimDiameterMax: null,
      priceMin: null,
      priceMax: null,
      season: '',
      vehicleType: '',
      stockStatus: 'all'
    })

    // UI state
    const gridView = ref(true)
    const sortOption = ref('featured')
    const currentPage = ref(1)
    const itemsPerPage = ref(12)
    const wishlist = ref([])
    const searchTimeout = ref(null)

    // Fetch tyres from backend API
    const fetchTyres = async () => {
      try {
        loading.value = true
        error.value = null
        console.log('Fetching products from API...')

        const response = await fetch('http://localhost:8080/tymelesstyre/api/products')
        if (!response.ok) throw new Error('Failed to fetch products')

        const productsData = await response.json()
        allTyres.value = productsData

        console.log('Products loaded successfully:', allTyres.value.length, 'items')
      } catch (err) {
        console.error('Error fetching products:', err)
        error.value = 'Failed to load products. Please try again.'
      } finally {
        loading.value = false
      }
    }

    // Test API connection
    const testConnection = async () => {
      try {
        console.log('Testing API connection...')
        const response = await fetch('http://localhost:8080/tymelesstyre/api/products')
        if (response.status === 200) {
          console.log('API health check: OK')
        } else {
          console.error('API health check: FAILED')
        }
      } catch (err) {
        console.error('Connection test failed:', err)
      }
    }

    // Simple debounce implementation
    const handleSearchInput = () => {
      if (searchTimeout.value) {
        clearTimeout(searchTimeout.value)
      }
      searchTimeout.value = setTimeout(() => {
        searchTimeout.value = null
      }, 300)
    }

    // Available brands for filter (extracted from products)
    const availableBrands = computed(() => {
      const brands = new Set(allTyres.value.map(tyre => tyre.brand))
      return Array.from(brands).sort()
    })

    // Available seasons for filter
    const availableSeasons = computed(() => {
      const seasons = new Set(allTyres.value.map(tyre => tyre.season))
      return Array.from(seasons).sort()
    })

    // Available vehicle types for filter
    const availableVehicleTypes = computed(() => {
      const vehicleTypes = new Set(allTyres.value.map(tyre => tyre.vehicleType))
      return Array.from(vehicleTypes).sort()
    })

    // Price range for inputs
    const minPrice = computed(() => {
      if (allTyres.value.length === 0) return 0
      return Math.min(...allTyres.value.map(tyre => parseFloat(tyre.price)))
    })

    const maxPrice = computed(() => {
      if (allTyres.value.length === 0) return 0
      return Math.max(...allTyres.value.map(tyre => parseFloat(tyre.price)))
    })

    // Filtered tyres based on current filters
    const filteredTyres = computed(() => {
      return allTyres.value.filter(tyre => {
        // Search term filter
        if (filters.searchTerm) {
          const searchLower = filters.searchTerm.toLowerCase()
          const brandModel = `${tyre.brand} ${tyre.model}`.toLowerCase()
          if (!brandModel.includes(searchLower)) return false
        }

        // Brand filter
        if (filters.brands.length > 0 && !filters.brands.includes(tyre.brand)) {
          return false
        }

        // Width filter
        if (filters.widthMin && tyre.width < filters.widthMin) return false
        if (filters.widthMax && tyre.width > filters.widthMax) return false

        // Aspect ratio filter
        if (filters.aspectRatioMin && tyre.aspectRatio < filters.aspectRatioMin) return false
        if (filters.aspectRatioMax && tyre.aspectRatio > filters.aspectRatioMax) return false

        // Rim diameter filter
        if (filters.rimDiameterMin && tyre.rimDiameter < filters.rimDiameterMin) return false
        if (filters.rimDiameterMax && tyre.rimDiameter > filters.rimDiameterMax) return false

        // Price filter
        const tyrePrice = parseFloat(tyre.price)
        if (filters.priceMin && tyrePrice < filters.priceMin) return false
        if (filters.priceMax && tyrePrice > filters.priceMax) return false

        // Season filter
        if (filters.season && tyre.season !== filters.season) return false

        // Vehicle type filter
        if (filters.vehicleType && tyre.vehicleType !== filters.vehicleType) return false

        // Stock status filter
        if (filters.stockStatus === 'inStock' && tyre.stockQuantity === 0) return false
        if (filters.stockStatus === 'lowStock' && (tyre.stockQuantity > 5 || tyre.stockQuantity === 0)) return false

        return true
      })
    })

    // Sorted tyres
    const sortedTyres = computed(() => {
      const tyres = [...filteredTyres.value]

      switch (sortOption.value) {
        case 'priceLowHigh':
          return tyres.sort((a, b) => parseFloat(a.price) - parseFloat(b.price))
        case 'priceHighLow':
          return tyres.sort((a, b) => parseFloat(b.price) - parseFloat(a.price))
        case 'brandAZ':
          return tyres.sort((a, b) => a.brand.localeCompare(b.brand))
        case 'brandZA':
          return tyres.sort((a, b) => b.brand.localeCompare(a.brand))
        default: // featured
          return tyres
      }
    })

    // Pagination
    const pageCount = computed(() => {
      return Math.ceil(sortedTyres.value.length / itemsPerPage.value)
    })

    const paginatedTyres = computed(() => {
      const start = (currentPage.value - 1) * itemsPerPage.value
      const end = start + itemsPerPage.value
      return sortedTyres.value.slice(start, end)
    })

    const maxDisplayedPages = 5
    const displayedPages = computed(() => {
      const pages = []
      let startPage = Math.max(1, currentPage.value - Math.floor(maxDisplayedPages / 2))
      let endPage = startPage + maxDisplayedPages - 1

      if (endPage > pageCount.value) {
        endPage = pageCount.value
        startPage = Math.max(1, endPage - maxDisplayedPages + 1)
      }

      for (let i = startPage; i <= endPage; i++) {
        pages.push(i)
      }

      return pages
    })

    // Watch for filter changes and reset to page 1
    watch([filters, sortOption], () => {
      currentPage.value = 1
    })

    // Clear all filters
    const clearAllFilters = () => {
      filters.searchTerm = ''
      filters.brands = []
      filters.widthMin = null
      filters.widthMax = null
      filters.aspectRatioMin = null
      filters.aspectRatioMax = null
      filters.rimDiameterMin = null
      filters.rimDiameterMax = null
      filters.priceMin = null
      filters.priceMax = null
      filters.season = ''
      filters.vehicleType = ''
      filters.stockStatus = 'all'
    }

    // Add to cart
    const addToCart = (tyre) => {
      cartStore.addToCart({
        id: tyre.id,
        name: `${tyre.brand} ${tyre.model}`,
        price: parseFloat(tyre.price),
        quantity: 1,
        image: getTyreImage(tyre),
        stock: tyre.stockQuantity
      })
    }

    // View details
    const viewDetails = (tyre) => {
      router.push(`/product/${tyre.id}`)
    }

    // Wishlist functionality
    const isInWishlist = (tyre) => {
      return wishlist.value.some(item => item.id === tyre.id)
    }

    const toggleWishlist = (tyre) => {
      const index = wishlist.value.findIndex(item => item.id === tyre.id)
      if (index === -1) {
        wishlist.value.push(tyre)
      } else {
        wishlist.value.splice(index, 1)
      }
    }

    // Helper functions
const getTyreImage = (tyre) => {
  // Hardcoded mapping of brands/models to images
  const images = {
    'Pirelli': '/images/tyres/pirelli.jpg',
    'Michelin': '/images/tyres/Michelin.jpg',
    'Bridgestone': '/images/tyres/Bridgestone.jpg',
    'Goodyear': '/images/tyres/goodyear.avif',
    'Continental': '/images/tyres/continental.jpg',
    'Default': '/images/tyres/default.jpg'
  }

  // Match brand first
  if (images[tyre.brand]) {
    return images[tyre.brand]
  }

  // Optional: match model if needed
  if (tyre.model && images[tyre.model]) {
    return images[tyre.model]
  }

  // Fallback if no match found
  return images['Default']
}


    const formatPrice = (price) => {
      return parseFloat(price).toFixed(2)
    }

    const formatSeason = (season) => {
      const seasonMap = {
        'SUMMER': 'Summer',
        'WINTER': 'Winter',
        'ALL_SEASON': 'All Season'
      }
      return seasonMap[season] || season
    }

    const formatVehicleType = (vehicleType) => {
      const typeMap = {
        'PASSENGER': 'Passenger',
        'SUV': 'SUV',
        'LIGHT_TRUCK': 'Light Truck',
        'COMMERCIAL': 'Commercial'
      }
      return typeMap[vehicleType] || vehicleType
    }

    // Initialize component
    onMounted(() => {
      console.log('ProductsView mounted, testing connection...')
      testConnection()
      fetchTyres()
    })

    return {
      allTyres,
      loading,
      error,
      filters,
      gridView,
      sortOption,
      currentPage,
      availableBrands,
      availableSeasons,
      availableVehicleTypes,
      minPrice,
      maxPrice,
      filteredTyres,
      paginatedTyres,
      pageCount,
      displayedPages,
      handleSearchInput,
      clearAllFilters,
      addToCart,
      viewDetails,
      isInWishlist,
      toggleWishlist,
      getTyreImage,
      formatPrice,
      formatSeason,
      formatVehicleType,
      fetchTyres
    }
  }
}
</script>

<style scoped>
.products-view {
  min-height: 100vh;
  padding: 20px;
  max-width: 1400px;
  margin: 0 auto;
}

.page-header {
  text-align: center;
  margin-bottom: 30px;
}

.page-header h1 {
  font-size: 2.5rem;
  color: #2563eb;
  margin-bottom: 10px;
}

.page-header p {
  font-size: 1.1rem;
  color: #64748b;
}

.catalog-container {
  display: flex;
  gap: 20px;
}

.filters-sidebar {
  width: 280px;
  flex-shrink: 0;
  background: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  height: fit-content;
  max-height: 80vh;
  overflow-y: auto;
}

.filter-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.filter-section h3 {
  margin: 0;
  font-size: 1.2rem;
}

.clear-filters {
  background: none;
  border: none;
  color: #2563eb;
  cursor: pointer;
  font-size: 0.9rem;
}

.clear-filters:hover {
  text-decoration: underline;
}

.filter-group {
  margin-bottom: 20px;
}

.filter-group label {
  display: block;
  font-weight: 600;
  margin-bottom: 8px;
}

.filter-group input[type="text"],
.filter-group input[type="number"],
.filter-group select {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  font-size: 0.9rem;
}

.range-inputs {
  display: flex;
  align-items: center;
  gap: 8px;
}

.range-inputs input {
  flex: 1;
}

.checkbox-item {
  display: flex;
  align-items: center;
  margin-bottom: 8px;
}

.checkbox-item input {
  margin-right: 8px;
}

.products-main {
  flex: 1;
}

.controls-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding: 15px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.results-count {
  font-weight: 600;
}

.sort-controls {
  display: flex;
  align-items: center;
  gap: 10px;
}

.sort-controls select {
  padding: 6px 10px;
  border: 1px solid #d1d5db;
  border-radius: 4px;
}

.view-options {
  display: flex;
  gap: 5px;
}

.view-toggle {
  padding: 6px 8px;
  background: #f3f4f6;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  cursor: pointer;
}

.view-toggle.active {
  background: #2563eb;
  color: white;
}

.products-container {
  display: grid;
  gap: 20px;
  margin-bottom: 30px;
}

.grid-view {
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
}

.list-view {
  grid-template-columns: 1fr;
}

.tyre-card {
  background: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s, box-shadow 0.2s;
}

.tyre-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.tyre-image {
  position: relative;
  height: 180px;
  overflow: hidden;
}

.tyre-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.wishlist-btn {
  position: absolute;
  top: 10px;
  right: 10px;
  background: white;
  border: none;
  border-radius: 50%;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.tyre-details {
  padding: 15px;
}

.tyre-brand {
  font-size: 0.9rem;
  color: #64748b;
  margin-bottom: 5px;
}

.tyre-model {
  font-size: 1.2rem;
  margin: 0 0 10px 0;
  color: #1f2937;
}

.tyre-specs {
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;
}

.tyre-size {
  font-weight: 600;
}

.tyre-season {
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 600;
}

.tyre-season.summer {
  background: #fef3c7;
  color: #92400e;
}

.tyre-season.winter {
  background: #dbeafe;
  color: #1e40af;
}

.tyre-season.all_season {
  background: #dcfce7;
  color: #166534;
}

.tyre-vehicle {
  font-size: 0.9rem;
  color: #6b7280;
  margin-bottom: 15px;
}

.tyre-price {
  display: flex;
  align-items: baseline;
  gap: 5px;
  margin-bottom: 10px;
}

.price-amount {
  font-size: 1.4rem;
  font-weight: 700;
  color: #1f2937;
}

.price-unit {
  font-size: 0.9rem;
  color:极速飞艇
  #6b7280;
}

.tyre-stock {
  font-size: 0.9rem;
  margin-bottom: 15px;
}

.tyre-stock.low-stock {
  color: #f59e0b;
}

.tyre-stock.out-of-stock {
  color: #ef4444;
}

.tyre-actions {
  display: flex;
  gap: 10px;
}

.btn-primary, .btn-secondary {
  flex: 1;
  padding: 10px;
  border: none;
  border-radius: 4px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 极速飞艇
  0.2s;
}

.btn-primary {
  background: #2563eb;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: #1d4ed8;
}

.btn-primary:disabled {
  background: #9ca3af;
  cursor: not-allowed;
}

.btn-secondary {
  background: #f3f4f6;
  color: #374151;
  border: 1px solid #d1d5db;
}

.btn-secondary:hover {
  background: #e5e7eb;
}

.no-results {
  text-align: center;
  padding: 40px 极速飞艇
  20px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.no-results h3 {
  margin: 0 0 10px 0;
  color: #374151;
}

.no-results p {
  margin: 0;
  color: #6b7280;
}

.no-results a {
  color: #2563eb;
  text-decoration: none;
}

.no-results a:hover {
  text-decoration: underline;
}

.pagination-controls {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 10px;
  margin-top: 30px;
}

.pagination-btn {
  padding: 8px 16px;
  background: white;
  border: 1px solid #d1d5db;
  /* 极速飞艇; */
  border-radius: 4px;
  cursor: pointer;
}

.pagination-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.pagination-btn:not(:disabled):hover {
  background: #f3f4f6;
}

.page-numbers {
  display: flex;
  gap: 5px;
}

.page-btn {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: white;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  cursor: pointer;
}

.page-btn.active {
  background: #2563eb;
  color: white;
  border-color: #2563eb;
}

.page-btn:not(.active):hover {
  background: #f3f4f6;
}

.loading-overlay {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
}

.loading-spinner {
  width: 50px;
  height: 50px;
  border: 4px solid #f3f4f6;
  border-top: 4px solid #2563eb;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 20px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.error-message {
  text-align: center;
  padding: 40px 20px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  max-width: 500px;
  margin: 0 auto;
}

.error-message h3 {
  color: #ef4444;
  margin: 0 0 10px 0;
}

.error-message p {
  margin: 0 0 20px 0;
  color: #6b7280;
}

@media (max-width: 1024px) {
  .catalog-container {
    flex-direction: column;
  }

  .filters-sidebar {
    width: 100%;
    max-height: none;
  }
}

@media (max-width: 768px) {
  .products-view {
    padding: 10px;
  }

  .controls-bar {
    flex-direction: column;
    gap: 15px;
    align-items: flex-start;
  }

  .grid-view {
    grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  }

  .tyre-actions {
    flex-direction: column;
  }
}
</style>
