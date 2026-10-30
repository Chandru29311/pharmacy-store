/**
 * Product Details Page Interactions
 * Gallery switcher, Quantity selector, Cart animation, Tabs, Related products
 */

document.addEventListener("DOMContentLoaded", () => {
  const urlParams = new URLSearchParams(window.location.search);
  const productId = urlParams.get("id") || "med-01";

  const product = window.InventoryManager 
    ? window.InventoryManager.getById(productId) 
    : null;

  if (!product) return;

  // Render Product Meta & Details
  document.title = `${product.name} | Aura Pharmacy Store`;

  // Gallery
  const mainImage = document.getElementById("product-main-img");
  const thumbsContainer = document.getElementById("product-thumbs-container");
  if (mainImage && product.image) {
    mainImage.src = product.image;
    mainImage.alt = product.name;
  }

  if (thumbsContainer && product.gallery) {
    thumbsContainer.innerHTML = product.gallery.map((src, idx) => `
      <button class="thumb-btn ${idx === 0 ? 'active' : ''}" data-src="${src}">
        <img src="${src}" alt="Thumbnail ${idx + 1}" class="thumb-img">
      </button>
    `).join("");

    const thumbBtns = thumbsContainer.querySelectorAll(".thumb-btn");
    thumbBtns.forEach(btn => {
      btn.addEventListener("click", () => {
        thumbBtns.forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        const newSrc = btn.getAttribute("data-src");
        if (mainImage) {
          if (window.gsap) {
            gsap.to(mainImage, {
              opacity: 0.3,
              duration: 0.15,
              onComplete: () => {
                mainImage.src = newSrc;
                gsap.to(mainImage, { opacity: 1, duration: 0.25 });
              }
            });
          } else {
            mainImage.src = newSrc;
          }
        }
      });
    });
  }

  // Info binding
  const titleEl = document.getElementById("detail-title");
  const priceEl = document.getElementById("detail-price");
  const origPriceEl = document.getElementById("detail-orig-price");
  const badgeEl = document.getElementById("detail-badge");
  const descEl = document.getElementById("detail-desc");
  const typeEl = document.getElementById("detail-type");
  const qtyEl = document.getElementById("detail-qty-label");
  const stockEl = document.getElementById("detail-stock");
  const ratingStars = document.getElementById("detail-stars");

  if (titleEl) titleEl.textContent = product.name;
  if (priceEl) priceEl.textContent = `₹${product.price.toLocaleString()}`;
  if (origPriceEl) {
    if (product.originalPrice) {
      origPriceEl.textContent = `₹${product.originalPrice.toLocaleString()}`;
      origPriceEl.style.display = "inline";
    } else {
      origPriceEl.style.display = "none";
    }
  }
  if (badgeEl) {
    badgeEl.textContent = `● ${product.availability.toUpperCase()}`;
    badgeEl.className = `badge ${product.availability === 'Low Stock' ? 'badge-warning' : 'badge-gold'}`;
  }
  if (descEl) descEl.textContent = product.description;
  if (typeEl) typeEl.textContent = product.productType;
  if (qtyEl) qtyEl.textContent = product.quantity;
  if (stockEl) stockEl.textContent = `${product.stock} Units in Central Pharmacy`;

  if (ratingStars) {
    ratingStars.innerHTML = `
      <span class="stars">${renderStars(product.rating)}</span>
      <span class="rating-text">${product.rating} / 5.0 (Verified Clinical Reviews)</span>
    `;
  }

  // Tab contents
  const tabsMap = {
    "tab-description": product.description,
    "tab-ingredients": product.ingredients,
    "tab-usage": product.usage,
    "tab-benefits": product.benefits,
    "tab-storage": product.storage,
    "tab-shipping": product.shipping,
    "tab-returns": product.returns
  };

  Object.entries(tabsMap).forEach(([id, text]) => {
    const el = document.getElementById(id);
    if (el) el.textContent = text;
  });

  // Tab Switching
  const tabButtons = document.querySelectorAll(".spec-tab-btn");
  const tabPanes = document.querySelectorAll(".spec-tab-pane");
  tabButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      const targetId = btn.getAttribute("data-tab");
      tabButtons.forEach(b => b.classList.remove("active"));
      tabPanes.forEach(p => p.classList.remove("active"));
      btn.classList.add("active");
      const targetPane = document.getElementById(targetId);
      if (targetPane) targetPane.classList.add("active");
    });
  });

  // Quantity Stepper
  let currentQty = 1;
  const qtyInput = document.getElementById("detail-qty-input");
  const minusBtn = document.getElementById("detail-qty-minus");
  const plusBtn = document.getElementById("detail-qty-plus");

  if (minusBtn) {
    minusBtn.addEventListener("click", () => {
      if (currentQty > 1) {
        currentQty--;
        if (qtyInput) qtyInput.value = currentQty;
      }
    });
  }

  if (plusBtn) {
    plusBtn.addEventListener("click", () => {
      if (currentQty < product.stock) {
        currentQty++;
        if (qtyInput) qtyInput.value = currentQty;
      }
    });
  }

  // Add to Cart Button with requested Animation
  // ADD TO CART -> ADDING... -> ADDED ✓
  const addToCartBtn = document.getElementById("detail-add-cart-btn");
  if (addToCartBtn) {
    addToCartBtn.addEventListener("click", () => {
      addToCartBtn.disabled = true;
      const originalHtml = addToCartBtn.innerHTML;

      addToCartBtn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> ADDING...`;

      setTimeout(() => {
        window.CartManager.addItem(product.id, currentQty);
        addToCartBtn.innerHTML = `<i class="fa-solid fa-check"></i> ADDED ✓`;
        addToCartBtn.classList.add("btn-success");

        setTimeout(() => {
          addToCartBtn.innerHTML = originalHtml;
          addToCartBtn.classList.remove("btn-success");
          addToCartBtn.disabled = false;
        }, 1800);
      }, 500);
    });
  }

  // Buy Now
  const buyNowBtn = document.getElementById("detail-buy-now-btn");
  if (buyNowBtn) {
    buyNowBtn.addEventListener("click", () => {
      window.CartManager.addItem(product.id, currentQty);
      window.CartManager.openDrawer();
    });
  }

  // Wishlist toggle
  const detailWishlistBtn = document.getElementById("detail-wishlist-btn");
  if (detailWishlistBtn) {
    const isWished = window.WishlistManager ? window.WishlistManager.isWishlisted(product.id) : false;
    updateWishlistBtnState(detailWishlistBtn, isWished);

    detailWishlistBtn.addEventListener("click", () => {
      const added = window.WishlistManager.toggle(product.id);
      updateWishlistBtnState(detailWishlistBtn, added);
    });
  }

  function updateWishlistBtnState(btn, active) {
    btn.classList.toggle("active", active);
    const icon = btn.querySelector("i");
    const label = btn.querySelector(".wishlist-label");
    if (icon) icon.className = active ? "fa-solid fa-heart" : "fa-regular fa-heart";
    if (label) label.textContent = active ? "Saved in Wishlist" : "Add to Wishlist";
  }

  // Render Related Healthcare Essentials
  renderRelatedProducts(product);
});

function renderStars(rating) {
  const fullStars = Math.floor(rating);
  const halfStar = rating % 1 >= 0.5;
  let starsHtml = "";
  for (let i = 0; i < fullStars; i++) starsHtml += '<i class="fa-solid fa-star"></i>';
  if (halfStar) starsHtml += '<i class="fa-solid fa-star-half-stroke"></i>';
  const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);
  for (let i = 0; i < emptyStars; i++) starsHtml += '<i class="fa-regular fa-star"></i>';
  return starsHtml;
}

function renderRelatedProducts(currentProduct) {
  const container = document.getElementById("related-products-grid");
  if (!container || !window.InventoryManager) return;

  const all = window.InventoryManager.getAll();
  const related = all.filter(p => p.id !== currentProduct.id).slice(0, 4);

  container.innerHTML = related.map(p => `
    <div class="product-card" data-id="${p.id}">
      <div class="product-card-media">
        <a href="ProductDetails.html?id=${p.id}">
          <img src="${p.image}" alt="${p.name}" class="product-card-img" loading="lazy">
        </a>
        <div class="product-card-badges">
          <span class="badge badge-gold">● ${p.availability.toUpperCase()}</span>
        </div>
      </div>
      <div class="product-card-body">
        <span class="product-card-category">${p.category}</span>
        <h4 class="product-card-title"><a href="ProductDetails.html?id=${p.id}">${p.name}</a></h4>
        <div class="product-card-pricing">
          <span class="product-price">₹${p.price.toLocaleString()}</span>
          ${p.originalPrice ? `<span class="product-orig-price">₹${p.originalPrice.toLocaleString()}</span>` : ''}
        </div>
        <div class="product-card-footer">
          <span class="stock-info">${p.stock} Available</span>
          <button class="btn btn-gold btn-sm quick-add-btn" data-id="${p.id}">
            <i class="fa-solid fa-plus"></i> ADD
          </button>
        </div>
      </div>
    </div>
  `).join("");
}
