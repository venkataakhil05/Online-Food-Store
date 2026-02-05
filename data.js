/* data.js - Central Data Management for Rathna Home Foods */

const INITIAL_INVENTORY = [
    // Hot Items
    { id: 'h1', category: 'hot-items', name: 'Ragi Murukulu', qty: '100g', price: 50, stock: 20, image: './images/ragi-murukulu.png' },
    { id: 'h2', category: 'hot-items', name: 'Ragi Pabbilla', qty: '100g', price: 50, stock: 20, image: './images/ragi-pabbilla.png' },
    { id: 'h3', category: 'hot-items', name: 'Jonna Murukulu', qty: '100g', price: 50, stock: 20, image: './images/jonna-murukulu.png' },
    { id: 'h4', category: 'hot-items', name: 'Jonna Pabbilla', qty: '100g', price: 50, stock: 20, image: './images/jonna-pabbilla.png' },
    { id: 'h5', category: 'hot-items', name: 'Korra Murukulu', qty: '100g', price: 50, stock: 20, image: './images/korra-murukulu.png' },
    { id: 'h6', category: 'hot-items', name: 'Arike Murukulu', qty: '100g', price: 50, stock: 20, image: './images/arike-murukulu.png' },
    { id: 'h7', category: 'hot-items', name: 'Udala Murukulu', qty: '100g', price: 50, stock: 20, image: './images/udala-murukulu.png' },
    { id: 'h8', category: 'hot-items', name: 'Millet Mixture', qty: '100g', price: 50, stock: 20, image: './images/millet-mixture.jpg' },
    { id: 'h9', category: 'hot-items', name: 'Jonna Karas', qty: '100g', price: 50, stock: 20, image: './images/jonna-karas.png' },
    { id: 'h10', category: 'hot-items', name: 'Ragi Karas', qty: '100g', price: 50, stock: 20, image: './images/ragi-karas.jpg' },

    // Laddus
    { id: 'l1', category: 'laddus', name: 'Ragi Minapappu Laddu', qty: '150g', price: 100, stock: 15, image: './images/ragi-minapappu-laddu.png' },
    { id: 'l2', category: 'laddus', name: 'Jonna Nuvvulu Laddu', qty: '150g', price: 120, stock: 15, image: './images/jonna-nuvvulu-laddu.png' },
    { id: 'l3', category: 'laddus', name: 'Jonna Pelalu Laddu', qty: '150g', price: 110, stock: 15 },
    { id: 'l4', category: 'laddus', name: 'Sajja Senagapindi Laddu', qty: '150g', price: 110, stock: 15, image: './images/sajja-senagapindi-laddu.png' },
    { id: 'l5', category: 'laddus', name: 'Korra Flaxseeds Laddu', qty: '150g', price: 120, stock: 15 },
    { id: 'l6', category: 'laddus', name: 'Multi Millet Minapappu Laddu', qty: '150g', price: 100, stock: 15 },
    { id: 'l7', category: 'laddus', name: 'All In One Laddu', qty: '150g', price: 120, stock: 15 },
    { id: 'l8', category: 'laddus', name: 'Extra Ghee', qty: '-', price: 10, stock: 100 },

    // Chikki and Java
    { id: 'c1', category: 'chikki-java', name: 'Ragi Palli Chikki', qty: '150g', price: 85, stock: 20 },
    { id: 'c2', category: 'chikki-java', name: 'Jonna Palli Chikki', qty: '150g', price: 85, stock: 20 },
    { id: 'c3', category: 'chikki-java', name: 'Multi Millet Java Powder', qty: '500g', price: 100, stock: 10 },
    { id: 'c4', category: 'chikki-java', name: 'Multi Millet Dosa Chapathi Powder', qty: '500g', price: 100, stock: 10 },
];

const DB_KEYS = {
    INVENTORY: 'rathna_inventory',
    ORDERS: 'rathna_orders',
    USERS: 'rathna_users',
    SESSION: 'rathna_session',
    SETTINGS: 'rathna_settings'
};

// --- Settings Management ---

