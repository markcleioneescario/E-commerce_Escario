// ---------- Data ----------

const PRODUCTS = [
  { id: 'chicken-adobo',    name: 'Chicken Adobo',    category: 'chicken',    price: 60, image: 'Ulam images/Adobong Manok.png',    description: 'Chicken simmered in soy sauce, vinegar, garlic, and spices.' },
  { id: 'chicken-tinola',   name: 'Chicken Tinola',   category: 'chicken',    price: 60, image: 'Ulam images/Manok Tinola.png',   description: 'Chicken soup with ginger, green papaya or sayote, and leafy greens.' },
  { id: 'chicken-afritada', name: 'Chicken Afritada', category: 'chicken',    price: 65, image: 'Ulam images/Chicken Afritada.png', description: 'Chicken stew cooked in tomato sauce with potatoes, carrots, and bell peppers.' },
  { id: 'pork-adobo',       name: 'Pork Adobo',       category: 'pork',       price: 65, image: 'Ulam images/Pork Adobo.png',       description: 'Pork simmered in soy sauce, vinegar, garlic, and spices.' },
  { id: 'pork-sinigang',    name: 'Pork Sinigang',    category: 'pork',       price: 70, image: 'Ulam images/Pork Sinigang.png',    description: 'Pork soup with a sour tamarind broth and vegetables.' },
  { id: 'pork-menudo',      name: 'Pork Menudo',      category: 'pork',       price: 60, image: 'Ulam images/Menudo.png',      description: 'Pork stew with tomato sauce, potatoes, carrots, and liver.' },
  { id: 'pork-giniling',    name: 'Pork Giniling',    category: 'pork',       price: 55, image: 'Ulam images/Pork Giniling.png',    description: 'Ground pork cooked with potatoes, carrots, peas, and tomato sauce.' },
  { id: 'bicol-express',    name: 'Bicol Express',    category: 'pork',       price: 65, image: 'Ulam images/Bicol Express.png',    description: 'Pork cooked in coconut milk, chili peppers, and shrimp paste.' },
  { id: 'pork-sisig',       name: 'Pork Sisig',       category: 'pork',       price: 70, image: 'Ulam images/Pork Sisig.png',       description: 'Chopped pork seasoned with calamansi, onions, and chili peppers.' },
  { id: 'pinakbet',         name: 'Pinakbet',         category: 'vegetables', price: 50, image: 'Ulam images/Pinakbet.png',         description: 'Mixed vegetables cooked with bagoong, commonly with pork or shrimp.' }
];

// ---------- Helpers ----------

const $ = (selector) => document.querySelector(selector);

const money = (amount) => `₱${Number(amount).toLocaleString('en-PH')}`;

// Escapes text that came from a customer (checkout form) before it is
// inserted into the page with innerHTML, to avoid HTML/script injection.
function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str ?? '';
  return div.innerHTML;
}

function cart() {
  return JSON.parse(localStorage.getItem('lutongUlamCart') || '[]');
}

function saveCart(items) {
  localStorage.setItem('lutongUlamCart', JSON.stringify(items));
  updateCartCount();
}

function updateCartCount() {
  const totalQty = cart().reduce((sum, item) => sum + item.qty, 0);
  document.querySelectorAll('.cart-count').forEach((el) => {
    el.textContent = totalQty;
  });
}

function toast(message) {
  const existing = document.querySelector('.toast');
  if (existing) existing.remove();

  const el = document.createElement('div');
  el.className = 'toast';
  el.textContent = message;
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 1800);
}

// ---------- Cart actions ----------

function addToCart(id, qty = 1) {
  const items = cart();
  const product = PRODUCTS.find((p) => p.id === id);
  if (!product) return;

  const existing = items.find((i) => i.id === id);
  if (existing) {
    existing.qty += qty;
  } else {
    items.push({ id, qty });
  }

  saveCart(items);
  toast(`${product.name} added to cart.`);
}

function changeQty(id, delta) {
  const items = cart();
  const item = items.find((i) => i.id === id);
  if (!item) return;

  item.qty += delta;
  saveCart(item.qty > 0 ? items : items.filter((i) => i.id !== id));
  renderCart();
}

function removeItem(id) {
  saveCart(cart().filter((i) => i.id !== id));
  renderCart();
}

function cartTotal() {
  return cart().reduce((sum, item) => {
    const product = PRODUCTS.find((p) => p.id === item.id);
    return sum + (product ? product.price * item.qty : 0);
  }, 0);
}

// ---------- Rendering ----------

