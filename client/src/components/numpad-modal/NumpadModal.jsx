import Button from '../button/Button';

const keys = ['7', '8', '9', '4', '5', '6', '1', '2', '3', '0', '.', 'C'];

export default function NumpadModal({
    open,
    title,
    value,
    onChange,
    onClose,
    onConfirm,
    allowDecimal = true,
}) {
    if (!open) return null;

    function press(k) {
        if (k === 'C') {
            onChange('');
            return;
        }
        if (k === '.' && !allowDecimal) return;
        if (k === '.' && value.includes('.')) return;
        if (k === '0' && value === '0') return;
        let next = value + k;
        if (next.startsWith('.')) next = `0${next}`;
        if (next.length > 12) return;
        onChange(next);
    }

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
            role="dialog"
            aria-modal="true"
            aria-labelledby="numpad-title"
        >
            <div className="w-full max-w-sm rounded-2xl border border-amber-900/10 bg-[#fffdf9] p-4 shadow-xl">
                <h2 id="numpad-title" className="mb-2 text-center text-lg font-bold text-[#8b4513]">
                    {title}
                </h2>
                <div className="mb-3 rounded-xl border-2 border-amber-800/20 bg-white px-3 py-2 text-right text-2xl font-mono font-semibold text-[#8b4513]">
                    {value || '0'}
                </div>
                <div className="grid grid-cols-3 gap-2">
                    {keys.map((k) => (
                        <button
                            key={k}
                            type="button"
                            className="rounded-xl bg-amber-100/80 py-3 text-lg font-bold text-[#8b4513] hover:bg-amber-200/80"
                            onClick={() => press(k)}
                        >
                            {k}
                        </button>
                    ))}
                </div>
                <div className="mt-4 flex gap-2">
                    <Button variant="outline" className="flex-1" onClick={onClose}>
                        Cancel
                    </Button>
                    <Button variant="success" className="flex-1" onClick={onConfirm}>
                        OK
                    </Button>
                </div>
            </div>
        </div>
    );
}
