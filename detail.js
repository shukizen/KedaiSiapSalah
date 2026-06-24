let currentItemPrice = 0;
let currentQty = 1;
let currentItemTitle = '';
let currentItemDesc = '';
let currentItemImg = '';

document.addEventListener('DOMContentLoaded', () => {
    // Mengambil parameter dari URL
    const params = new URLSearchParams(window.location.search);
    currentItemTitle = params.get('title') || '';
    currentItemDesc = params.get('desc') || '';
    const priceText = params.get('price');
    currentItemImg = params.get('img') || '';
    
    // Menampilkan data ke elemen HTML
    if (currentItemTitle) document.getElementById('modal-title').textContent = currentItemTitle;
    if (currentItemDesc) document.getElementById('modal-desc').textContent = currentItemDesc;
    if (priceText) {
        document.getElementById('modal-price').textContent = priceText;
        currentItemPrice = parseInt(priceText.replace(/[^0-9]/g, '')) || 0;
    }
    if (currentItemImg) document.getElementById('modal-img').src = currentItemImg;
    
    currentQty = 1;
    document.getElementById('modal-qty').textContent = currentQty;
    updateTotalDisplay();
});

function goBack() {
    window.location.href = 'menu.html';
}

function updateQty(change) {
    const newQty = currentQty + change;
    if (newQty >= 1) {
        currentQty = newQty;
        document.getElementById('modal-qty').textContent = currentQty;
        updateTotalDisplay();
    }
}

function updateTotalDisplay() {
    const total = currentItemPrice * currentQty;
    const formattedTotal = 'Rp ' + total.toLocaleString('id-ID').replace(/,/g, '.');
    document.getElementById('modal-total').textContent = formattedTotal;
}

function confirmAddToCart() {
    let notes = document.getElementById('modal-notes').value.trim();
    
    // Menggunakan localStorage agar jumlah keranjang bertahan meskipun pindah halaman
    let cartCount = parseInt(localStorage.getItem('cartCount')) || 0;
    cartCount += currentQty;
    localStorage.setItem('cartCount', cartCount);
    
    let cartTotal = parseInt(localStorage.getItem('cartTotal')) || 0;
    cartTotal += (currentItemPrice * currentQty);
    localStorage.setItem('cartTotal', cartTotal);
    
    // Simpan ke array cartItems
    let cartItems = [];
    try {
        cartItems = JSON.parse(localStorage.getItem('cartItems')) || [];
    } catch(e) {}
    
    let existing = cartItems.find(i => i.title === currentItemTitle && (i.notes || '') === notes);
    if(existing) {
        existing.qty += currentQty;
    } else {
        cartItems.push({ 
            title: currentItemTitle, 
            desc: currentItemDesc, 
            price: currentItemPrice, 
            img: currentItemImg, 
            qty: currentQty,
            notes: notes
        });
    }
    localStorage.setItem('cartItems', JSON.stringify(cartItems));
    
    // Langsung kembali ke halaman menu
    goBack();
}
