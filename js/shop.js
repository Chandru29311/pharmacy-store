/**
 * Apothecary Sanctuary Shop Logic
 * High-performance Dynamic Filtering, Sorting, Search, and Cart Integration
 */

document.addEventListener("DOMContentLoaded", () => {
  const gridContainer = document.getElementById("shop-products-grid");
  if (!gridContainer) return;

  // Filter & Control Elements
  const searchInput = document.getElementById("shop-search-input");
  const heroSearchInput = document.getElementById("hero-shop-search");
  const sortSelect = document.getElementById("shop-sort-select");
  const priceRange = document.getElementById("shop-price-range");
  const priceDisplay = document.getElementById("shop-price-display");
  const countDisplay = document.getElementById("shop-results-count");
  const resetBtn = document.getElementById("shop-reset-filters");
  const activeFiltersBar = document.getElementById("active-filters-chips");
  const viewGrid3Btn = document.getElementById("view-grid-3");
  const viewGrid4Btn = document.getElementById("view-grid-4");

  // Mobile Filter Drawer Elements
  const mobileFilterBtn = document.getElementById("mobile-filter-toggle");
  const mobileFilterDrawer = document.getElementById("shop-filters-sidebar");
  const mobileFilterClose = document.getElementById("mobile-filters-close");
  const mobileFilterOverlay = document.getElementById("mobile-filters-overlay");

  // State
  let activeCategoryPill = "all";

  // URL Parameters Initialization (?category=... or ?search=...)
  const urlParams = new URLSearchParams(window.location.search);
  const initialCategory = urlParams.get("category");
  const initialSearch = urlParams.get("search");

  if (initialSearch && searchInput) {
    searchInput.value = initialSearch;
  }

  if (initialCategory) {
    activeCategoryPill = initialCategory;
    const targetCheckbox = document.querySelector(`input[name="category"][value="${initialCategory}"]`);
    if (targetCheckbox) targetCheckbox.checked = true;
    highlightPill(initialCategory);
  }

  // Price Slider Live Updates
  if (priceRange && priceDisplay) {
    priceRange.addEventListener("input", (e) => {
      priceDisplay.textContent = `₹${Number(e.target.value).toLocaleString()}`;
      filterAndRender();
    });
  }

  // Hero Search Sync
  if (heroSearchInput && searchInput) {
    heroSearchInput.addEventListener("input", (e) => {
      searchInput.value = e.target.value;
      filterAndRender(true);
    });
  }

  if (searchInput) {
    searchInput.addEventListener("input", () => {
      if (heroSearchInput) heroSearchInput.value = searchInput.value;
      filterAndRender(false);
    });
    searchInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        scrollToProducts();
      }
    });
  }

  if (sortSelect) {
    sortSelect.addEventListener("change", () => filterAndRender(true));
  }

  // All Checkboxes Event Listeners
  const filterCheckboxes = document.querySelectorAll(
    'input[name="category"], input[name="productType"], input[name="availability"], input[name="rating"]'
  );
  filterCheckboxes.forEach(cb => {
    cb.addEventListener("change", () => {
      activeCategoryPill = "all";
      document.querySelectorAll(".shop-category-pill").forEach(p => p.classList.remove("active"));
      const allPill = document.querySelector('.shop-category-pill[data-category="all"]');
      if (allPill) allPill.classList.add("active");
      filterAndRender(true);
    });
  });

  // Category Quick-Pills (Hero & Top Toolbar)
  document.querySelectorAll(".shop-category-pill").forEach(pill => {
    pill.addEventListener("click", () => {
      const cat = pill.getAttribute("data-category");
      activeCategoryPill = cat;
      highlightPill(cat);

      // Uncheck all category checkboxes first
      document.querySelectorAll('input[name="category"]').forEach(cb => {
        cb.checked = (cat !== "all" && cb.value.toLowerCase() === cat.toLowerCase());
      });

      filterAndRender(true);
    });
  });

  function highlightPill(cat) {
    document.querySelectorAll(".shop-category-pill").forEach(p => {
      p.classList.toggle("active", p.getAttribute("data-category").toLowerCase() === cat.toLowerCase());
    });
  }

  // Reset Filters Button
  if (resetBtn) {
    resetBtn.addEventListener("click", () => {
      if (searchInput) searchInput.value = "";
      if (heroSearchInput) heroSearchInput.value = "";
      if (priceRange) {
        priceRange.value = 2500;
        if (priceDisplay) priceDisplay.textContent = "₹2,500";
      }
      if (sortSelect) sortSelect.value = "featured";
      filterCheckboxes.forEach(cb => {
        if (cb.name === "availability" && cb.value === "all") cb.checked = true;
        else if (cb.name === "rating" && cb.value === "all") cb.checked = true;
        else cb.checked = false;
      });
      activeCategoryPill = "all";
      highlightPill("all");
      filterAndRender(true);
    });
  }

  // View Layout Switchers (3-column vs 4-column)
  if (viewGrid3Btn && viewGrid4Btn) {
    viewGrid3Btn.addEventListener("click", () => {
      gridContainer.classList.remove("grid-cols-4");
      viewGrid3Btn.classList.add("active");
      viewGrid4Btn.classList.remove("active");
    });
    viewGrid4Btn.addEventListener("click", () => {
      gridContainer.classList.add("grid-cols-4");
      viewGrid4Btn.classList.add("active");
      viewGrid3Btn.classList.remove("active");
    });
  }

  // Mobile Filter Drawer Toggle
  if (mobileFilterBtn && mobileFilterDrawer && mobileFilterOverlay) {
    mobileFilterBtn.addEventListener("click", () => {
      mobileFilterDrawer.classList.add("active");
      mobileFilterOverlay.classList.add("active");
      document.body.style.overflow = "hidden";
    });
  }

  function scrollToProducts() {
    const catalogEl = document.querySelector(".shop-main-catalog") || document.getElementById("shop-catalog");
    if (catalogEl) {
      const headerOffset = 90;
      const elementPosition = catalogEl.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
      window.scrollTo({
        top: Math.max(0, offsetPosition),
        behavior: "smooth"
      });
    }
  }

  function closeMobileFilters() {
    if (mobileFilterDrawer && mobileFilterOverlay) {
      mobileFilterDrawer.classList.remove("active");
      mobileFilterOverlay.classList.remove("active");
      document.body.style.overflow = "";
      scrollToProducts();
    }
  }

  if (mobileFilterClose) mobileFilterClose.addEventListener("click", closeMobileFilters);
  if (mobileFilterOverlay) mobileFilterOverlay.addEventListener("click", closeMobileFilters);

  // Helper to extract checked values
  function getChecked(name) {
    return Array.from(document.querySelectorAll(`input[name="${name}"]:checked`)).map(c => c.value);
  }

  // Master Filter & Render Function
  function filterAndRender(shouldScroll = false) {
    const allProducts = window.InventoryManager ? window.InventoryManager.getAll() : [];
    const query = (searchInput ? searchInput.value.trim().toLowerCase() : "");
    const selectedCats = getChecked("category");
    const selectedTypes = getChecked("productType");
    const selectedAvail = getChecked("availability");
    const selectedRating = document.querySelector('input[name="rating"]:checked')?.value || "all";
    const maxPrice = priceRange ? parseFloat(priceRange.value) : 2500;

    let filtered = allProducts.filter(item => {
      // Search
      if (query) {
        const matchesName = item.name.toLowerCase().includes(query);
        const matchesCat = item.category.toLowerCase().includes(query);
        const matchesBrand = (item.brand || "").toLowerCase().includes(query);
        const matchesDesc = (item.description || "").toLowerCase().includes(query);
        const matchesIngr = (item.ingredients || "").toLowerCase().includes(query);
        if (!matchesName && !matchesCat && !matchesBrand && !matchesDesc && !matchesIngr) return false;
      }

      // Category Pill / Checkbox
      if (activeCategoryPill !== "all") {
        if (item.category.toLowerCase() !== activeCategoryPill.toLowerCase()) return false;
      } else if (selectedCats.length > 0) {
        if (!selectedCats.includes(item.category)) return false;
      }

      // Product Type
      if (selectedTypes.length > 0 && !selectedTypes.includes(item.productType)) {
        return false;
      }

      // Availability
      if (selectedAvail.length > 0 && !selectedAvail.includes("all")) {
        if (!selectedAvail.includes(item.availability)) return false;
      }

      // Min Rating
      if (selectedRating !== "all") {
        if (item.rating < parseFloat(selectedRating)) return false;
      }

      // Max Price
      if (item.price > maxPrice) {
        return false;
      }

      return true;
    });

    // Sorting
    const sortBy = sortSelect ? sortSelect.value : "featured";
    if (sortBy === "price-low") {
      filtered.sort((a, b) => a.price - b.price);
    } else if (sortBy === "price-high") {
      filtered.sort((a, b) => b.price - a.price);
    } else if (sortBy === "rating") {
      filtered.sort((a, b) => b.rating - a.rating);
    } else if (sortBy === "name") {
      filtered.sort((a, b) => a.name.localeCompare(b.name));
    }

    // Update Counter
    if (countDisplay) {
      countDisplay.innerHTML = `Showing <strong>${filtered.length}</strong> of <strong>${allProducts.length}</strong> Curated Remedies`;
    }

    // Render Active Chips
    renderActiveFilterChips(selectedCats, selectedTypes, maxPrice, query);

    // Empty State
    if (filtered.length === 0) {
      gridContainer.innerHTML = `
        <div class="shop-empty-state">
          <div class="empty-icon-circle">
            <i class="fa-solid fa-mortar-pestle"></i>
          </div>
          <h3 class="empty-title">No Matching Remedies Found</h3>
          <p class="empty-desc">We couldn't find any remedies matching your selected criteria. Try adjusting your filters or price range.</p>
          <button class="btn btn-teal btn-pill" id="empty-clear-btn">
            <i class="fa-solid fa-rotate-left"></i> Reset All Filters
          </button>
        </div>
      `;
      const emptyBtn = document.getElementById("empty-clear-btn");
      if (emptyBtn && resetBtn) {
        emptyBtn.addEventListener("click", () => resetBtn.click());
      }
      if (shouldScroll) {
        setTimeout(scrollToProducts, 40);
      }
      return;
    }

    // Render Product Cards
    gridContainer.innerHTML = filtered.map(product => {
      const isWishlisted = isItemWishlisted(product.id);
      const discountPercent = product.originalPrice 
        ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100) 
        : 0;

      return `
        <article class="apoth-shop-card" data-id="${product.id}">
          <div class="apoth-card-media">
            <img src="${product.image}" alt="${product.name}" class="apoth-card-img" loading="lazy">
            
            <div class="apoth-card-badges">
              ${product.badge ? `<span class="apoth-badge apoth-badge-gold">${product.badge}</span>` : ''}
              ${discountPercent > 0 ? `<span class="apoth-badge apoth-badge-discount">-${discountPercent}%</span>` : ''}
            </div>

            <button type="button" class="apoth-wishlist-btn ${isWishlisted ? 'active' : ''}" data-id="${product.id}" title="Add to Wishlist" aria-label="Add ${product.name} to Wishlist">
              <i class="${isWishlisted ? 'fa-solid' : 'fa-regular'} fa-heart"></i>
            </button>
          </div>

          <div class="apoth-card-body">
            <div class="apoth-card-meta">
              <span class="apoth-card-category">${product.category}</span>
              <span class="apoth-card-brand">${product.brand || 'Apothecary Sanctuary'}</span>
            </div>

            <h3 class="apoth-card-title">${product.name}</h3>

            <div class="apoth-card-rating">
              <span class="stars-gold">${renderStars(product.rating)}</span>
              <span class="rating-val">${product.rating.toFixed(1)}</span>
              <span class="reviews-count">(${product.reviewsCount || 42})</span>
            </div>

            <p class="apoth-card-desc">${truncate(product.description || '', 75)}</p>

            <div class="apoth-card-pricing">
              <span class="apoth-price-current">₹${product.price.toLocaleString()}</span>
              ${product.originalPrice ? `<span class="apoth-price-orig">₹${product.originalPrice.toLocaleString()}</span>` : ''}
              ${discountPercent > 0 ? `<span class="apoth-save-pill">Save ₹${(product.originalPrice - product.price).toLocaleString()}</span>` : ''}
            </div>

            <div class="apoth-card-footer">
              <span class="apoth-stock-indicator ${product.availability === 'Low Stock' ? 'low-stock' : 'in-stock'}">
                <span class="stock-dot"></span>
                <span>${product.stock} in stock</span>
              </span>

              <button type="button" class="btn-shop-add-cart" data-id="${product.id}" data-name="${product.name}" data-price="${product.price}" data-image="${product.image}">
                <i class="fa-solid fa-cart-plus"></i> ADD
              </button>
            </div>
          </div>
        </article>
      `;
    }).join("");

    attachCardEventListeners();

    if (shouldScroll) {
      setTimeout(scrollToProducts, 40);
    }
  }

  function renderStars(rating) {
    const full = Math.floor(rating);
    const half = rating % 1 >= 0.5;
    let html = "";
    for (let i = 0; i < full; i++) html += '<i class="fa-solid fa-star"></i>';
    if (half) html += '<i class="fa-solid fa-star-half-stroke"></i>';
    const empty = 5 - full - (half ? 1 : 0);
    for (let i = 0; i < empty; i++) html += '<i class="fa-regular fa-star"></i>';
    return html;
  }

  function truncate(str, max) {
    if (!str || str.length <= max) return str;
    return str.slice(0, max).trim() + "...";
  }

  function renderActiveFilterChips(cats, types, price, q) {
    if (!activeFiltersBar) return;
    const chips = [];

    if (q) chips.push({ label: `"${q}"`, clear: () => { searchInput.value = ""; } });
    if (activeCategoryPill !== "all") {
      chips.push({ label: activeCategoryPill, clear: () => { activeCategoryPill = "all"; highlightPill("all"); } });
    }
    cats.forEach(c => chips.push({
      label: c,
      clear: () => {
        const cb = document.querySelector(`input[name="category"][value="${c}"]`);
        if (cb) cb.checked = false;
      }
    }));
    types.forEach(t => chips.push({
      label: t,
      clear: () => {
        const cb = document.querySelector(`input[name="productType"][value="${t}"]`);
        if (cb) cb.checked = false;
      }
    }));
    if (price < 2500) {
      chips.push({
        label: `Under ₹${price.toLocaleString()}`,
        clear: () => {
          priceRange.value = 2500;
          priceDisplay.textContent = "₹2,500";
        }
      });
    }

    if (chips.length === 0) {
      activeFiltersBar.style.display = "none";
      activeFiltersBar.innerHTML = "";
      return;
    }

    activeFiltersBar.style.display = "flex";
    activeFiltersBar.innerHTML = `
      <span class="active-chips-title">Active Filters:</span>
      ${chips.map((chip, idx) => `
        <span class="active-chip" data-chip-idx="${idx}">
          ${chip.label}
          <button type="button" class="chip-remove-btn" data-chip-idx="${idx}">&times;</button>
        </span>
      `).join("")}
      <button type="button" class="active-chips-clear-all" id="chips-clear-all">Clear All</button>
    `;

    // Chip click events
    document.querySelectorAll(".chip-remove-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        const idx = Number(btn.getAttribute("data-chip-idx"));
        chips[idx].clear();
        filterAndRender(true);
      });
    });

    const clearAllBtn = document.getElementById("chips-clear-all");
    if (clearAllBtn && resetBtn) {
      clearAllBtn.addEventListener("click", () => resetBtn.click());
    }
  }

  function attachCardEventListeners() {
    // Add to cart buttons
    document.querySelectorAll(".btn-shop-add-cart").forEach(btn => {
      btn.addEventListener("click", (e) => {
        e.preventDefault();
        const id = btn.getAttribute("data-id");
        if (window.CartManager) {
          window.CartManager.addItem(id, 1);
        }
        // Button click micro-animation
        btn.classList.add("added-pulse");
        setTimeout(() => btn.classList.remove("added-pulse"), 600);
      });
    });

    // Wishlist buttons
    document.querySelectorAll(".apoth-wishlist-btn").forEach(btn => {
      btn.addEventListener("click", (e) => {
        e.preventDefault();
        const id = btn.getAttribute("data-id");
        toggleWishlist(id, btn);
      });
    });
  }

  // Wishlist Handling
  function isItemWishlisted(id) {
    try {
      const list = JSON.parse(localStorage.getItem("pharmacy_store_wishlist") || "[]");
      return list.includes(id);
    } catch (e) {
      return false;
    }
  }

  function toggleWishlist(id, btn) {
    try {
      let list = JSON.parse(localStorage.getItem("pharmacy_store_wishlist") || "[]");
      const icon = btn.querySelector("i");
      if (list.includes(id)) {
        list = list.filter(item => item !== id);
        btn.classList.remove("active");
        if (icon) {
          icon.classList.remove("fa-solid");
          icon.classList.add("fa-regular");
        }
        if (window.NotificationManager) {
          window.NotificationManager.showToast("Removed remedy from your Wishlist.", "info");
        }
      } else {
        list.push(id);
        btn.classList.add("active");
        if (icon) {
          icon.classList.remove("fa-regular");
          icon.classList.add("fa-solid");
        }
        if (window.NotificationManager) {
          window.NotificationManager.showToast("Added remedy to your Wishlist!", "success");
        }
      }
      localStorage.setItem("pharmacy_store_wishlist", JSON.stringify(list));
    } catch (e) {
      console.error("Wishlist error:", e);
    }
  }

  // Keyboard escape to close mobile filters
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      closeMobileFilters();
    }
  });

  // Initial Filter and Render invocation
  filterAndRender();
});
