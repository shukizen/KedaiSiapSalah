
function getCartItems() {
    try {
        return JSON.parse(localStorage.getItem('cartItems')) || [];
    } catch(e) {
        return [];
    }
}

function saveCartItems(items) {
    localStorage.setItem('cartItems', JSON.stringify(items));
}

// Categories toggle & filter logic
const categoryBtns = document.querySelectorAll('.category-btn');
const menuCards = document.querySelectorAll('.menu-card');

categoryBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        // Remove active class from all buttons
        categoryBtns.forEach(b => b.classList.remove('active'));
        // Add to clicked button
        btn.classList.add('active');
        
        // Re-run filter logic
        filterMenu();
    });
});

// Initialize default view based on active tab
const defaultActiveBtn = document.querySelector('.category-btn.active');
if (defaultActiveBtn) {
    // Trigger click to apply the filter logic on page load
    defaultActiveBtn.click();
}

// Bottom Nav logic
const navItems = document.querySelectorAll('.nav-item');

navItems.forEach(item => {
    item.addEventListener('click', (e) => {
        e.preventDefault();
        navItems.forEach(nav => nav.classList.remove('active'));
        item.classList.add('active');
    });
});

// Add to Cart logic
let cartCount = parseInt(localStorage.getItem('cartCount')) || 0;
const cartBadge = document.getElementById('cart-count');
const toast = document.getElementById('toast');
let toastTimeout;


function openDetailPage(card) {
    if (!card) return;
    const title = card.querySelector('.card-title').textContent;
    const desc = card.querySelector('.card-desc').textContent;
    const priceText = card.querySelector('.card-price').textContent;
    const imgSrc = card.querySelector('img').src;
    
    const params = new URLSearchParams({
        title: title,
        desc: desc,
        price: priceText,
        img: imgSrc
    });
    
    window.location.href = 'detail.html?' + params.toString();
}

function addToCart(event, button) {
    event.stopPropagation();

    const menuCard = button.closest('.menu-card');
    const cardBottom = button.closest('.card-bottom');
    const priceEl = cardBottom.querySelector('.card-price');
    const priceText = priceEl.textContent;
    const price = parseInt(priceText.replace(/[^0-9]/g, '')) || 0;
    
    const cardTitle = menuCard.querySelector('.card-title').textContent;
    const cardDesc = menuCard.querySelector('.card-desc').textContent;
    const cardImg = menuCard.querySelector('img').src;

    // Sembunyikan harga
    if (priceEl) priceEl.style.display = 'none';

    // Ubah tombol menjadi stepper full width
    button.outerHTML = `
        <div class="card-stepper full-width" onclick="event.stopPropagation()">
            <button class="stepper-minus" onclick="updateCardQty(event, this, -1, ${price})">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"><line x1="5" y1="12" x2="19" y2="12"></line></svg>
            </button>
            <span class="stepper-val">1</span>
            <button class="stepper-plus" onclick="updateCardQty(event, this, 1, ${price})">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
            </button>
        </div>
    `;

    // Save to items array
    let items = getCartItems();
    let existing = items.find(i => i.title === cardTitle);
    if(existing) {
        existing.qty += 1;
    } else {
        items.push({ title: cardTitle, desc: cardDesc, price: price, img: cardImg, qty: 1 });
    }
    saveCartItems(items);

    updateGlobalCart(1, price);
}

function updateCardQty(event, btn, change, price) {
    event.stopPropagation();
    const menuCard = btn.closest('.menu-card');
    const cardTitle = menuCard.querySelector('.card-title').textContent;
    
    const stepper = btn.closest('.card-stepper');
    const cardBottom = stepper.closest('.card-bottom');
    const valSpan = stepper.querySelector('.stepper-val');
    let qty = parseInt(valSpan.textContent);
    
    qty += change;
    
    let items = getCartItems();
    let existing = items.find(i => i.title === cardTitle);
    if(existing) {
        existing.qty += change;
        if(existing.qty <= 0) {
            items = items.filter(i => i.title !== cardTitle);
        }
    }
    saveCartItems(items);
    
    if (qty <= 0) {
        // Tampilkan harga kembali
        const priceEl = cardBottom.querySelector('.card-price');
        if (priceEl) priceEl.style.display = 'block';

        // Kembalikan ke tombol + awal
        stepper.outerHTML = `
            <button class="card-add-btn" onclick="addToCart(event, this)">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
            </button>
        `;
        updateGlobalCart(-1, -price);
    } else {
        valSpan.textContent = qty;
        updateGlobalCart(change, change * price);
    }
    
    btn.style.transform = "scale(0.8)";
    setTimeout(() => { btn.style.transform = "scale(1)"; }, 150);
}

function updateGlobalCart(qtyChange, priceChange) {
    let cartCount = parseInt(localStorage.getItem('cartCount')) || 0;
    let cartTotal = parseInt(localStorage.getItem('cartTotal')) || 0;
    
    cartCount += qtyChange;
    cartTotal += priceChange;
    
    localStorage.setItem('cartCount', cartCount);
    localStorage.setItem('cartTotal', cartTotal);
    
    updateCheckoutBar();
}