function productCard(p) {
  return `
    <article class="product-card">
      <img src="${p.image}" alt="${p.name}" loading="lazy">
      <div class="product-info">
        <span class="category-label">${p.category}</span>
        <h3>${p.name}</h3>
        <p>${p.description}</p>
        <div class="product-bottom">
          <span class="price">${money(p.price)}</span>
          <button class="small-btn" onclick="addToCart('${p.id}')">ADD TO CART</button>
        </div>
        <div class="details-link">
          <a class="text-link" href="food-details.html?id=${p.id}">View Details →</a>
        </div>
      </div>
    </article>`;
}

function renderMenu(category = 'all') {
  const target = $('#menu-products');
  if (!target) return;

  const filtered = PRODUCTS.filter((p) => category === 'all' || p.category === category);
  target.innerHTML = filtered.map(productCard).join('');
}

function renderFeatured() {
  const target = $('#featured-products');
  if (!target) return;

  const featuredIds = ['chicken-adobo', 'pork-sinigang', 'pork-sisig'];
  target.innerHTML = featuredIds
    .map((id) => PRODUCTS.find((p) => p.id === id))
    .filter(Boolean)
    .map(productCard)
    .join('');
}

function renderDetails() {
  const target = $('#food-detail');
  if (!target) return;

  const id = new URLSearchParams(location.search).get('id');
  const product = PRODUCTS.find((p) => p.id === id);

  if (!product) {
    target.innerHTML = `
      <div class="empty-state">
        <h2>Food not found</h2>
        <a class="btn btn-primary" href="menu.html">BACK TO MENU</a>
      </div>`;
    return;
  }

  target.innerHTML = `
    <div class="detail-card">
      <div class="detail-photo">
        <img src="${product.image}" alt="${product.name}">
      </div>
      <div class="detail-copy">
        <span class="category-label">${product.category}</span>
        <h1>${product.name}</h1>
        <p class="description">${product.description}</p>
        <div class="detail-price">${money(product.price)}</div>
        <div class="quantity-box">
          <button id="minus" aria-label="Decrease quantity">−</button>
          <span id="qty">1</span>
          <button id="plus" aria-label="Increase quantity">+</button>
        </div>
        <button class="btn btn-primary" id="detail-add">ADD TO CART</button>
        <a class="btn btn-outline" href="menu.html">BACK TO MENU</a>
      </div>
    </div>`;

  let qty = 1;
  $('#minus').onclick = () => {
    qty = Math.max(1, qty - 1);
    $('#qty').textContent = qty;
  };
  $('#plus').onclick = () => {
    qty += 1;
    $('#qty').textContent = qty;
  };
  $('#detail-add').onclick = () => addToCart(product.id, qty);
}

function renderCart() {
  const target = $('#cart-content');
  if (!target) return;

  const items = cart();
  if (!items.length) {
    target.innerHTML = `
      <div class="empty-state">
        <h2>Your cart is empty.</h2>
        <p>Add some Filipino favorites first.</p>
        <a class="btn btn-primary" href="menu.html">VIEW MENU</a>
      </div>`;
    return;
  }

  const rows = items.map((item) => {
    const product = PRODUCTS.find((p) => p.id === item.id);
    if (!product) return '';
    return `
      <div class="cart-row">
        <img src="${product.image}" alt="${product.name}">
        <div>
          <h3>${product.name}</h3>
          <p>${money(product.price)} each</p>
          <div class="qty-controls">
            <button onclick="changeQty('${product.id}', -1)">−</button>
            <strong>${item.qty}</strong>
            <button onclick="changeQty('${product.id}', 1)">+</button>
          </div>
          <button class="remove-btn" onclick="removeItem('${product.id}')">Remove</button>
        </div>
        <strong>${money(product.price * item.qty)}</strong>
      </div>`;
  }).join('');

  target.innerHTML = `
    <div class="cart-layout">
      <div class="cart-list">${rows}</div>
      <aside class="summary-card">
        <h2>Order Summary</h2>
        <div class="summary-line">
          <span>Subtotal</span>
          <strong>${money(cartTotal())}</strong>
        </div>
        <div class="summary-line summary-total">
          <span>Total</span>
          <strong>${money(cartTotal())}</strong>
        </div>
        <a class="btn btn-outline" href="menu.html">CONTINUE SHOPPING</a>
        <a class="btn btn-primary" href="checkout.html">CHECKOUT</a>
      </aside>
    </div>`;
}

