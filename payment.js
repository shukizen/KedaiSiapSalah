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
    
    // Redirect to success page or show loading for QRIS
    if (selectedMethod === 'qris') {
        const loadingOverlay = document.getElementById('payment-loading');
        if (loadingOverlay) {
            loadingOverlay.style.display = 'flex';
        }
        
        const payBtn = document.querySelector('.pay-now-btn');
        if (payBtn) {
            payBtn.disabled = true;
            payBtn.style.opacity = '0.7';
            payBtn.innerHTML = 'Memproses...';
        }
        
        setTimeout(() => {
            if (loadingOverlay) {
                loadingOverlay.style.display = 'none';
            }
            showQrisModal(grandTotal);
        }, 1500); // 1.5 detik loading
    } else if (selectedMethod === 'cash') {
        const loadingOverlay = document.getElementById('payment-loading');
        if (loadingOverlay) {
            loadingOverlay.querySelector('.loading-text').textContent = 'Memproses Pesanan...';
            loadingOverlay.style.display = 'flex';
        }
        
        const payBtn = document.querySelector('.pay-now-btn');
        if (payBtn) {
            payBtn.disabled = true;
            payBtn.style.opacity = '0.7';
            payBtn.innerHTML = 'Memproses...';
        }
        
        setTimeout(() => {
            if (loadingOverlay) {
                loadingOverlay.style.display = 'none';
            }
            showCashModal(grandTotal, orderId);
        }, 1500);
    } else {
        window.location.href = 'success.html';
    }
}

function showQrisModal(total) {
    const qrisModal = document.getElementById('qris-modal');
    if (qrisModal) {
        document.getElementById('qris-total-val').textContent = formatPrice(total);
        qrisModal.style.display = 'flex';
        // Delay slight to allow display block to render before animation
        setTimeout(() => {
            qrisModal.classList.add('show');
        }, 10);
    }
}

function closeQrisModal() {
    const qrisModal = document.getElementById('qris-modal');
    if (qrisModal) {
        qrisModal.classList.remove('show');
        setTimeout(() => {
            qrisModal.style.display = 'none';
            
            // Reset pay button
            const payBtn = document.querySelector('.pay-now-btn');
            if (payBtn) {
                payBtn.disabled = false;
                payBtn.style.opacity = '1';
                payBtn.innerHTML = `
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                    Bayar Sekarang
                `;
            }
        }, 300); // Matches transition duration
    }
}

function markAsPaid() {
    const orderDataStr = localStorage.getItem('lastOrder');
    if (orderDataStr) {
        let order = JSON.parse(orderDataStr);
        order.status = 'diproses';
        localStorage.setItem('lastOrder', JSON.stringify(order));
    }
}

function simulateQrisSuccess() {
    markAsPaid();
    // Hide modal and go to success
    const qrisModal = document.getElementById('qris-modal');
    if (qrisModal) {
        qrisModal.classList.remove('show');
        setTimeout(() => {
            window.location.href = 'success.html';
        }, 300);
    } else {
        window.location.href = 'success.html';
    }
}

function showCashModal(total, orderId) {
    const cashModal = document.getElementById('cash-modal');
    if (cashModal) {
        document.getElementById('cash-total-val').textContent = formatPrice(total);
        if (orderId) {
            const orderIdEl = document.getElementById('cash-order-id');
            if (orderIdEl) orderIdEl.textContent = orderId;
        }
        cashModal.style.display = 'flex';
        // Delay slight to allow display block to render before animation
        setTimeout(() => {
            cashModal.classList.add('show');
        }, 10);
    }
}

function closeCashModal() {
    const cashModal = document.getElementById('cash-modal');
    if (cashModal) {
        cashModal.classList.remove('show');
        setTimeout(() => {
            cashModal.style.display = 'none';
            
            // Reset pay button
            const payBtn = document.querySelector('.pay-now-btn');
            if (payBtn) {
                payBtn.disabled = false;
                payBtn.style.opacity = '1';
                payBtn.innerHTML = `
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                    Bayar Sekarang
                `;
            }
        }, 300);
    }
}

function simulateCashSuccess() {
    markAsPaid();
    const cashModal = document.getElementById('cash-modal');
    if (cashModal) {
        cashModal.classList.remove('show');
        setTimeout(() => {
            window.location.href = 'success.html';
        }, 300);
    } else {
        window.location.href = 'success.html';
    }
}
