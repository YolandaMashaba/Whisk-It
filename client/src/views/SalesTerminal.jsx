import { useCallback, useEffect, useMemo, useState } from 'react';
import { createOrder, getItems } from '../api/Index';
import NumpadModal from '../components/NumpadModal';
import { Button } from '../components/Index';

const CATEGORY_BG = {
    Breads: 'bg-amber-100 border-amber-300',
    Pastries: 'bg-pink-100 border-pink-300',
    Coffee: 'bg-sky-100 border-sky-300',
};

function formatMoney(n) {
    return `R ${Number(n).toFixed(2)}`;
}

export default function SalesTerminal() {
    const [catalog, setCatalog] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeCategory, setActiveCategory] = useState('All');
    const [cart, setCart] = useState([]);
    const [toast, setToast] = useState(null);
    const [paying, setPaying] = useState(false);

    const [numpad, setNumpad] = useState({ open: false, lineIndex: null, buffer: '' });

    const load = useCallback(async () => {
        setLoading(true);
        try {
            const items = await getItems();
            setCatalog(items);
        } catch {
            setToast({ type: 'error', text: 'Could not load menu (is the API running?)' });
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        load();
    }, [load]);

    useEffect(() => {
        if (!toast) return undefined;
        const t = setTimeout(() => setToast(null), 3200);
        return () => clearTimeout(t);
    }, [toast]);

    const categories = useMemo(() => {
        const set = new Set(catalog.map((i) => i.category).filter(Boolean));
        return ['All', ...[...set].sort()];
    }, [catalog]);

    const filtered = useMemo(() => {
        if (activeCategory === 'All') return catalog;
        return catalog.filter((i) => i.category === activeCategory);
    }, [catalog, activeCategory]);

    function addToCart(item) {
        setCart((prev) => {
            const idx = prev.findIndex((l) => l.id === item.id);
            if (idx >= 0) {
                const next = [...prev];
                next[idx] = { ...next[idx], quantity: next[idx].quantity + 1 };
                return next;
            }
            return [...prev, { ...item, quantity: 1 }];
        });
    }

    function setQty(lineIndex, qty) {
        const q = Math.max(0.01, Number(qty) || 1);
        setCart((prev) => {
            const next = [...prev];
            if (!next[lineIndex]) return prev;
            next[lineIndex] = { ...next[lineIndex], quantity: q };
            return next;
        });
    }

    function removeLine(i) {
        setCart((prev) => prev.filter((_, j) => j !== i));
    }

    const subtotal = cart.reduce((s, l) => s + Number(l.price) * Number(l.quantity), 0);

    async function pay() {
        if (cart.length === 0) return;
        setPaying(true);
        try {
            await createOrder(
                cart.map((l) => ({
                    id: l.id,
                    quantity: Math.max(1, Math.round(Number(l.quantity))),
                    price: l.price,
                })),
                subtotal
            );
            setCart([]);
            setToast({ type: 'ok', text: 'Payment successful — order sent to kitchen!' });
            load();
        } catch (e) {
            setToast({ type: 'error', text: e.message || 'Checkout failed' });
        } finally {
            setPaying(false);
        }
    }

    function openNumpad(lineIndex) {
        const line = cart[lineIndex];
        setNumpad({
            open: true,
            lineIndex,
            buffer: String(line?.quantity ?? '1'),
        });
    }

    function confirmNumpad() {
        const q = parseFloat(numpad.buffer);
        if (numpad.lineIndex != null && !Number.isNaN(q) && q > 0) {
            setQty(numpad.lineIndex, q);
        }
        setNumpad({ open: false, lineIndex: null, buffer: '' });
    }

    return (
        <div className="flex flex-1 flex-col gap-3 p-3 lg:flex-row lg:gap-4 lg:p-4">
            <div className="min-h-0 flex-1 lg:pr-[340px]">
                <div className="mb-3 flex gap-2 overflow-x-auto pb-1">
                    {categories.map((cat) => (
                        <button
                            key={cat}
                            type="button"
                            onClick={() => setActiveCategory(cat)}
                            className={`shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
                                activeCategory === cat
                                    ? 'bg-[#8b4513] text-white'
                                    : 'bg-white text-[#8b4513] ring-1 ring-amber-900/15 hover:bg-amber-50'
                            }`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>

                {loading ? (
                    <p className="text-[#a0826d]">Loading menu…</p>
                ) : (
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4">
                        {filtered.map((item) => {
                            const tint =
                                CATEGORY_BG[item.category] || 'bg-stone-100 border-stone-300';
                            return (
                                <button
                                    key={item.id}
                                    type="button"
                                    onClick={() => addToCart(item)}
                                    className={`flex min-h-[120px] flex-col items-center justify-center rounded-2xl border-2 p-3 text-center shadow-sm transition hover:shadow-md ${tint}`}
                                >
                                    <span className="text-xs font-semibold uppercase tracking-wide text-[#654321]/80">
                                        {item.category}
                                    </span>
                                    <span className="mt-1 line-clamp-2 text-base font-bold text-[#8b4513]">
                                        {item.name}
                                    </span>
                                    <span className="mt-2 text-lg font-extrabold text-[#654321]">
                                        {formatMoney(item.price)}
                                    </span>
                                    <span className="mt-1 text-xs text-[#6b5344]">
                                        Stock {item.stock_quantity}
                                    </span>
                                </button>
                            );
                        })}
                    </div>
                )}
            </div>

            <aside className="fixed bottom-0 right-0 top-auto z-30 flex max-h-[45vh] w-full flex-col border-t border-amber-900/15 bg-[#fffdf9] shadow-[0_-4px_20px_rgba(0,0,0,0.08)] lg:fixed lg:top-[57px] lg:max-h-none lg:h-[calc(100vh-57px)] lg:w-[320px] lg:border-l lg:border-t-0">
                <div className="border-b border-amber-900/10 px-4 py-3">
                    <h2 className="text-lg font-bold text-[#8b4513]">Cart</h2>
                </div>
                <div className="min-h-0 flex-1 overflow-y-auto px-3 py-2">
                    {cart.length === 0 ? (
                        <p className="py-8 text-center text-sm text-[#a0826d]">Tap products to add</p>
                    ) : (
                        <ul className="space-y-2">
                            {cart.map((line, i) => (
                                <li
                                    key={`${line.id}-${i}`}
                                    className="flex items-start justify-between gap-2 rounded-xl bg-white/90 px-3 py-2 ring-1 ring-amber-900/10"
                                >
                                    <div className="min-w-0 flex-1 text-left">
                                        <div className="font-semibold text-[#8b4513]">{line.name}</div>
                                        <div className="text-xs text-[#a0826d]">
                                            {formatMoney(line.price)} × {line.quantity}
                                        </div>
                                    </div>
                                    <div className="flex shrink-0 flex-col items-end gap-1">
                                        <button
                                            type="button"
                                            className="text-xs font-semibold text-[#8b4513] underline"
                                            onClick={() => openNumpad(i)}
                                        >
                                            Qty
                                        </button>
                                        <button
                                            type="button"
                                            className="text-xs text-red-600"
                                            onClick={() => removeLine(i)}
                                        >
                                            Remove
                                        </button>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
                <div className="border-t border-amber-900/10 p-4">
                    <div className="mb-3 flex justify-between text-lg font-bold text-[#8b4513]">
                        <span>Total</span>
                        <span>{formatMoney(subtotal)}</span>
                    </div>
                    <Button
                        variant="success"
                        size="large"
                        className="w-full"
                        disabled={cart.length === 0 || paying}
                        loading={paying}
                        onClick={pay}
                    >
                        Pay
                    </Button>
                </div>
            </aside>

            <NumpadModal
                open={numpad.open}
                title="Quantity"
                value={numpad.buffer}
                onChange={(v) => setNumpad((s) => ({ ...s, buffer: v }))}
                onClose={() => setNumpad({ open: false, lineIndex: null, buffer: '' })}
                onConfirm={confirmNumpad}
                allowDecimal
            />

            {toast && (
                <div
                    className={`fixed bottom-24 left-1/2 z-40 -translate-x-1/2 rounded-full px-5 py-2 text-sm font-semibold shadow-lg lg:bottom-8 ${
                        toast.type === 'ok' ? 'bg-green-700 text-white' : 'bg-red-600 text-white'
                    }`}
                    role="status"
                >
                    {toast.text}
                </div>
            )}
        </div>
    );
}
