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

        <!-- Success Message -->
        <div v-if="successMessage" class="success-message" role="alert">
          <div class="success-content">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
            </svg>
            {{ successMessage }}
          </div>
        </div>
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
              Showing {{ filteredProducts?.length || 0 }} of {{ allProducts?.length || 0 }} products
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
              v-for="product in paginatedProducts"
              :key="product.id"
              class="product-card"
            >
              <div class="product-image">
                <img
                  :src="getProductImage(product)"
                  :alt="product.productName + ' ' + (product.productModel || '')"
                  @error="handleImageError"
                  loading="lazy"
                >
                <button
                  class="wishlist-btn"
                  @click="toggleWishlist(product)"
                  :aria-label="'Add ' + product.productName + ' to wishlist'"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" :fill="isInWishlist(product) ? '#f59e0b' : 'none'" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                </button>
              </div>

              <div class="product-details">
                <div class="product-brand">{{ product.productName }}</div>
                <h3 class="product-model">{{ product.productModel || 'Model' }}</h3>

                <div class="product-specs">
                  <span class="product-size">{{ product.width }}/{{ product.aspectRatio }}R{{ product.rimDiameter }}</span>
                  <span class="product-season" :class="product.season?.toLowerCase()">{{ formatSeason(product.season) }}</span>
                </div>

                <div class="product-vehicle">{{ formatVehicleType(product.vehicleType) }}</div>

                <div class="product-price">
                  <span class="price-amount">R{{ formatPrice(product) }}</span>
                  <span class="price-unit">each</span>
                </div>

                <div class="product-stock" :class="{'low-stock': product.stockQuantity <= 5, 'out-of-stock': product.stockQuantity === 0}">
                  {{ product.stockQuantity === 0 ? 'Out of stock' : `${product.stockQuantity} in stock` }}
                </div>

                <div class="product-actions">
                  <!-- Quantity selector for products with stock -->
                  <div v-if="product.stockQuantity > 0" class="quantity-section">
                    <div class="quantity-controls">
                      <button
                        class="quantity-btn"
                        @click="decrementQuantity(product.productId)"
                        :disabled="getProductQuantity(product.productId) <= 1"
                      >
                        -
                      </button>
                      <span class="quantity-display">{{ getProductQuantity(product.productId) }}</span>
                      <button
                        class="quantity-btn"
                        @click="incrementQuantity(product.productId)"
                        :disabled="getProductQuantity(product.productId) >= product.stockQuantity"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  <button
                    class="btn-primary add-to-cart-btn"
                    @click="addToCart(product)"
                    :disabled="product.stockQuantity === 0 || addingToCart === product.productId"
                    :class="{ 'loading': addingToCart === product.productId }"
                  >
                    <span v-if="addingToCart === product.productId">Adding...</span>
                    <span v-else-if="product.stockQuantity === 0">Out of Stock</span>
                    <span v-else>Add to Cart</span>
                  </button>

                  <button class="btn-secondary" @click="viewDetails(product)">
                    Details
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- No Results Message -->
          <div v-if="filteredProducts?.length === 0" class="no-results">
            <h3>No products match your filters</h3>
            <p>Try adjusting your search criteria or <a href="#" @click.prevent="clearAllFilters">clear all filters</a></p>
          </div>

          <!-- Pagination Controls -->
          <div v-if="filteredProducts?.length > 0" class="pagination-controls">
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
import { ref, computed, reactive, watch, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useCartStore } from '@/stores/cart'
// import api from '@/services/api'