function updateCheckoutBar() {
    const checkoutBar = document.getElementById('checkout-bar');
    if (!checkoutBar) return;
    
    let currentCartCount = parseInt(localStorage.getItem('cartCount')) || 0;
    let currentCartTotal = parseInt(localStorage.getItem('cartTotal')) || 0;
    
    if (currentCartCount > 0) {
        document.getElementById('checkout-count').textContent = currentCartCount + ' ITEM DIPILIH';
        document.getElementById('checkout-total').textContent = 'Rp ' + currentCartTotal.toLocaleString('id-ID').replace(/,/g, '.');
        checkoutBar.classList.add('show');
        checkoutBar.onclick = () => { window.location.href = 'checkout.html'; };
    } else {
        checkoutBar.classList.remove('show');
    }
}

// Inisialisasi bar saat halaman dimuat
document.addEventListener('DOMContentLoaded', () => {
    updateCheckoutBar();
    restoreSteppersFromCart();
    
    // Set user name in sidebar from last order if available
    try {
        const lastOrderStr = localStorage.getItem('lastOrder');
        if (lastOrderStr) {
            const lastOrder = JSON.parse(lastOrderStr);
            if (lastOrder && lastOrder.name) {
                const userNameEls = document.querySelectorAll('.user-name');
                userNameEls.forEach(el => {
                    el.textContent = lastOrder.name;
                });
            }
        }
    } catch(e) {
        // ignore
    }
});

// Memulihkan stepper dari localStorage saat halaman dimuat kembali
function restoreSteppersFromCart() {
    const items = getCartItems();
    if (items.length === 0) return;

    const menuCards = document.querySelectorAll('.menu-card');
    menuCards.forEach(card => {
        const cardTitle = card.querySelector('.card-title').textContent;
        const match = items.find(i => i.title === cardTitle);
        
        if (match && match.qty > 0) {
            const cardBottom = card.querySelector('.card-bottom');
            const priceEl = cardBottom.querySelector('.card-price');
            const addBtn = cardBottom.querySelector('.card-add-btn');
            const price = match.price;

            // Sembunyikan harga
            if (priceEl) priceEl.style.display = 'none';

            // Ganti tombol + dengan stepper
            if (addBtn) {
                addBtn.outerHTML = `
                    <div class="card-stepper full-width" onclick="event.stopPropagation()">
                        <button class="stepper-minus" onclick="updateCardQty(event, this, -1, ${price})">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                        </button>
                        <span class="stepper-val">${match.qty}</span>
                        <button class="stepper-plus" onclick="updateCardQty(event, this, 1, ${price})">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                        </button>
                    </div>
                `;
            }
        }
    });
}

function showToast() {
    toast.classList.add('show');
    
    // Clear existing timeout
    clearTimeout(toastTimeout);
    
    // Hide toast after 2 seconds
    toastTimeout = setTimeout(() => {
        toast.classList.remove('show');
    }, 2000);
}

// Initialize cart badge on load
if (cartBadge) { cartBadge.textContent = cartCount; }

function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebar-overlay');
    const appContainer = document.querySelector('.mobile-app');
    
    sidebar.classList.toggle('active');
    overlay.classList.toggle('active');
    
    if (sidebar.classList.contains('active')) {
        document.querySelector('.app-scroll-container').style.overflowY = 'hidden';
    } else {
        document.querySelector('.app-scroll-container').style.overflowY = 'auto';
    }
}

// Search Logic
function toggleSearch() {
    const header = document.getElementById('menu-header');
    const input = document.getElementById('search-input');
    const searchIcon = document.querySelector('#search-btn .icon-search');
    const closeIcon = document.querySelector('#search-btn .icon-close');
    
    header.classList.toggle('search-active');
    
    if (header.classList.contains('search-active')) {
        input.focus();
        searchIcon.style.display = 'none';
        closeIcon.style.display = 'block';
    } else {
        input.value = '';
        searchIcon.style.display = 'block';
        closeIcon.style.display = 'none';
        filterMenu(); // reset filter
    }
}

function filterMenu() {
    const searchInput = document.getElementById('search-input');
    // If input doesn't exist yet, just pass empty string
    const query = searchInput ? searchInput.value.toLowerCase() : '';
    
    const cards = document.querySelectorAll('.menu-card');
    const activeCategoryBtn = document.querySelector('.category-btn.active');
    const activeCategory = activeCategoryBtn ? activeCategoryBtn.getAttribute('data-filter') : 'all';
    
    cards.forEach(card => {
        const title = card.querySelector('.card-title').textContent.toLowerCase();
        const desc = card.querySelector('.card-desc').textContent.toLowerCase();
        
        const matchesSearch = title.includes(query) || desc.includes(query);
        const matchesCategory = (activeCategory === 'all' || card.getAttribute('data-category') === activeCategory);
        
        if (matchesSearch && matchesCategory) {
            card.style.display = 'flex';
        } else {
            card.style.display = 'none';
        }
    });
}

// Close search when clicking outside
document.addEventListener('click', function(event) {
    const header = document.getElementById('menu-header');
    if (header && header.classList.contains('search-active')) {
        // Cek apakah klik berada di luar header
        if (!header.contains(event.target)) {
            toggleSearch();
        }
    }
});
