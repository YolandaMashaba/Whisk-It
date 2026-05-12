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

export const getItems = () => fetch(`${BASE}/items`).then(handle);

export const getAdminItems = () =>
    fetch(`${BASE}/admin/items`, { headers: authHeaders() }).then(handle);

export const createItem = (body) =>
    fetch(`${BASE}/items`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify(body),
    }).then(handle);

export const updateItem = (id, body) =>
    fetch(`${BASE}/items/${id}`, {
        method: 'PUT',
        headers: authHeaders(),
        body: JSON.stringify(body),
    }).then(handle);

export const deactivateItem = (id) =>
    fetch(`${BASE}/items/${id}`, {
        method: 'DELETE',
        headers: authHeaders(),
    }).then(handle);

export const createOrder = (items, total_amount) =>
    fetch(`${BASE}/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items, total_amount }),
    }).then(handle);

export const getPendingOrders = () =>
    fetch(`${BASE}/orders/pending`, { headers: authHeaders() }).then(handle);

export const completeOrder = (id) =>
    fetch(`${BASE}/orders/${id}/complete`, {
        method: 'PUT',
        headers: authHeaders(),
    }).then(handle);

export const getAdminOrders = (start_date, end_date) => {
    const q = new URLSearchParams();
    if (start_date) q.set('start_date', start_date);
    if (end_date) q.set('end_date', end_date);
    const qs = q.toString();
    return fetch(`${BASE}/admin/orders${qs ? `?${qs}` : ''}`, { headers: authHeaders() }).then(handle);
};

export const getSalesReport = (start_date, end_date) => {
    const q = new URLSearchParams();
    if (start_date) q.set('start_date', start_date);
    if (end_date) q.set('end_date', end_date);
    const qs = q.toString();
    return fetch(`${BASE}/reports/sales${qs ? `?${qs}` : ''}`, { headers: authHeaders() }).then(handle);
};

export const getTopProducts = (start_date, end_date) => {
    const q = new URLSearchParams();
    if (start_date) q.set('start_date', start_date);
    if (end_date) q.set('end_date', end_date);
    const qs = q.toString();
    return fetch(`${BASE}/reports/top-products${qs ? `?${qs}` : ''}`, { headers: authHeaders() }).then(handle);
};

export const getStatus = () => fetch(`${BASE}/status`).then(handle);
