/**
 * Confirmation modal for deleting all favicons.
 *
 * @package FormaFavicon
 */

interface Props {
    deleting: boolean;
    onConfirm: () => void;
    onCancel: () => void;
}

export const DeleteModal = ({ deleting, onConfirm, onCancel }: Props) => (
    <div className="fixed inset-0 z-[100000] flex items-center justify-center">
        <div className="absolute inset-0 bg-black/50" onClick={onCancel} />
        <div className="relative bg-white rounded-xl shadow-2xl p-6 max-w-sm w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 m-0 mb-2">Remove all favicons?</h3>
            <p className="text-sm text-gray-500 m-0 mb-6">
                This will delete all generated favicon files and reset the settings. This action cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
                <button
                    type="button"
                    onClick={onCancel}
                    className="px-4 py-2 rounded-lg text-sm font-medium border border-gray-200 bg-white text-gray-700 cursor-pointer hover:bg-gray-50 transition-all"
                >
                    Cancel
                </button>
                <button
                    type="button"
                    onClick={onConfirm}
                    disabled={deleting}
                    className="px-4 py-2 rounded-lg text-sm font-medium border-none bg-red-600 text-white cursor-pointer hover:bg-red-700 transition-all disabled:opacity-50"
                >
                    {deleting ? 'Removing…' : 'Remove All'}
                </button>
            </div>
        </div>
    </div>
);
