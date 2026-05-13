import { useCallback, useEffect, useState } from 'react';
import { completeOrder, getPendingOrders } from '../../api/Index';
import { Button } from '../../components/Index';

function urgencyClass(createdAt) {
    const mins = (Date.now() - new Date(createdAt).getTime()) / 60000;
    if (mins >= 10) return 'border-red-500 bg-red-50 shadow-red-200';
    if (mins >= 5) return 'border-amber-400 bg-amber-50 shadow-amber-100';
    return 'border-emerald-500 bg-emerald-50 shadow-emerald-100';
}

function elapsedLabel(createdAt) {
    const s = Math.floor((Date.now() - new Date(createdAt).getTime()) / 1000);
    const m = Math.floor(s / 60);
    const r = s % 60;
    return `${m}m ${r}s`;
}

export default function Kitchen() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [busyId, setBusyId] = useState(null);

    const load = useCallback(async () => {
        try {
            const data = await getPendingOrders();
            setOrders(Array.isArray(data) ? data : []);
            setError('');
        } catch (e) {
            setError(e.message || 'Failed to load orders');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        load();
        const id = setInterval(load, 30000);
        return () => clearInterval(id);
    }, [load]);

    async function complete(id) {
        setBusyId(id);
        try {
            await completeOrder(id);
            await load();
        } catch (e) {
            setError(e.message || 'Could not complete order');
        } finally {
            setBusyId(null);
        }
    }

    return (
        <div className="flex flex-1 flex-col gap-4 p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                    <h1 className="text-2xl font-bold text-[#8b4513]">Kitchen display</h1>
                    <p className="text-sm text-[#a0826d]">Pending orders refresh every 30 seconds (pull Refresh for immediate sync).</p>
                </div>
                <Button variant="secondary" size="small" onClick={load} disabled={loading}>
                    Refresh now
                </Button>
            </div>

            {error && (
                <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">{error}</div>
            )}

            {loading && orders.length === 0 ? (
                <p className="text-[#a0826d]">Loading queue…</p>
            ) : orders.length === 0 ? (
                <p className="rounded-xl border border-dashed border-amber-900/20 bg-white py-16 text-center text-[#a0826d]">
                    No pending orders
                </p>
            ) : (
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                    {orders.map((order) => (
                        <article
                            key={order.id}
                            className={`flex flex-col rounded-2xl border-2 p-4 shadow-md ${urgencyClass(order.created_at)}`}
                        >
                            <div className="mb-2 flex items-start justify-between gap-2">
                                <span className="text-lg font-black text-[#654321]">Order #{order.id}</span>
                                <span className="rounded-full bg-white/80 px-2 py-0.5 text-xs font-bold text-[#8b4513] ring-1 ring-amber-900/10">
                                    {elapsedLabel(order.created_at)}
                                </span>
                            </div>
                            <ul className="mb-3 flex-1 space-y-1 text-left text-sm">
                                {order.items?.map((it, idx) => (
                                    <li key={idx} className="flex justify-between gap-2 font-medium text-[#432818]">
                                        <span>
                                            {it.quantity}× {it.name}
                                        </span>
                                        <span className="text-[#a0826d]">R {Number(it.price).toFixed(2)}</span>
                                    </li>
                                ))}
                            </ul>
                            <div className="mt-auto flex items-center justify-between border-t border-black/5 pt-3">
                                <span className="font-bold text-[#8b4513]">
                                    R {Number(order.total_amount).toFixed(2)}
                                </span>
                                <Button
                                    variant="success"
                                    size="small"
                                    loading={busyId === order.id}
                                    disabled={busyId != null && busyId !== order.id}
                                    onClick={() => complete(order.id)}
                                >
                                    Complete
                                </Button>
                            </div>
                        </article>
                    ))}
                </div>
            )}
        </div>
    );
}
