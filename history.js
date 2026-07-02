document.addEventListener('DOMContentLoaded', () => {
    // Render the dynamic order first
    renderPendingOrder();

    const tabs = document.querySelectorAll('.history-tab');

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            // Remove active class from all tabs
            tabs.forEach(t => t.classList.remove('active'));
            // Add active class to clicked tab
            tab.classList.add('active');

            const filter = tab.getAttribute('data-filter');

            // Re-select all cards dynamically inside the click handler
            // so we don't miss any newly rendered cards
            const currentCards = document.querySelectorAll('.history-card');
            
            currentCards.forEach(card => {
                if (filter === 'semua' || card.getAttribute('data-status') === filter) {
                    card.style.display = 'flex';
                } else {
                    card.style.display = 'none';
                }
            });
        });
    });
});

function renderPendingOrder() {
    const orderDataStr = localStorage.getItem('lastOrder');
    if (!orderDataStr) return; // If session removed, card won't show
    
    try {
        const order = JSON.parse(orderDataStr);
        const historyList = document.getElementById('history-list');
        
        const formattedTotal = 'Rp ' + order.grandTotal.toLocaleString('id-ID').replace(/,/g, '.');
        const itemCount = order.totalItems;
        const methodText = order.paymentMethod === 'qris' ? '(QRIS)' : '(Tunai)';
        const titleText = order.items && order.items.length > 0 ? order.items[0].title : 'Pesanan';
        
        // Buat format waktu
        const orderDate = new Date(order.date);
        const timeStr = orderDate.toLocaleTimeString('id-ID', {hour: '2-digit', minute:'2-digit'});
        
        const status = order.status || 'belum-bayar';
        
        let badgeHtml = '';
        let buttonHtml = '';
        
        if (status === 'belum-bayar') {
            badgeHtml = `<div class="hc-badge menunggu">BELUM BAYAR</div>`;
            buttonHtml = `<button class="hc-action-btn btn-pesan-lagi" style="background:#E65100; color:white; border:none;" onclick="openHistoryQrisModal('${formattedTotal}', '${order.orderId}')">Bayar Sekarang</button>`;
        } else if (status === 'diproses') {
            badgeHtml = `<div class="hc-badge diproses">DIPROSES</div>`;
            buttonHtml = `<button class="hc-action-btn btn-lihat-detail" onclick="window.location.href='success.html'">Lihat Detail</button>`;
        } else if (status === 'selesai') {
            badgeHtml = `<div class="hc-badge selesai">SELESAI</div>`;
            buttonHtml = `<button class="hc-action-btn btn-pesan-lagi" onclick="window.location.href='menu.html'">Pesan Lagi</button>`;
        } else {
            return; // Fallback
        }
        
        const cardHtml = `
            <div class="history-card" data-status="${status}">
                <div class="history-card-header">
                    <div class="hc-date-id">
                        <span class="hc-date">Hari Ini, ${timeStr}</span>
                        <span class="hc-id">${order.orderId}</span>
                    </div>
                    ${badgeHtml}
                </div>
                <div class="history-card-body">
                    <div class="hc-item-name">${titleText}</div>
                    <div class="hc-item-desc">${itemCount} item dipesan ${methodText}</div>
                </div>
                <div class="history-card-footer">
                    <div class="hc-total-box">
                        <span class="hc-total-label">Total Harga</span>
                        <span class="hc-total-val">${formattedTotal}</span>
                    </div>
                    ${buttonHtml}
                </div>
            </div>
        `;
        
        historyList.insertAdjacentHTML('afterbegin', cardHtml);
        
    } catch (e) {
        console.error('Error parsing pending order', e);
    }
}

function openHistoryQrisModal(total, orderId) {
    const modal = document.getElementById('history-qris-modal');
    if (modal) {
        document.getElementById('history-qris-total').textContent = total;
        document.getElementById('history-qris-image').src = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${orderId}-PAYMENT`;
        
        modal.style.display = 'flex';
        setTimeout(() => {
            modal.classList.add('show');
        }, 10);
    }
}

function closeHistoryQrisModal() {
    const modal = document.getElementById('history-qris-modal');
    if (modal) {
        modal.classList.remove('show');
        setTimeout(() => {
            modal.style.display = 'none';
        }, 300);
    }
}

function simulateHistoryQrisSuccess() {
    // Mark as paid
    const orderDataStr = localStorage.getItem('lastOrder');
    if (orderDataStr) {
        let order = JSON.parse(orderDataStr);
        order.status = 'diproses';
        localStorage.setItem('lastOrder', JSON.stringify(order));
    }
    
    // Hide modal and go to success
    const modal = document.getElementById('history-qris-modal');
    if (modal) {
        modal.classList.remove('show');
        setTimeout(() => {
            window.location.href = 'success.html';
        }, 300);
    } else {
        window.location.href = 'success.html';
    }
}
