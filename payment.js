// payment.js

document.addEventListener('DOMContentLoaded', () => {
    loadPaymentTotals();
    setupPaymentMethods();
});

function loadPaymentTotals() {
    // Ambil data keranjang dari localStorage
    const cartItems = JSON.parse(localStorage.getItem('cartItems')) || [];
    
    let subtotal = 0;
    let totalItems = 0;
    
    cartItems.forEach(item => {
        subtotal += item.price * item.qty;
        totalItems += item.qty;
    });

    const tax = Math.round(subtotal * 0.11);
    const grandTotal = subtotal + tax;

    document.getElementById('summary-items').textContent = `(${totalItems} menu)`;
    document.getElementById('summary-subtotal').textContent = formatPrice(subtotal);
    document.getElementById('summary-tax').textContent = formatPrice(tax);
    document.getElementById('summary-total').textContent = formatPrice(grandTotal);
}

function formatPrice(price) {
    return 'Rp ' + price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

function setupPaymentMethods() {
    const radios = document.querySelectorAll('input[name="payment_method"]');
    const options = document.querySelectorAll('.method-option');

    radios.forEach(radio => {
        radio.addEventListener('change', function() {
            // Remove active class from all
            options.forEach(opt => opt.classList.remove('active'));
            
            // Add active class to checked parent
            if (this.checked) {
                this.closest('.method-option').classList.add('active');
            }
        });
    });
}

function processFinalPayment() {
    const name = document.getElementById('cust-name').value.trim();
    const phone = document.getElementById('cust-phone').value.trim();
    
    if (!name || !phone) {
        alert('Mohon lengkapi Nama Lengkap dan Nomor WhatsApp Anda.');
        return;
    }
    
    const cartItems = JSON.parse(localStorage.getItem('cartItems')) || [];
    if (cartItems.length === 0) {
        alert('Keranjang Anda kosong.');
        return;
    }

    let subtotal = 0;
    let totalItems = 0;
    cartItems.forEach(item => {
        subtotal += item.price * item.qty;
        totalItems += item.qty;
    });
    const tax = Math.round(subtotal * 0.11);
    const grandTotal = subtotal + tax;
    
    const selectedMethod = document.querySelector('input[name="payment_method"]:checked').value;
    const orderId = '#ORD-' + new Date().getFullYear() + '-' + Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    
    const orderData = {
        orderId: orderId,
        name: name,
        phone: phone,
        table: document.getElementById('cust-table').value,
        items: cartItems,
        subtotal: subtotal,
        tax: tax,
        grandTotal: grandTotal,
        totalItems: totalItems,
        paymentMethod: selectedMethod,
        date: new Date().toISOString()
    };
    
    localStorage.setItem('lastOrder', JSON.stringify(orderData));

    // Clear cart
    localStorage.removeItem('cartItems');
    localStorage.removeItem('cartCount');
    localStorage.removeItem('cartTotal');
    
    // Redirect to success page
    window.location.href = 'success.html';
}