function getSettings() {
    const stored = localStorage.getItem(DB_KEYS.SETTINGS);
    if (!stored) {
        // Default Settings
        const defaults = {
            freeDeliveryThreshold: 500,
            deliveryCharge: 50,
            ownerPhone: '8121178242', // Default Owner Phone
            ownerEmail: 'rathnahomefoods@gmail.com',
            emailJsServiceId: '',
            emailJsTemplateId: '',
            emailJsPublicKey: ''
        };
        localStorage.setItem(DB_KEYS.SETTINGS, JSON.stringify(defaults));
        return defaults;
    }
    return JSON.parse(stored);
}

function updateSettings(newSettings) {
    const current = getSettings();
    const updated = { ...current, ...newSettings };
    localStorage.setItem(DB_KEYS.SETTINGS, JSON.stringify(updated));
    return true;
}

// --- UI Helpers (Toasts) ---

function showToast(message, type = 'success') {
    // 1. Create Container if not exists
    let container = document.querySelector('.toast-container');
    if (!container) {
        container = document.createElement('div');
        container.className = 'toast-container';
        document.body.appendChild(container);
    }

    // 2. Create Toast Element
    const toast = document.createElement('div');
    toast.className = `toast-notification ${type}`;

    // Icons based on type
    let icon = '✅';
    if (type === 'error') icon = '❌';
    if (type === 'info') icon = 'ℹ️';

    toast.innerHTML = `
        <div style="display:flex; align-items:center; gap:10px;">
            <span style="font-size:1.2rem;">${icon}</span>
            <div class="toast-message">${message}</div>
        </div>
        <button class="toast-close" onclick="this.parentElement.remove()">×</button>
    `;

    // 3. Add to Container
    container.appendChild(toast);

    // 4. Auto Remove
    setTimeout(() => {
        toast.style.animation = 'fadeOutToast 0.4s forwards';
        toast.addEventListener('animationend', () => {
            if (toast.parentElement) toast.remove();
        });
    }, 4000);
}

// --- Inventory Management ---

function getInventory() {
    const stored = localStorage.getItem(DB_KEYS.INVENTORY);
    if (!stored) {
        localStorage.setItem(DB_KEYS.INVENTORY, JSON.stringify(INITIAL_INVENTORY));
        return INITIAL_INVENTORY;
    }

    // SYNC LOGIC: Merge Code Updates (Images/Names) with Stored Data (Stock)
    const storedInventory = JSON.parse(stored);

    // We want to keep the 'stock' from storage, but update static details (image, price, name) from code
    const syncedInventory = storedInventory.map(storedItem => {
        // Find corresponding item in code
        const codeItem = INITIAL_INVENTORY.find(i => i.id === storedItem.id);

        if (codeItem) {
            // Merge: Start with Code Defaults, then OVERRIDE with Stored Data
            // This ensures missing fields (like new 'image') are added, 
            // but user edits (like changed 'price' or 'name') are preserved.
            return {
                ...codeItem,
                ...storedItem,
                image: codeItem.image // Fix: Always use the code's image path to recover from broken cache
            };
        }
        return storedItem; // It's a custom added item (Admin), keep as is
    });

    // Also check for NEW items in code that are missing in storage
    INITIAL_INVENTORY.forEach(codeItem => {
        const exists = syncedInventory.find(i => i.id === codeItem.id);
        if (!exists) {
            syncedInventory.push(codeItem);
        }
    });

    // Update Storage with Synced Data (Optimization: Only if changes needed? For now, always safe to ensure consistency)
    localStorage.setItem(DB_KEYS.INVENTORY, JSON.stringify(syncedInventory));

    return syncedInventory;
}

function updateItemStock(itemId, newStock) {
    return updateItem(itemId, { stock: parseInt(newStock) });
}

function updateItem(itemId, fieldsToUpdate) {
    const inventory = getInventory();
    const itemIndex = inventory.findIndex(item => item.id === itemId);
    if (itemIndex > -1) {
        inventory[itemIndex] = { ...inventory[itemIndex], ...fieldsToUpdate };
        localStorage.setItem(DB_KEYS.INVENTORY, JSON.stringify(inventory));
        return true;
    }
    return false;
}



