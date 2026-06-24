document.addEventListener('DOMContentLoaded', () => {
    loadOrderDetails();
});

function loadOrderDetails() {
    const orderDataStr = localStorage.getItem('lastOrder');
    if (!orderDataStr) {
        window.location.href = 'menu.html';
        return;
    }

    const order = JSON.parse(orderDataStr);
    
    // Set Order ID and Table
    document.getElementById('success-order-id').textContent = order.orderId;
    document.getElementById('success-table').textContent = order.table;
    
    // Render Items
    const itemsContainer = document.getElementById('success-items');
    let html = '';
    order.items.forEach(item => {
        html += `
            <div class="success-item">
                <div class="success-item-qty">${item.qty}x</div>
                <div class="success-item-info">
                    <div class="success-item-title">${item.title}</div>
                    <div class="success-item-note">Catatan: -</div>
                </div>
                <div class="success-item-price">Rp ${(item.price * item.qty).toLocaleString('id-ID').replace(/,/g, '.')}</div>
            </div>
        `;
    });
    itemsContainer.innerHTML = html;
    
    // Set Summary
    document.getElementById('success-items-count').textContent = `(${order.totalItems} menu)`;
    document.getElementById('success-subtotal').textContent = 'Rp ' + order.subtotal.toLocaleString('id-ID').replace(/,/g, '.');
    document.getElementById('success-tax').textContent = 'Rp ' + order.tax.toLocaleString('id-ID').replace(/,/g, '.');
    document.getElementById('success-total').textContent = 'Rp ' + order.grandTotal.toLocaleString('id-ID').replace(/,/g, '.');
    
    // Payment Method
    const methodNames = {
        'qris': 'Pembayaran via QRIS',
        'cash': 'Pembayaran Tunai'
    };
    document.getElementById('success-method-name').textContent = methodNames[order.paymentMethod] || 'Pembayaran Selesai';
}
