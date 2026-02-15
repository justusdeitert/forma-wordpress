/**
 * Generate / Remove action buttons.
 *
 * @package FormaFavicon
 */

interface Props {
    generated: boolean;
    saving: boolean;
    deleting: boolean;
    onGenerate: () => void;
    onDelete: () => void;
}

export const Actions = ({ generated, saving, deleting, onGenerate, onDelete }: Props) => (
    <div className="mb-10 flex items-center gap-3">
        <button
            type="button"
            onClick={onGenerate}
            disabled={saving}
            className="px-5 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 border-none cursor-pointer bg-blue-600 text-white hover:bg-blue-700 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
        >
            {saving ? 'Generating…' : generated ? 'Regenerate Favicons' : 'Generate Favicons'}
        </button>
        {generated && (
            <button
                type="button"
                onClick={onDelete}
                disabled={deleting}
                className="px-5 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 border border-red-200 bg-white text-red-600 cursor-pointer hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {deleting ? 'Removing…' : 'Remove All'}
            </button>
        )}
    </div>
);
