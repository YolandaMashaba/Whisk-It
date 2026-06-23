const BASE = '/api';

export function getToken() {
    return localStorage.getItem('whisk_token');
}

export function authHeaders() {
    const t = getToken();
    const h = { 'Content-Type': 'application/json' };
    if (t) h.Authorization = `Bearer ${t}`;
    return h;
}

async function handle(res) {
    const text = await res.text();
    let data = null;
    try {
        data = text ? JSON.parse(text) : null;
    } catch {
        /* non-JSON */
    }
    if (!res.ok) {
        throw new Error(data?.error || res.statusText || 'Request failed');
    }
    return data;
}

export const login = (username, password) =>
    fetch(`${BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
    }).then(handle);

export const register = (username, password) =>
    fetch(`${BASE}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
    }).then(handle);

export const getAdminUsers = () =>
    fetch(`${BASE}/admin/users`, { headers: authHeaders() }).then(handle);

export const patchAdminUser = (id, body) =>
    fetch(`${BASE}/admin/users/${id}`, {
        method: 'PATCH',
        headers: authHeaders(),
        body: JSON.stringify(body),
    }).then(handle);

// Items API
export const getItems = () =>
    fetch(`${BASE}/items`, { headers: authHeaders() }).then(handle);

export const getAdminItems = () =>
    fetch(`${BASE}/admin/items`, { headers: authHeaders() }).then(handle);

export const createItem = (item) =>
    fetch(`${BASE}/items`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify(item),
    }).then(handle);

export const updateItem = (id, item) =>
    fetch(`${BASE}/items/${id}`, {
        method: 'PUT',
        headers: authHeaders(),
        body: JSON.stringify(item),
    }).then(handle);

export const deleteItem = (id) =>
    fetch(`${BASE}/items/${id}`, {
        method: 'DELETE',
        headers: authHeaders(),
    }).then(handle);

// Orders API
export const createOrder = (items, total_amount) =>
    fetch(`${BASE}/orders`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({ items, total_amount }),
    }).then(handle);

export const getPendingOrders = () =>
    fetch(`${BASE}/orders/pending`, { headers: authHeaders() }).then(handle);

export const completeOrder = (id) =>
    fetch(`${BASE}/orders/${id}/complete`, {
        method: 'PUT',
        headers: authHeaders(),
    }).then(handle);

export const getAdminOrders = (params = {}) => {
    const url = new URL(`${BASE}/admin/orders`, window.location.origin);
    Object.keys(params).forEach(key => {
        if (params[key] !== undefined && params[key] !== null) {
            url.searchParams.append(key, params[key]);
        }
    });
    return fetch(url.toString(), { headers: authHeaders() }).then(handle);
};

// Reports API
export const getSalesReport = (params = {}) => {
    const url = new URL(`${BASE}/reports/sales`, window.location.origin);
    Object.keys(params).forEach(key => {
        if (params[key] !== undefined && params[key] !== null) {
            url.searchParams.append(key, params[key]);
        }
    });
    return fetch(url.toString(), { headers: authHeaders() }).then(handle);
};

export const getTopProducts = (params = {}) => {
    const url = new URL(`${BASE}/reports/top-products`, window.location.origin);
    Object.keys(params).forEach(key => {
        if (params[key] !== undefined && params[key] !== null) {
            url.searchParams.append(key, params[key]);
        }
    });
    return fetch(url.toString(), { headers: authHeaders() }).then(handle);
};

export const getStatus = () => fetch(`${BASE}/status`).then(handle);
