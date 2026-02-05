/* add-to-cart.js */

// Global Cart State
let cart = {};

// Helper to format currency
const formatPrice = (price) => `₹${price}`;

// --- Initialization ---

document.addEventListener('DOMContentLoaded', () => {
    renderMenu();
    updateAuthLink();
});

function filterProducts() {
    const input = document.getElementById('product-search');
    const filter = input.value.toUpperCase();
    const cards = document.querySelectorAll('.product-card');
    const headers = document.querySelectorAll('.category-header');
    const sections = document.querySelectorAll('.menu-category');

    // 1. Toggle Headers
    if (filter) {
        headers.forEach(h => h.style.display = 'none');
    } else {
        headers.forEach(h => h.style.display = '');
    }

    // 2. Filter Cards & Hide Empty Sections
    sections.forEach(section => {
        let hasVisibleProduct = false;
        const sectionCards = section.querySelectorAll('.product-card');

        sectionCards.forEach(card => {
            const title = card.querySelector('.card-title');
            if (title) {
                const txtValue = title.textContent || title.innerText;
                if (txtValue.toUpperCase().indexOf(filter) > -1) {
                    card.style.display = "";
                    hasVisibleProduct = true;
                } else {
                    card.style.display = "none";
                }
            }
        });

        // Optional: Hide entire section if no products match in it (avoids empty spacing)
        if (filter && !hasVisibleProduct) {
            section.style.display = 'none';
        } else {
            section.style.display = '';
        }
    });
}

function updateAuthLink() {
    const user = window.RathnaApp.getUserSession();
    const link = document.getElementById('auth-link');
    const headerNav = document.querySelector('.top-nav');

    if (link && user) {
        link.innerText = `Hi, ${user.name.split(' ')[0]}`;
        link.href = 'profile.html';

        // MAGIC: Show Admin Link if it's the Admin User
        if (user.phone === '8121178242') {
            // Check if link already exists to avoid duplicates
            if (!document.getElementById('admin-header-link')) {
                const adminLink = document.createElement('a');
                adminLink.id = 'admin-header-link';
                adminLink.href = 'admin.html';
                adminLink.innerText = 'Admin Portal';
                adminLink.style.cssText = 'color:#ff9100; text-decoration:none; font-weight:800; margin-right:15px; background:rgba(0,0,0,0.5); padding:8px 16px; border-radius:20px;';
                headerNav.insertBefore(adminLink, link);
            }

            // Show Sidebar Admin Link
            const sidebarAdminLink = document.getElementById('sidebar-admin-link');
            if (sidebarAdminLink) {
                sidebarAdminLink.style.display = 'block';
            }
        }
    }
}

function renderMenu() {
    const inventory = window.RathnaApp.getInventory();

    // Clear containers
    document.getElementById('hot-items-container').innerHTML = '';
    document.getElementById('laddus-container').innerHTML = '';
    document.getElementById('chikki-java-container').innerHTML = '';

    inventory.forEach(item => {
        const containerId = `${item.category}-container`;
        const container = document.getElementById(containerId);

        if (container) {
            container.appendChild(createMenuItemElement(item));
        }
    });
}

function createMenuItemElement(item) {
    const div = document.createElement('div');
    div.className = 'product-card';
    if (item.stock <= 0) {
        div.classList.add('out-of-stock');
    }

    // Stock Badge Logic
    let stockBadge = '';
    let btnDisabled = '';
    let btnText = 'Add to Cart +';

    if (item.stock <= 0) {
        stockBadge = `<span class="stock-badge out">Out of Stock</span>`;
        btnDisabled = 'disabled';
        btnText = 'Sold Out';
    } else if (item.stock < 5) {
        stockBadge = `<span class="stock-badge low">Only ${item.stock} left!</span>`;
    }

    // Generate image or placeholder icon
    let imageContent;
    if (item.image) {
        imageContent = `<img src="${item.image}" alt="${item.name}">`;
    } else {
        let icon = '🥡';
        if (item.category === 'laddus') icon = '🟢';
        if (item.category === 'chikki-java') icon = '☕';
        imageContent = icon;
    }

    div.innerHTML = `
        ${stockBadge}
        <div class="card-img-placeholder">${imageContent}</div>
        <div class="card-content">
            <h3 class="card-title">${item.name}</h3>
            <div class="card-meta">
                <span>${item.qty}</span>
            </div>
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1rem;">
                <span class="card-price">${formatPrice(item.price)}</span>
            </div>
            
            <div class="card-actions">
                <button class="add-btn" onclick="addToCart('${item.id}', this)" ${btnDisabled}>
                    ${btnText}
                </button>
            </div>
        </div>
    `;
    return div;
}

// --- Cart Logic ---

