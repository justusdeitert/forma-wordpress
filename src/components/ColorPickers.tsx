/**
 * Color picker pair for theme / background colors.
 *
 * @package FormaFavicon
 */

interface Props {
    themeColor: string;
    bgColor: string;
    onThemeColorChange: (value: string) => void;
    onBgColorChange: (value: string) => void;
}

const ColorField = ({
    label,
    value,
    onChange,
}: {
    label: string;
    value: string;
    onChange: (v: string) => void;
}) => (
    <div>
        <label className="block text-sm font-medium text-gray-600 mb-2">{label}</label>
        <div className="flex items-center gap-3">
            <input
                type="color"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="w-10 h-10 rounded-lg border border-gray-200 cursor-pointer p-0.5"
            />
            <input
                type="text"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white w-28 font-mono"
            />
        </div>
    </div>
);

export const ColorPickers = ({ themeColor, bgColor, onThemeColorChange, onBgColorChange }: Props) => (
    <div className="mb-8 p-6 bg-white rounded-xl border-2 border-gray-100">
        <h2 className="text-base font-medium text-gray-700 m-0 mb-4">Colors</h2>
        <p className="text-xs text-gray-400 m-0 mb-5">
            These colors are used in the web manifest and browser chrome (address bar, task switcher).
        </p>
        <div className="flex gap-8">
            <ColorField label="Theme Color" value={themeColor} onChange={onThemeColorChange} />
            <ColorField label="Background Color" value={bgColor} onChange={onBgColorChange} />
        </div>
    </div>
);
