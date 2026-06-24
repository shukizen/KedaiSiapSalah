document.addEventListener('DOMContentLoaded', () => {
    renderCheckout();
});

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

function updateGlobalCartTotals() {
    let items = getCartItems();
    let count = 0;
    let total = 0;
    items.forEach(item => {
        count += item.qty;
        total += (item.price * item.qty);
    });
    localStorage.setItem('cartCount', count);
    localStorage.setItem('cartTotal', total);
}

function formatPrice(price) {
    return 'Rp ' + price.toLocaleString('id-ID').replace(/,/g, '.');
}

function updateCheckoutQty(index, change) {
    let items = getCartItems();
    if(items[index]) {
        items[index].qty += change;
        if(items[index].qty <= 0) {
            items.splice(index, 1);
        }
    }
    
    saveCartItems(items);
    updateGlobalCartTotals();
    renderCheckout();
}

function renderCheckout() {
    let items = getCartItems();
    const listContainer = document.getElementById('checkout-items');
    
    if (items.length === 0) {
        listContainer.innerHTML = '<div style="text-align:center; padding: 20px; color: #584237; font-family: Inter;">Keranjang kosong.</div>';
        document.getElementById('payment-subtotal').textContent = 'Rp 0';
        document.getElementById('payment-tax').textContent = 'Rp 0';
        document.getElementById('payment-total').textContent = 'Rp 0';
        document.getElementById('bottom-total').textContent = 'Rp 0';
        document.getElementById('payment-items-count').textContent = '(0 menu)';
        return;
    }

    let subtotal = 0;
    let totalItems = 0;
    let html = '';

    items.forEach((item, index) => {
        subtotal += (item.price * item.qty);
        totalItems += item.qty;
        
        let notesHtml = item.notes ? `<p class="item-desc" style="color: #A83200;">Catatan: ${item.notes}</p>` : `<p class="item-desc">${item.desc}</p>`;
        
        html += `
            <div class="checkout-item">
                <img src="${item.img}" alt="${item.title}">
                <div class="item-details">
                    <h3 class="item-title">${item.title}</h3>
                    ${notesHtml}
                    <div class="item-actions">
                        <div class="card-stepper" style="margin: 0;">
                            <button class="stepper-minus" onclick="updateCheckoutQty(${index}, -1)">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                            </button>
                            <span class="stepper-val">${item.qty}</span>
                            <button class="stepper-plus" onclick="updateCheckoutQty(${index}, 1)">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                            </button>
                        </div>
                        <span class="item-price">${formatPrice(item.price * item.qty)}</span>
                    </div>
                </div>
            </div>
        `;
    });

    listContainer.innerHTML = html;

    const tax = Math.round(subtotal * 0.11);
    const grandTotal = subtotal + tax;

    document.getElementById('payment-items-count').textContent = `(${totalItems} menu)`;
    document.getElementById('payment-subtotal').textContent = formatPrice(subtotal);
    document.getElementById('payment-tax').textContent = formatPrice(tax);
    document.getElementById('payment-total').textContent = formatPrice(grandTotal);
    document.getElementById('bottom-total').textContent = formatPrice(grandTotal);
}

function processPayment() {
    window.location.href = 'payment.html';
}