function renderCheckout() {
  const target = $('#checkout-content');
  if (!target) return;

  const items = cart();
  if (!items.length) {
    target.innerHTML = `
      <div class="empty-state">
        <h2>Your cart is empty.</h2>
        <a class="btn btn-primary" href="menu.html">VIEW MENU</a>
      </div>`;
    return;
  }

  const itemRows = items.map((item) => {
    const product = PRODUCTS.find((p) => p.id === item.id);
    if (!product) return '';
    return `
      <div class="checkout-item">
        <span>${product.name} × ${item.qty}</span>
        <strong>${money(product.price * item.qty)}</strong>
      </div>`;
  }).join('');

  target.innerHTML = `
    <div class="checkout-grid">
      <form class="form-card" id="checkout-form">
        <h2>Customer Information</h2>

        <div class="form-group">
          <label for="name">Full Name</label>
          <input id="name" name="name" required>
        </div>

        <div class="form-group">
          <label for="contact">Contact Number</label>
          <input id="contact" name="contact" type="tel" required placeholder="09XXXXXXXXX" pattern="09[0-9]{9}">
        </div>

        <div class="form-group">
          <label for="address">Address</label>
          <textarea id="address" name="address" required></textarea>
        </div>

        <div class="form-group">
          <label>Order Type</label>
          <div class="choice-row">
            <label class="choice"><input type="radio" name="type" value="Pickup" checked> Pickup</label>
            <label class="choice"><input type="radio" name="type" value="Delivery"> Delivery</label>
          </div>
        </div>

        <div class="form-group">
          <label>Payment Method</label>
          <div class="choice-row">
            <label class="choice"><input type="radio" name="payment" value="Cash" checked> Cash</label>
            <label class="choice"><input type="radio" name="payment" value="GCash"> GCash</label>
          </div>
        </div>

        <button class="btn btn-primary" type="submit">PLACE ORDER</button>
      </form>

      <aside class="summary-card">
        <h2>Order Summary</h2>
        ${itemRows}
        <div class="summary-line summary-total">
          <span>Total</span>
          <strong>${money(cartTotal())}</strong>
        </div>
      </aside>
    </div>`;

  $('#checkout-form').onsubmit = (e) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);

    const order = {
      name: data.get('name').trim(),
      contact: data.get('contact').trim(),
      address: data.get('address').trim(),
      type: data.get('type'),
      payment: data.get('payment'),
      items,
      total: cartTotal(),
      number: 'LU-' + Math.floor(100000 + Math.random() * 900000)
    };

    localStorage.setItem('lutongUlamLastOrder', JSON.stringify(order));
    localStorage.removeItem('lutongUlamCart');
    location.href = 'order-confirmed.html';
  };
}

function renderConfirmation() {
  const target = $('#confirmation-content');
  if (!target) return;

  const order = JSON.parse(localStorage.getItem('lutongUlamLastOrder') || 'null');
  if (!order) {
    target.innerHTML = `
      <div class="empty-state">
        <h2>No recent order found.</h2>
        <a class="btn btn-primary" href="menu.html">VIEW MENU</a>
      </div>`;
    return;
  }

  const itemRows = order.items.map((item) => {
    const product = PRODUCTS.find((p) => p.id === item.id);
    if (!product) return '';
    return `
      <div>
        <span>${product.name} × ${item.qty}</span>
        <strong>${money(product.price * item.qty)}</strong>
      </div>`;
  }).join('');

  target.innerHTML = `
    <div class="confirmation">
      <div class="checkmark">✓</div>
      <p class="eyebrow">THANK YOU, ${escapeHtml(order.name).toUpperCase()}!</p>
      <h1>Order Confirmed!</h1>
      <p>Your order has been recorded successfully.</p>
      <div class="order-summary">
        <div><span>Order Number</span><strong>${order.number}</strong></div>
        <div><span>Order Type</span><strong>${order.type}</strong></div>
        <div><span>Payment</span><strong>${order.payment}</strong></div>
        <hr>
        ${itemRows}
        <div><span>Total</span><strong>${money(order.total)}</strong></div>
      </div>
      <a class="btn btn-primary" href="index.html">BACK TO HOME</a>
    </div>`;
}

// ---------- Init ----------

function init() {
  updateCartCount();

  document.querySelector('.menu-toggle')?.addEventListener('click', () => {
    document.querySelector('.main-nav').classList.toggle('open');
  });

  document.querySelectorAll('.filter-btn').forEach((btn) => {
    btn.onclick = () => {
      document.querySelectorAll('.filter-btn').forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      renderMenu(btn.dataset.category);
    };
  });

  renderFeatured();
  renderMenu();
  renderDetails();
  renderCart();
  renderCheckout();
  renderConfirmation();
}

document.addEventListener('DOMContentLoaded', init);