export default {
  name: 'ProductsView',
  setup() {
    const router = useRouter()
    const cartStore = useCartStore()

    // Data from backend API
  const allProducts = ref([])
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

    // Inventory management state
    const productQuantities = ref({}) // Track selected quantities for each product
    const addingToCart = ref(null) // Track which product is being added to cart
    const stockRefreshInterval = ref(null)
    const lastStockUpdate = ref(Date.now())

    // Fetch tyres from backend API
    const fetchTyres = async () => {
      try {
        loading.value = true
        error.value = null
        console.log('Fetching products from API...')

        const response = await fetch('http://localhost:8080/tymelesstyre/api/products')
        if (!response.ok) throw new Error('Failed to fetch products')

        const productsData = await response.json()
  allProducts.value = productsData

  console.log('Products loaded successfully:', allProducts.value.length, 'items')

  // Debug first product structure
  if (productsData.length > 0) {
    console.log('First product structure:', productsData[0])
    console.log('Available fields:', Object.keys(productsData[0]))
  }
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
      const brands = new Set(allProducts.value.map(product => product.productName))
      return Array.from(brands).sort()
    })

    // Available seasons for filter
    const availableSeasons = computed(() => {
      const seasons = new Set(allProducts.value.map(product => product.season))
      return Array.from(seasons).sort()
    })

    // Available vehicle types for filter
    const availableVehicleTypes = computed(() => {
      const vehicleTypes = new Set(allProducts.value.map(product => product.vehicleType))
      return Array.from(vehicleTypes).sort()
    })

    // Price range for inputs
    const minPrice = computed(() => {
      if (allProducts.value.length === 0) return 0
      const prices = allProducts.value.map(product => {
        const priceValue = product.price || product.productPrice || product.priceAmount || 0
        return parseFloat(priceValue)
      }).filter(price => !isNaN(price))
      return prices.length > 0 ? Math.min(...prices) : 0
    })

    const maxPrice = computed(() => {
      if (allProducts.value.length === 0) return 0
      const prices = allProducts.value.map(product => {
        const priceValue = product.price || product.productPrice || product.priceAmount || 0
        return parseFloat(priceValue)
      }).filter(price => !isNaN(price))
      return prices.length > 0 ? Math.max(...prices) : 0
    })

    // Filtered tyres based on current filters
    const filteredProducts = computed(() => {
      return allProducts.value.filter(product => {
        // Search term filter
        if (filters.searchTerm) {
          const searchLower = filters.searchTerm.toLowerCase()
          const brandModel = `${product.productName} ${product.productModel || ''}`.toLowerCase()
          if (!brandModel.includes(searchLower)) return false
        }

        // Brand filter
        if (filters.brands.length > 0 && !filters.brands.includes(product.productName)) {
          return false
        }

        // Width filter
        if (filters.widthMin && product.width < filters.widthMin) return false
        if (filters.widthMax && product.width > filters.widthMax) return false

        // Aspect ratio filter
        if (filters.aspectRatioMin && product.aspectRatio < filters.aspectRatioMin) return false
        if (filters.aspectRatioMax && product.aspectRatio > filters.aspectRatioMax) return false

        // Rim diameter filter
        if (filters.rimDiameterMin && product.rimDiameter < filters.rimDiameterMin) return false
        if (filters.rimDiameterMax && product.rimDiameter > filters.rimDiameterMax) return false

        // Price filter
        const priceValue = product.price || product.productPrice || product.priceAmount || 0
        const productPrice = parseFloat(priceValue)
        if (filters.priceMin && !isNaN(productPrice) && productPrice < filters.priceMin) return false
        if (filters.priceMax && !isNaN(productPrice) && productPrice > filters.priceMax) return false

        // Season filter
        if (filters.season && product.season !== filters.season) return false

        // Vehicle type filter
        if (filters.vehicleType && product.vehicleType !== filters.vehicleType) return false

        // Stock status filter
        if (filters.stockStatus === 'inStock' && product.stockQuantity === 0) return false
        if (filters.stockStatus === 'lowStock' && (product.stockQuantity > 5 || product.stockQuantity === 0)) return false

        return true
      })
    })

    // Sorted tyres
    const sortedProducts = computed(() => {
      const products = [...filteredProducts.value]

      switch (sortOption.value) {
        case 'priceLowHigh':
          return products.sort((a, b) => {
            const priceA = parseFloat(a.price || a.productPrice || a.priceAmount || 0)
            const priceB = parseFloat(b.price || b.productPrice || b.priceAmount || 0)
            return priceA - priceB
          })
        case 'priceHighLow':
          return products.sort((a, b) => {
            const priceA = parseFloat(a.price || a.productPrice || a.priceAmount || 0)
            const priceB = parseFloat(b.price || b.productPrice || b.priceAmount || 0)
            return priceB - priceA
          })
        case 'brandAZ':
          return products.sort((a, b) => a.productName.localeCompare(b.productName))
        case 'brandZA':
          return products.sort((a, b) => b.productName.localeCompare(a.productName))
        default: // featured
          return products
      }
    })

    // Pagination
    const pageCount = computed(() => {
      return Math.ceil(sortedProducts.value.length / itemsPerPage.value)
    })

    const paginatedProducts = computed(() => {
      const start = (currentPage.value - 1) * itemsPerPage.value
      const end = start + itemsPerPage.value
      return sortedProducts.value.slice(start, end)
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

    // Inventory Management Functions
    const getProductQuantity = (productId) => {
      return productQuantities.value[productId] || 1
    }

    const incrementQuantity = (productId) => {
      const current = getProductQuantity(productId)
      const product = allProducts.value.find(p => (p.productId || p.id) === productId)
      if (product && current < product.stockQuantity) {
        productQuantities.value[productId] = current + 1
      }
    }

    const decrementQuantity = (productId) => {
      const current = getProductQuantity(productId)
      if (current > 1) {
        productQuantities.value[productId] = current - 1
      }
    }

    // Simplified Add to cart - let backend handle stock validation during checkout
    const addToCart = async (product) => {
      const productId = product.productId || product.id
      addingToCart.value = productId

        console.log('🛒 Adding to cart - Product:', product.productName, 'ID:', productId, 'Displayed Stock:', product.stockQuantity)

      try {
        // Simple check: only block if UI shows 0 stock
        if ((product.stockQuantity || 0) <= 0) {
          console.log('❌ Product shows 0 stock in UI, blocking add to cart')
          alert(`Sorry, ${product.productName} appears to be out of stock.`)
          return
        }

        // Get requested quantity
        const requestedQuantity = getProductQuantity(productId)
        console.log('📦 Adding quantity:', requestedQuantity)

        // Prepare cart item data
        const priceValue = product.price || product.productPrice || product.priceAmount || 0
        const numericPrice = parseFloat(priceValue)
        const finalPrice = isNaN(numericPrice) ? 0 : numericPrice

        const cartItem = {
          id: productId,
          brand: product.productName,
          model: product.productModel || product.model,
          name: `${product.productName} ${product.productModel || ''}`,
          price: finalPrice,
          imageUrl: getProductImage(product),
          image: getProductImage(product),
          stock: product.stockQuantity,
          stockQuantity: product.stockQuantity,
          sectionWidth: product.width,
          aspectRatio: product.aspectRatio,
          rimDiameter: product.rimDiameter,
          width: product.width,
          season: product.season,
          vehicleType: product.vehicleType,
          description: product.description || `${product.productName} ${product.productModel || ''} - ${product.width}/${product.aspectRatio}R${product.rimDiameter}`
        }

        // Add to cart store (stock validation will happen at checkout)
        cartStore.addItem(cartItem, requestedQuantity)

        // Show success message
        showSuccessMessage(`Added ${requestedQuantity} item(s) to cart!`)
        console.log('✅ Successfully added to cart')

        // Reset quantity to 1
        productQuantities.value[productId] = 1

      } catch (error) {
        console.error('Error adding to cart:', error)
        alert('Failed to add item to cart. Please try again.')
      } finally {
        addingToCart.value = null
      }
    }

    // Success message system
    const successMessage = ref('')
    const showSuccessMessage = (message) => {
      successMessage.value = message
      setTimeout(() => {
        successMessage.value = ''
      }, 3000)
    }

    // Periodic stock refresh
    const refreshStockLevels = async () => {
      if (Date.now() - lastStockUpdate.value < 30000) return // Limit to every 30 seconds

      try {
        const response = await fetch('http://localhost:8080/tymelesstyre/api/products')
        if (response.ok) {
          const latestProducts = await response.json()

          // Update stock levels for existing products
          latestProducts.forEach(updatedProduct => {
            const existingProduct = allProducts.value.find(p =>
              (p.productId || p.id) === (updatedProduct.productId || updatedProduct.id)
            )
            if (existingProduct) {
              existingProduct.stockQuantity = updatedProduct.stockQuantity
            }
          })

          lastStockUpdate.value = Date.now()
        }
      } catch (err) {
        console.warn('Could not refresh stock levels:', err)
      }
    }

    // View details
    const viewDetails = (product) => {
      router.push(`/product/${product.id}`)
    }

    // Wishlist functionality
    const isInWishlist = (product) => {
      return wishlist.value.some(item => item.id === product.id)
    }

    const toggleWishlist = (product) => {
      const index = wishlist.value.findIndex(item => item.id === product.id)
      if (index === -1) {
        wishlist.value.push(product)
      } else {
        wishlist.value.splice(index, 1)
      }
    }

        // Helper functions
        const getProductImage = (product) => {
          const productId = product.productId || product.id
          if (productId) {
            return `http://localhost:8080/tymelesstyre/api/products/${productId}/image`
          }
          // fallback image
          return '/images/tyres/default.jpg'
        }

        const handleImageError = (event) => {
          // Set a fallback image when the image fails to load
          event.target.src = '/images/tyres/default.jpg'
        }


    const formatPrice = (product) => {
      // Check multiple possible price field names from backend
      const priceValue = product.price || product.productPrice || product.priceAmount || 0

      // Debug logging for first few products
      if (allProducts.value.length <= 3) {
        console.log('Product price debug:', {
          productId: product.productId,
          price: product.price,
          productPrice: product.productPrice,
          priceAmount: product.priceAmount,
          allFields: Object.keys(product)
        })
      }

      const numericPrice = parseFloat(priceValue)
      return isNaN(numericPrice) ? '0.00' : numericPrice.toFixed(2)
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

      // Set up periodic stock refresh every 2 minutes
      stockRefreshInterval.value = setInterval(() => {
        refreshStockLevels()
      }, 120000)
    })

    // Cleanup interval on unmount
    onUnmounted(() => {
      if (stockRefreshInterval.value) {
        clearInterval(stockRefreshInterval.value)
      }
    })

    return {
      allProducts,
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
      filteredProducts,
      paginatedProducts,
      pageCount,
      displayedPages,
      handleSearchInput,
      clearAllFilters,
      addToCart,
      viewDetails,
      isInWishlist,
      toggleWishlist,
      getProductImage,
      handleImageError,
      formatPrice,
      formatSeason,
      formatVehicleType,
      fetchTyres,
      // Inventory management
      productQuantities,
      addingToCart,
      successMessage,
      getProductQuantity,
      incrementQuantity,
      decrementQuantity,
      refreshStockLevels
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

.product-card {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s, box-shadow 0.2s;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.product-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
}

.product-image {
  position: relative;
  height: 200px;
  width: 100%;
  overflow: hidden;
  background: #f8f9fa;
  display: flex;
  align-items: center;
  justify-content: center;
}

.product-image img {
  width: 100%;
  height: 100%;
  object-fit: contain; /* Changed from cover to contain to show full image */
  object-position: center;
  transition: transform 0.2s, opacity 0.2s;
}

.product-image img[src=""],
.product-image img:not([src]) {
  opacity: 0;
}

.product-image::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 60px;
  height: 60px;
  background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>') no-repeat center;
  background-size: contain;
  opacity: 0.3;
  z-index: 1;
}

.product-card:hover .product-image img {
  transform: scale(1.05);
}

/* Keep original tyre classes for backward compatibility */
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

.product-details {
  padding: 16px;
  flex: 1;
  display: flex;
  flex-direction: column;
}

.product-brand {
  font-size: 0.85rem;
  color: #64748b;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 4px;
}

.product-model {
  font-size: 1.1rem;
  margin: 0 0 12px 0;
  color: #1f2937;
  font-weight: 600;
  line-height: 1.3;
}

.product-specs {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
  flex-wrap: wrap;
  gap: 8px;
}

.product-size {
  font-weight: 600;
  font-size: 0.9rem;
  color: #374151;
}

.product-season {
  padding: 3px 8px;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: capitalize;
}

.product-season.summer {
  background: #fef3c7;
  color: #92400e;
}

.product-season.winter {
  background: #dbeafe;
  color: #1e40af;
}

.product-season.all_season {
  background: #dcfce7;
  color: #166534;
}

.product-vehicle {
  font-size: 0.85rem;
  color: #6b7280;
  margin-bottom: 12px;
}

.product-price {
  display: flex;
  align-items: baseline;
  gap: 6px;
  margin-bottom: 12px;
}

.product-stock {
  font-size: 0.85rem;
  margin-bottom: 16px;
  font-weight: 500;
}

.product-stock.low-stock {
  color: #f59e0b;
}

.product-stock.out-of-stock {
  color: #ef4444;
}

.product-actions {
  margin-top: auto;
  display: flex;
  gap: 8px;
}

/* Keep original tyre classes for backward compatibility */
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

  .grid-view {
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
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
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 15px;
  }

  .product-image {
    height: 150px;
  }

  .product-details {
    padding: 12px;
  }

  .product-actions {
    flex-direction: column;
  }

  .tyre-actions {
    flex-direction: column;
  }
}

@media (max-width: 480px) {
  .grid-view {
    grid-template-columns: 1fr;
  }

  .product-image {
    height: 180px;
  }
}

/* Success Message Styles */
.success-message {
  position: fixed;
  top: 20px;
  right: 20px;
  background: #10b981;
  color: white;
  padding: 12px 20px;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
  z-index: 1000;
  animation: slideInRight 0.3s ease-out;
}

.success-content {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 500;
}

@keyframes slideInRight {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

/* Quantity Controls Styles */
.quantity-section {
  margin-bottom: 12px;
}

.quantity-controls {
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f8f9fa;
  border-radius: 8px;
  padding: 4px;
  gap: 2px;
}

.quantity-btn {
  width: 32px;
  height: 32px;
  border: none;
  background: white;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
  font-size: 16px;
  color: #374151;
  transition: all 0.2s;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
}

.quantity-btn:hover:not(:disabled) {
  background: #3b82f6;
  color: white;
  transform: scale(1.05);
}

.quantity-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
  transform: none;
}

.quantity-display {
  width: 40px;
  text-align: center;
  font-weight: 600;
  color: #1f2937;
  font-size: 14px;
}

/* Enhanced Add to Cart Button */
.add-to-cart-btn {
  position: relative;
  overflow: hidden;
}

.add-to-cart-btn.loading {
  color: transparent;
}

.add-to-cart-btn.loading::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 20px;
  height: 20px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top: 2px solid white;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  0% { transform: translate(-50%, -50%) rotate(0deg); }
  100% { transform: translate(-50%, -50%) rotate(360deg); }
}

/* Stock Status Enhanced Styles */
.product-stock {
  font-weight: 500;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 0.85rem;
  text-align: center;
}

.product-stock:not(.low-stock):not(.out-of-stock) {
  background: #d1fae5;
  color: #065f46;
}

.product-stock.low-stock {
  background: #fef3c7;
  color: #92400e;
}

.product-stock.out-of-stock {
  background: #fee2e2;
  color: #dc2626;
}

</style>