function addToCart(itemId) {
    const inventory = window.RathnaApp.getInventory();
    const item = inventory.find(i => i.id === itemId);

    if (!item) return;

    if (item.stockStatus === 'out') {
        window.RathnaApp.showToast(`${item.name} is currently Out of Stock`, 'error');
        return;
    }

    if (!cart[itemId]) {
        cart[itemId] = { ...item, quantity: 1 };
    } else {
        cart[itemId].quantity++;
    }

    updateCartIcon();

    // Refresh modal if open
    const modal = document.getElementById('cart-modal');
    if (modal && (modal.style.display === 'flex' || modal.classList.contains('open'))) {
        renderCartItems();
    }

    window.RathnaApp.showToast(`${item.name} added to cart!`, 'success');
}

function removeFromCart(itemId) {
    if (cart[itemId]) {
        cart[itemId].quantity--;
        if (cart[itemId].quantity <= 0) {
            delete cart[itemId];
            window.RathnaApp.showToast("Item removed from cart", 'info');
        }
    }
    updateCartIcon();
    renderCartItems(); // Re-render modal if open
}

function updateCartIcon() {
    const count = Object.values(cart).reduce((sum, item) => sum + item.quantity, 0);
    document.getElementById('cart-count').innerText = count;
}

function toggleCart() {
    const modal = document.getElementById('cart-modal');
    if (modal.style.display === 'flex' || modal.classList.contains('open')) {
        modal.classList.remove('open');
        setTimeout(() => {
            modal.style.display = 'none';
        }, 300); // Match CSS transition time
        document.body.style.overflow = '';
    } else {
        renderCartItems();
        modal.style.display = 'flex';
        // Trigger reflow to enable transition
        void modal.offsetWidth;
        modal.classList.add('open');
        document.body.style.overflow = 'hidden';
    }
}

function renderCartItems() {
    const container = document.getElementById('cart-items');
    const totalEl = document.getElementById('cart-total-price');
    const settings = window.RathnaApp.getSettings();

    if (Object.keys(cart).length === 0) {
        container.innerHTML = '<p class="empty-cart-msg">Your cart is empty.</p>';
        totalEl.innerText = '₹0';
        return;
    }

    let subtotal = 0;
    let html = '';

    Object.values(cart).forEach(item => {
        const itemTotal = item.price * item.quantity;
        subtotal += itemTotal;
        html += `
        <div class="cart-item-row">
            <div class="cart-item-name">
                ${item.name} 
                <div style="font-size:0.8em; opacity:0.7">${item.qty}</div>
            </div>
            <div class="cart-item-controls">
                <button class="qty-btn" onclick="removeFromCart('${item.id}')">-</button>
                <span>${item.quantity}</span>
                <button class="qty-btn" onclick="addToCart('${item.id}')">+</button>
            </div>
            <div class="cart-item-price">${formatPrice(itemTotal)}</div>
        </div>
    `;
    });

    // Delivery Logic
    let deliveryCharge = 0;
    if (subtotal < settings.freeDeliveryThreshold) {
        deliveryCharge = settings.deliveryCharge;
    }

    const grandTotal = subtotal + deliveryCharge;

    // Add Totals Summary
    html += `
    <div style="margin-top:1rem; padding-top:1rem; border-top:1px dashed var(--glass-border);">
        <div style="display:flex; justify-content:space-between; margin-bottom:5px; color:var(--text-muted);">
            <span>Subtotal</span>
            <span>${formatPrice(subtotal)}</span>
        </div>
        <div style="display:flex; justify-content:space-between; margin-bottom:5px; color:${deliveryCharge === 0 ? 'var(--primary-green)' : 'var(--text-muted)'};">
            <span>Delivery Charge</span>
            <span>${deliveryCharge === 0 ? 'FREE' : formatPrice(deliveryCharge)}</span>
        </div>
        ${deliveryCharge > 0 ? `<div style="text-align:right; font-size:0.8rem; color:var(--text-muted);">Free delivery above ${formatPrice(settings.freeDeliveryThreshold)}</div>` : ''}
    </div>
`;

    container.innerHTML = html;
    totalEl.innerText = formatPrice(grandTotal);
}

// --- Checkout Logic ---

// Helper to read file as Base64
function readFileAsBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = error => reject(error);
        reader.readAsDataURL(file);
    });
}

// --- Checkout Logic ---

