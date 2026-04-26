// Sample Product Data
const products = [
    { id: 1, sku: 'PRO-APL-01', name: 'Organic Red Apples', price: 1.50, category: 'produce', img: 'apples.png' },
    { id: 2, sku: 'PRO-BNN-02', name: 'Premium Bananas', price: 0.90, category: 'produce', img: 'apples.png' }, // Fallback to apples
    { id: 3, sku: 'DAI-MLK-01', name: 'Whole Milk (1L)', price: 2.20, category: 'dairy', img: 'apples.png' },
    { id: 4, sku: 'BAK-BRD-01', name: 'Artisan Sourdough', price: 4.50, category: 'bakery', img: 'bread.png' },
    { id: 5, sku: 'PAN-OUL-01', name: 'Extra Virgin Olive Oil', price: 12.00, category: 'pantry', img: 'bread.png' },
    { id: 6, sku: 'PRO-AVO-03', name: 'Hass Avocado', price: 1.80, category: 'produce', img: 'apples.png' },
    { id: 7, sku: 'DAI-YGT-02', name: 'Greek Yogurt', price: 3.50, category: 'dairy', img: 'apples.png' },
    { id: 8, sku: 'BAK-CRN-02', name: 'Butter Croissant', price: 2.10, category: 'bakery', img: 'bread.png' }
];

// POS State
let currentCart = [];
let activeSite = localStorage.getItem('activeSite') || 'central';

// Initialize Site Data (Mock Inventory per site)
function getSiteInventory(site) {
    const key = `inventory_${site}`;
    let data = JSON.parse(localStorage.getItem(key));
    if (!data) {
        // Init with random stocks
        data = products.map(p => ({ ...p, stock: Math.floor(Math.random() * 50) + 10 }));
        localStorage.setItem(key, JSON.stringify(data));
    }
    return data;
}

document.addEventListener('DOMContentLoaded', () => {
    const siteSelect = document.getElementById('site-select');
    const productList = document.getElementById('product-list');
    const cartList = document.getElementById('cart-items');
    const subtotalEl = document.getElementById('subtotal');
    const taxEl = document.getElementById('tax');
    const totalEl = document.getElementById('total');
    const checkoutBtn = document.getElementById('checkout-btn');

    // Set initial site
    siteSelect.value = activeSite;

    // View Switching
    document.querySelectorAll('.nav-item').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.nav-item').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            const viewId = btn.dataset.view;
            document.querySelectorAll('.pos-content > div').forEach(v => v.classList.remove('active-view'));
            document.getElementById(`${viewId}-view`).classList.add('active-view');

            if (viewId === 'inventory') renderInventory();
        });
    });

    // Site Switching
    siteSelect.addEventListener('change', (e) => {
        activeSite = e.target.value;
        localStorage.setItem('activeSite', activeSite);
        renderProducts();
        currentCart = [];
        updateCartUI();
    });

    function renderProducts() {
        const query = document.getElementById('product-search').value.toLowerCase();
        const activeTab = document.querySelector('.tab.active').dataset.cat;

        productList.innerHTML = '';
        products.filter(p => {
            const matchesSearch = p.name.toLowerCase().includes(query) || p.sku.toLowerCase().includes(query);
            const matchesCat = activeTab === 'all' || p.category === activeTab;
            return matchesSearch && matchesCat;
        }).forEach(p => {
            const div = document.createElement('div');
            div.className = 'product-item';
            div.innerHTML = `
                <img src="assets/${p.img}" alt="${p.name}" onerror="this.src='https://via.placeholder.com/80?text=Product'">
                <div>${p.name}</div>
                <div class="price">$${p.price.toFixed(2)}</div>
            `;
            div.onclick = () => addToCart(p);
            productList.appendChild(div);
        });
    }

    function addToCart(product) {
        const existing = currentCart.find(item => item.id === product.id);
        if (existing) {
            existing.qty++;
        } else {
            currentCart.push({ ...product, qty: 1 });
        }
        updateCartUI();
    }

    function updateCartUI() {
        if (currentCart.length === 0) {
            cartList.innerHTML = '<div class="empty-cart">No items in cart</div>';
        } else {
            cartList.innerHTML = currentCart.map(item => `
                <div class="cart-item">
                    <span>${item.name} x${item.qty}</span>
                    <span>$${(item.price * item.qty).toFixed(2)}</span>
                </div>
            `).join('');
        }

        const subtotal = currentCart.reduce((acc, item) => acc + (item.price * item.qty), 0);
        const tax = subtotal * 0.08;
        const total = subtotal + tax;

        subtotalEl.innerText = `$${subtotal.toFixed(2)}`;
        taxEl.innerText = `$${tax.toFixed(2)}`;
        totalEl.innerText = `$${total.toFixed(2)}`;
    }

    function renderInventory() {
        const inventory = getSiteInventory(activeSite);
        const body = document.getElementById('inventory-body');
        body.innerHTML = inventory.map(p => `
            <tr>
                <td>${p.sku}</td>
                <td>${p.name}</td>
                <td>${p.stock} units</td>
                <td>$${p.price.toFixed(2)}</td>
                <td><button class="tab" onclick="alert('Stock management coming soon')">Edit</button></td>
            </tr>
        `).join('');
    }

    checkoutBtn.onclick = () => {
        if (currentCart.length === 0) return alert('Cart is empty!');

        // Update Inventory (simulation)
        const inventory = getSiteInventory(activeSite);
        currentCart.forEach(item => {
            const product = inventory.find(p => p.id === item.id);
            if (product) product.stock -= item.qty;
        });
        localStorage.setItem(`inventory_${activeSite}`, JSON.stringify(inventory));

        alert(`Sale completed for ${activeSite.toUpperCase()} site! Total: ${totalEl.innerText}`);
        currentCart = [];
        updateCartUI();
    };

    // Category filtering
    document.querySelectorAll('.tab').forEach(tab => {
        tab.onclick = () => {
            document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            renderProducts();
        };
    });

    document.getElementById('product-search').oninput = renderProducts;

    renderProducts();
});
