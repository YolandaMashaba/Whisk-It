import { useCallback, useEffect, useMemo, useState } from 'react';
import Chart from '@/components/chart/Chart';
import { Button, Input, Table } from '@/components/Index';
import { useAuth } from '@/context/AuthContext';
import {
    createItem,
    deactivateItem,
    getAdminItems,
    getAdminOrders,
    getAdminUsers,
    getSalesReport,
    getTopProducts,
    patchAdminUser,
    updateItem,
} from '../../api/Index';

function isoDate(d) {
    return d.toISOString().slice(0, 10);
}

function defaultRange() {
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - 30);
    return { from: isoDate(start), to: isoDate(end) };
}

const emptyForm = { name: '', price: '', category: '', stock_quantity: '', active: true };

export default function AdminDashboard() {
    const { applyAuth } = useAuth();
    const { from: df, to: dt } = defaultRange();
    const [tab, setTab] = useState('overview');
    const [rangeFrom, setRangeFrom] = useState(df);
    const [rangeTo, setRangeTo] = useState(dt);

    const [items, setItems] = useState([]);
    const [orders, setOrders] = useState([]);
    const [sales, setSales] = useState([]);
    const [topProducts, setTopProducts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState('');
    const [sort, setSort] = useState({ key: 'name', dir: 'asc' });

    const [modal, setModal] = useState({ open: false, editing: null });
    const [form, setForm] = useState(emptyForm);
    const [usersList, setUsersList] = useState([]);

    const loadItems = useCallback(async () => {
        const data = await getAdminItems();
        setItems(data);
    }, []);

    const loadReports = useCallback(async () => {
        const [s, t] = await Promise.all([
            getSalesReport(rangeFrom, rangeTo),
            getTopProducts(rangeFrom, rangeTo),
        ]);
        setSales(s);
        setTopProducts(t);
    }, [rangeFrom, rangeTo]);

    const loadOrders = useCallback(async () => {
        const o = await getAdminOrders(rangeFrom, rangeTo);
        setOrders(o);
    }, [rangeFrom, rangeTo]);

    const loadUsers = useCallback(async () => {
        const list = await getAdminUsers();
        setUsersList(list);
    }, []);

    useEffect(() => {
        let cancelled = false;
        (async () => {
            setLoading(true);
            try {
                if (tab === 'inventory') await loadItems();
                if (cancelled) return;
                if (tab === 'overview') await loadReports();
                if (tab === 'sales') await loadOrders();
                if (tab === 'users') await loadUsers();
            } catch {
                /* surfaced per-tab */
            } finally {
                if (!cancelled) setLoading(false);
            }
        })();
        return () => {
            cancelled = true;
        };
    }, [tab, loadItems, loadReports, loadOrders, loadUsers]);

    const filteredItems = useMemo(() => {
        const q = search.trim().toLowerCase();
        let rows = items.filter((r) => {
            if (!q) return true;
            return (
                String(r.name).toLowerCase().includes(q) ||
                String(r.category || '').toLowerCase().includes(q)
            );
        });
        const { key, dir } = sort;
        rows = [...rows].sort((a, b) => {
            const va = a[key];
            const vb = b[key];
            const na = typeof va === 'number' ? va : String(va ?? '').toLowerCase();
            const nb = typeof vb === 'number' ? vb : String(vb ?? '').toLowerCase();
            if (na < nb) return dir === 'asc' ? -1 : 1;
            if (na > nb) return dir === 'asc' ? 1 : -1;
            return 0;
        });
        return rows;
    }, [items, search, sort]);

    function toggleSort(key) {
        setSort((s) =>
            s.key === key ? { key, dir: s.dir === 'asc' ? 'desc' : 'asc' } : { key, dir: 'asc' }
        );
    }

    function openCreate() {
        setForm(emptyForm);
        setModal({ open: true, editing: null });
    }

    function openEdit(row) {
        setForm({
            name: row.name,
            price: String(row.price),
            category: row.category || '',
            stock_quantity: String(row.stock_quantity ?? 0),
            active: Boolean(row.active),
        });
        setModal({ open: true, editing: row });
    }

    async function saveItem(e) {
        e.preventDefault();
        const payload = {
            name: form.name.trim(),
            price: parseFloat(form.price),
            category: form.category.trim(),
            stock_quantity: parseInt(form.stock_quantity, 10) || 0,
            active: form.active,
        };
        if (modal.editing) {
            await updateItem(modal.editing.id, payload);
        } else {
            await createItem({
                name: payload.name,
                price: payload.price,
                category: payload.category,
                stock_quantity: payload.stock_quantity,
            });
        }
        setModal({ open: false, editing: null });
        setForm(emptyForm);
        await loadItems();
    }

    async function onDeactivate(row) {
        if (!window.confirm(`Deactivate “${row.name}”?`)) return;
        await deactivateItem(row.id);
        await loadItems();
    }

    async function toggleUserAdmin(row, nextIsAdmin) {
        const verb = nextIsAdmin ? 'grant admin to' : 'remove admin from';
        if (!window.confirm(`${verb} ${row.username}?`)) return;
        try {
            const res = await patchAdminUser(row.id, { is_admin: nextIsAdmin });
            if (res.token) applyAuth(res);
            await loadUsers();
        } catch (e) {
            window.alert(e.message || 'Update failed');
        }
    }

    const revenueBar = useMemo(() => {
        const slice = [...sales].slice(0, 14).reverse();
        return slice.map((r) => ({
            label: r.date ? String(r.date).slice(0, 10) : '',
            value: Number(r.total_revenue) || 0,
        }));
    }, [sales]);

    const topBar = useMemo(() => {
        return topProducts.map((r) => ({
            label: r.name,
            value: Number(r.total_quantity) || 0,
        }));
    }, [topProducts]);

    const totals = useMemo(() => {
        const revenue = sales.reduce((s, r) => s + (Number(r.total_revenue) || 0), 0);
        const ordersN = sales.reduce((s, r) => s + (Number(r.order_count) || 0), 0);
        return { revenue, ordersN };
    }, [sales]);

    const tabBtn = (id, label) => (
        <button
            key={id}
            type="button"
            onClick={() => setTab(id)}
            className={`rounded-full px-4 py-2 text-sm font-semibold ${
                tab === id ? 'bg-[#8b4513] text-white' : 'bg-white text-[#8b4513] ring-1 ring-amber-900/15'
            }`}
        >
            {label}
        </button>
    );

    return (
        <div className="flex flex-1 flex-col gap-4 p-4">
            <h1 className="text-2xl font-bold text-[#8b4513]">Admin</h1>
            <div className="flex flex-wrap gap-2">
                {tabBtn('overview', 'Overview')}
                {tabBtn('inventory', 'Inventory')}
                {tabBtn('sales', 'Sales history')}
                {tabBtn('users', 'Users')}
            </div>

            {(tab === 'overview' || tab === 'sales') && (
                <div className="flex flex-wrap items-end gap-3 rounded-xl bg-white/90 p-4 ring-1 ring-amber-900/10">
                    <Input
                        label="From"
                        type="date"
                        value={rangeFrom}
                        onChange={(e) => setRangeFrom(e.target.value)}
                    />
                    <Input
                        label="To"
                        type="date"
                        value={rangeTo}
                        onChange={(e) => setRangeTo(e.target.value)}
                    />
                    <Button
                        variant="secondary"
                        size="small"
                        onClick={async () => {
                            setLoading(true);
                            try {
                                if (tab === 'overview') await loadReports();
                                else if (tab === 'sales') await loadOrders();
                                else if (tab === 'users') await loadUsers();
                            } finally {
                                setLoading(false);
                            }
                        }}
                    >
                        Apply range
                    </Button>
                </div>
            )}

            {tab === 'overview' && (
                <div className="space-y-6">
                    <div className="grid gap-3 sm:grid-cols-3">
                        <div className="rounded-2xl border border-amber-900/10 bg-white p-4 shadow-sm">
                            <div className="text-xs font-semibold uppercase text-[#a0826d]">Period revenue</div>
                            <div className="mt-1 text-2xl font-black text-[#8b4513]">
                                R {totals.revenue.toFixed(2)}
                            </div>
                        </div>
                        <div className="rounded-2xl border border-amber-900/10 bg-white p-4 shadow-sm">
                            <div className="text-xs font-semibold uppercase text-[#a0826d]">Completed orders (days in range)</div>
                            <div className="mt-1 text-2xl font-black text-[#8b4513]">{totals.ordersN}</div>
                        </div>
                        <div className="rounded-2xl border border-amber-900/10 bg-white p-4 shadow-sm">
                            <div className="text-xs font-semibold uppercase text-[#a0826d]">Avg / day</div>
                            <div className="mt-1 text-2xl font-black text-[#8b4513]">
                                R{' '}
                                {(totals.revenue / Math.max(sales.length, 1)).toFixed(2)}
                            </div>
                        </div>
                    </div>
                    <div className="grid gap-6 lg:grid-cols-2">
                        {revenueBar.length > 0 ? (
                            <Chart type="bar" data={revenueBar} title="Daily revenue" height={240} color="#c19a6b" />
                        ) : (
                            <p className="text-sm text-[#a0826d]">No sales in this date range.</p>
                        )}
                        {topBar.length > 0 ? (
                            <Chart type="bar" data={topBar} title="Top products (qty)" height={240} color="#8b4513" />
                        ) : (
                            <p className="text-sm text-[#a0826d]">No product data for this range.</p>
                        )}
                    </div>
                </div>
            )}

            {tab === 'inventory' && (
                <div className="space-y-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                        <input
                            type="search"
                            placeholder="Search name or category…"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="min-w-[200px] flex-1 rounded-xl border-2 border-amber-800/20 px-3 py-2 text-[#8b4513]"
                        />
                        <Button variant="primary" onClick={openCreate}>
                            Add product
                        </Button>
                    </div>
                    <div className="overflow-x-auto rounded-xl ring-1 ring-amber-900/10">
                        <table className="w-full min-w-[640px] border-collapse text-left text-sm">
                            <thead>
                                <tr className="bg-gradient-to-r from-[#d4a574] to-[#c19a6b] text-white">
                                    {[
                                        ['name', 'Name'],
                                        ['category', 'Category'],
                                        ['price', 'Price'],
                                        ['stock_quantity', 'Stock'],
                                        ['active', 'Active'],
                                    ].map(([key, label]) => (
                                        <th key={key} className="px-3 py-3 font-bold">
                                            <button
                                                type="button"
                                                className="text-white underline-offset-2 hover:underline"
                                                onClick={() => toggleSort(key)}
                                            >
                                                {label}
                                                {sort.key === key ? (sort.dir === 'asc' ? ' ↑' : ' ↓') : ''}
                                            </button>
                                        </th>
                                    ))}
                                    <th className="px-3 py-3 font-bold">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredItems.map((row) => (
                                    <tr key={row.id} className="border-b border-amber-900/5 bg-[#fffdf9]">
                                        <td className="px-3 py-2 font-medium text-[#8b4513]">{row.name}</td>
                                        <td className="px-3 py-2">{row.category}</td>
                                        <td className="px-3 py-2">R {Number(row.price).toFixed(2)}</td>
                                        <td className="px-3 py-2">{row.stock_quantity}</td>
                                        <td className="px-3 py-2">{row.active ? 'Yes' : 'No'}</td>
                                        <td className="space-x-2 px-3 py-2">
                                            <Button size="small" variant="outline" onClick={() => openEdit(row)}>
                                                Edit
                                            </Button>
                                            {row.active ? (
                                                <Button size="small" variant="danger" onClick={() => onDeactivate(row)}>
                                                    Deactivate
                                                </Button>
                                            ) : null}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {tab === 'sales' && (
                <Table
                    loading={loading}
                    data={orders}
                    emptyMessage="No orders in range"
                    columns={[
                        { header: 'ID', accessor: 'id' },
                        {
                            header: 'Created',
                            accessor: 'created_at',
                            render: (v) => (v ? new Date(v).toLocaleString() : ''),
                        },
                        {
                            header: 'Total',
                            accessor: 'total_amount',
                            render: (v) => `R ${Number(v).toFixed(2)}`,
                        },
                        { header: 'Status', accessor: 'status' },
                    ]}
                />
            )}

            {tab === 'users' && (
                <div>
                    {loading && (
                        <p className="mb-2 text-sm text-[#a0826d]" role="status">
                            Loading…
                        </p>
                    )}
                    <div className="overflow-x-auto rounded-xl ring-1 ring-amber-900/10">
                    <table className="w-full min-w-[520px] border-collapse text-left text-sm">
                        <thead>
                            <tr className="bg-gradient-to-r from-[#d4a574] to-[#c19a6b] text-white">
                                <th className="px-3 py-3 font-bold">ID</th>
                                <th className="px-3 py-3 font-bold">Username</th>
                                <th className="px-3 py-3 font-bold">Role</th>
                                <th className="px-3 py-3 font-bold">Admin</th>
                                <th className="px-3 py-3 font-bold">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {usersList.map((row) => (
                                <tr key={row.id} className="border-b border-amber-900/5 bg-[#fffdf9]">
                                    <td className="px-3 py-2">{row.id}</td>
                                    <td className="px-3 py-2 font-medium text-[#8b4513]">{row.username}</td>
                                    <td className="px-3 py-2">{row.role}</td>
                                    <td className="px-3 py-2">{row.is_admin ? 'Yes' : 'No'}</td>
                                    <td className="px-3 py-2">
                                        {row.is_admin ? (
                                            <Button size="small" variant="outline" onClick={() => toggleUserAdmin(row, false)}>
                                                Remove admin
                                            </Button>
                                        ) : (
                                            <Button size="small" variant="success" onClick={() => toggleUserAdmin(row, true)}>
                                                Make admin
                                            </Button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {usersList.length === 0 && !loading && (
                        <p className="p-4 text-center text-sm text-[#a0826d]">No users</p>
                    )}
                    </div>
                </div>
            )}

            {modal.open && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
                    <form
                        onSubmit={saveItem}
                        className="w-full max-w-md rounded-2xl border border-amber-900/10 bg-[#fffdf9] p-6 shadow-xl"
                    >
                        <h2 className="mb-4 text-xl font-bold text-[#8b4513]">
                            {modal.editing ? 'Edit product' : 'New product'}
                        </h2>
                        <Input label="Name" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} required />
                        <Input
                            label="Price"
                            type="number"
                            step="0.01"
                            value={form.price}
                            onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
                            required
                        />
                        <Input
                            label="Category"
                            value={form.category}
                            onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
                            placeholder="Breads, Pastries, Coffee…"
                            required
                        />
                        <Input
                            label="Stock"
                            type="number"
                            value={form.stock_quantity}
                            onChange={(e) => setForm((f) => ({ ...f, stock_quantity: e.target.value }))}
                            required
                        />
                        {modal.editing && (
                            <label className="mb-4 flex items-center gap-2 text-sm font-semibold text-[#8b4513]">
                                <input
                                    type="checkbox"
                                    checked={form.active}
                                    onChange={(e) => setForm((f) => ({ ...f, active: e.target.checked }))}
                                />
                                Active (visible on sales floor)
                            </label>
                        )}
                        <div className="mt-2 flex gap-2">
                            <Button type="button" variant="outline" onClick={() => setModal({ open: false, editing: null })}>
                                Cancel
                            </Button>
                            <Button type="submit" variant="primary">
                                Save
                            </Button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
}