async function checkout() {
    const name = document.getElementById('cust-name').value.trim();
    const phone = document.getElementById('cust-phone').value.trim();
    const address = document.getElementById('cust-address').value.trim();
    const paymentMode = document.querySelector('input[name="payment"]:checked').value;

    if (Object.keys(cart).length === 0) {
        window.RathnaApp.showToast("Your cart is empty!", 'error');
        return;
    }

    if (!name || !phone || !address) {
        window.RathnaApp.showToast("Please fill in your Name, Phone, and Address.", 'error');
        return;
    }

    // 0. Online Payment Validation
    let paymentScreenshot = null;
    if (paymentMode === 'online-upi') {
        const fileInput = document.getElementById('payment-screenshot');
        if (fileInput.files.length === 0) {
            window.RathnaApp.showToast("Please upload the Payment Screenshot.", 'error');
            return;
        }
        try {
            paymentScreenshot = await readFileAsBase64(fileInput.files[0]);
        } catch (e) {
            console.error("File Read Error", e);
            window.RathnaApp.showToast("Error reading screenshot file.", 'error');
            return;
        }
    }

    // 1. Stock Check
    const inventory = window.RathnaApp.getInventory();
    let stockIssue = false;
    for (const [id, item] of Object.entries(cart)) {
        const product = inventory.find(p => p.id === id);
        if (!product || product.stockStatus === 'out') {
            window.RathnaApp.showToast(`Sorry, ${item.name} is out of stock.`, 'error');
            stockIssue = true;
        }
    }
    if (stockIssue) return;


    // 3. Create Order
    let subtotal = 0;
    Object.values(cart).forEach(item => subtotal += item.price * item.quantity);

    const settings = window.RathnaApp.getSettings();
    let deliveryCharge = 0;
    if (subtotal < settings.freeDeliveryThreshold) {
        deliveryCharge = settings.deliveryCharge;
    }
    const total = subtotal + deliveryCharge;

    const orderData = {
        customer: { name, phone, address },
        items: cart,
        breakdown: { subtotal, deliveryCharge, total },
        total: total,
        payment: paymentMode,
        paymentScreenshot: paymentScreenshot, // Add image data
        status: 'pending' // Default status
    };

    // CAPTURE RETURN VALUE
    const newOrder = window.RathnaApp.placeOrder(orderData);


    // --- NOTIFICATIONS ---

    // 1. Prepare Order Text
    let itemsText = '';
    Object.values(cart).forEach(i => itemsText += `${i.quantity} x ${i.name} (₹${i.price})\n`);

    const message = `
*NEW ORDER #${newOrder.id}*
------------------
*Customer:* ${name}
*Phone:* ${phone}
*Address:* ${address}
------------------
*Items:*
${itemsText}
------------------
*Total: ₹${total}*
*Payment:* ${paymentMode}
`.trim();

    // 2. WhatsApp Notification (Immediate)
    if (settings.ownerPhone) {
        const waUrl = `https://wa.me/${settings.ownerPhone}?text=${encodeURIComponent(message)}`;
        window.open(waUrl, '_blank');
    }

    // 3. Email Notification (via EmailJS)
    if (settings.emailJsPublicKey && settings.emailJsServiceId && settings.emailJsTemplateId) {
        emailjs.init(settings.emailJsPublicKey);

        const emailParams = {
            order_id: newOrder.id,
            to_name: "Rathna Foods Owner",
            customer_name: name,
            customer_phone: phone,
            customer_address: address,
            message_body: itemsText.replace(/\n/g, '<br>'), // HTML break for email
            total_amount: total,
            payment_method: paymentMode,
            owner_email: settings.ownerEmail
        };

        // If screenshot exists, we might ideally upload it to a cloud and send a link.
        // But Free EmailJS doesn't support attachments easily without paid tier or complex base64 config.
        // We will just mention it in the email text for now to check Admin Portal.
        if (paymentScreenshot) {
            emailParams.message_body += "<br><br><b>Note: Payment Screenshot attached in Admin Portal.</b>";
        }

        emailjs.send(settings.emailJsServiceId, settings.emailJsTemplateId, emailParams).then(
            (response) => {
                console.log('SUCCESS!', response.status, response.text);
            },
            (error) => {
                console.log('FAILED...', error);
                window.RathnaApp.showToast("Order placed, but email failed.", 'info');
            }
        );
    }


    // 4. Show Success Message
    window.RathnaApp.showToast(`Order Placed Successfully! (${formatPrice(total)})`, 'success');

    // Clear cart and UI
    cart = {};
    updateCartIcon();
    toggleCart();
    renderMenu(); // Update UI

    // Clear input
    const fileInput = document.getElementById('payment-screenshot');
    if (fileInput) fileInput.value = '';

    // Redirect to profile to see order if user is logged in
    if (window.RathnaApp.getUserSession()) {
        setTimeout(() => {
            // We can use a custom modal for this later, but for now confirm is okay or just auto redirect
            // Using confirm might be annoying if they just want to stay. 
            // Let's just notify them to check profile.
            window.RathnaApp.showToast("Check your Profile for Order Status", 'info');
        }, 2000);
    }
}
