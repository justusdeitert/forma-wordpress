/**
 * Icon styling options: padding, border radius, background color.
 *
 * @package FormaFavicon
 */

interface Props {
    padding: number;
    borderRadius: number;
    iconBgColor: string;
    onPaddingChange: (value: number) => void;
    onBorderRadiusChange: (value: number) => void;
    onIconBgColorChange: (value: string) => void;
}

const RangeField = ({
    label,
    value,
    min,
    max,
    unit,
    onChange,
}: {
    label: string;
    value: number;
    min: number;
    max: number;
    unit: string;
    onChange: (v: number) => void;
}) => (
    <div>
        <label className="block text-sm font-medium text-gray-600 mb-2">
            {label}
            <span className="ml-2 text-xs text-gray-400 font-normal">{value}{unit}</span>
        </label>
        <input
            type="range"
            min={min}
            max={max}
            value={value}
            onChange={(e) => onChange(Number(e.target.value))}
            className="w-full accent-primary cursor-pointer"
        />
    </div>
);

export const IconOptions = ({
    padding,
    borderRadius,
    iconBgColor,
    onPaddingChange,
    onBorderRadiusChange,
    onIconBgColorChange,
}: Props) => (
    <div className="mb-8 p-6 bg-white rounded-xl border-2 border-gray-100">
        <h2 className="text-base font-medium text-gray-700 m-0 mb-4">Icon Styling</h2>
        <p className="text-xs text-gray-400 m-0 mb-5">
            Adjust padding, corner rounding, and background color applied to all generated favicon sizes.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <RangeField
                label="Padding"
                value={padding}
                min={0}
                max={40}
                unit="%"
                onChange={onPaddingChange}
            />
            <RangeField
                label="Border Radius"
                value={borderRadius}
                min={0}
                max={50}
                unit="%"
                onChange={onBorderRadiusChange}
            />
            <div>
                <label className="block text-sm font-medium text-gray-600 mb-2">Icon Background</label>
                <div className="flex items-center gap-3">
                    <input
                        type="color"
                        value={iconBgColor || '#ffffff'}
                        onChange={(e) => onIconBgColorChange(e.target.value)}
                        className="w-10 h-10 rounded-lg border border-gray-200 cursor-pointer p-0.5"
                    />
                    <input
                        type="text"
                        value={iconBgColor}
                        onChange={(e) => onIconBgColorChange(e.target.value)}
                        placeholder="transparent"
                        className="px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white w-28 font-mono"
                    />
                    {iconBgColor && (
                        <button
                            type="button"
                            onClick={() => onIconBgColorChange('')}
                            className="text-xs text-gray-400 hover:text-gray-600 border-none bg-transparent cursor-pointer"
                            title="Reset to transparent"
                        >
                            ✕
                        </button>
                    )}
                </div>
            </div>
        </div>
    </div>
);