function deleteItem(itemId) {
    const inventory = getInventory();
    const newInventory = inventory.filter(item => item.id !== itemId);
    if (newInventory.length !== inventory.length) {
        localStorage.setItem(DB_KEYS.INVENTORY, JSON.stringify(newInventory));
        return true;
    }
    return false;
}

function addNewItem(itemData) {
    const inventory = getInventory();
    // Generate simple ID
    const newId = 'new-' + Date.now();
    const newItem = { id: newId, stock: 0, ...itemData };
    inventory.push(newItem);
    localStorage.setItem(DB_KEYS.INVENTORY, JSON.stringify(inventory));
    return newItem;
}

// --- Order Management ---

function getOrders() {
    const stored = localStorage.getItem(DB_KEYS.ORDERS);
    return stored ? JSON.parse(stored) : [];
}

function placeOrder(orderDetails) {
    const orders = getOrders();
    const newOrder = {
        id: 'ORD-' + Date.now().toString().slice(-6),
        status: 'pending', // pending, confirmed, rejected
        timestamp: new Date().toISOString(),
        userId: getUserSession() ? getUserSession().phone : 'guest',
        ...orderDetails
    };
    orders.unshift(newOrder); // Add to top
    localStorage.setItem(DB_KEYS.ORDERS, JSON.stringify(orders));
    return newOrder;
}

function updateOrderStatus(orderId, status) {
    const orders = getOrders();
    const order = orders.find(o => o.id === orderId);
    if (order) {
        order.status = status;
        localStorage.setItem(DB_KEYS.ORDERS, JSON.stringify(orders));
        return true;
    }
    return false;
}

function getUserOrders(phone) {
    const orders = getOrders();
    return orders.filter(o => o.customer.phone === phone);
}

function deleteOrder(orderId) {
    const orders = getOrders();
    const newOrders = orders.filter(o => o.id !== orderId);
    if (newOrders.length !== orders.length) {
        localStorage.setItem(DB_KEYS.ORDERS, JSON.stringify(newOrders));
        return true;
    }
    return false;
}

// --- User Authorization ---

const ADMIN_USER = {
    name: 'Rathna Admin',
    phone: '8121178242',
    address: 'Rathna Home Foods HQ',
    password: 'admin123'
};

function getUsers() {
    const stored = localStorage.getItem(DB_KEYS.USERS);
    if (!stored) {
        // Initialize with Admin User
        const initialUsers = [ADMIN_USER];
        localStorage.setItem(DB_KEYS.USERS, JSON.stringify(initialUsers));
        return initialUsers;
    }
    return JSON.parse(stored);
}

function registerUser(userData) {
    const users = getUsers();
    if (users.find(u => u.phone === userData.phone)) {
        return { success: false, message: 'User already exists with this phone number.' };
    }
    users.push(userData);
    localStorage.setItem(DB_KEYS.USERS, JSON.stringify(users));
    saveUserSession(userData); // Auto login
    return { success: true };
}

function loginUser(phone, password) {
    const users = getUsers();
    const user = users.find(u => u.phone === phone && u.password === password);
    if (user) {
        saveUserSession(user);
        return { success: true };
    }
    return { success: false, message: 'Invalid Credentials' };
}

function saveUserSession(user) {
    // Don't save password in session
    const { password, ...safeUser } = user;
    localStorage.setItem(DB_KEYS.SESSION, JSON.stringify(safeUser));
}

function getUserSession() {
    const stored = localStorage.getItem(DB_KEYS.SESSION);
    return stored ? JSON.parse(stored) : null;
}

function logout() {
    localStorage.removeItem(DB_KEYS.SESSION);
}


// --- Exports (Global Scope for simplicity in vanilla JS) ---
window.RathnaApp = {
    getInventory,
    updateItemStock,
    updateItem,
    deleteItem,
    addNewItem,
    getOrders,
    placeOrder,
    updateOrderStatus,
    deleteOrder,
    getUserOrders,
    registerUser,
    loginUser,
    getUserSession,
    logout,
    getSettings,
    updateSettings,
    showToast
};
