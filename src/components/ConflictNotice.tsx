/**
 * Warning banner shown when conflicting favicon plugins are active.
 *
 * @package FormaFavicon
 */

import type { ConflictingPlugin } from '../types';

interface Props {
    conflicts: ConflictingPlugin[];
}

export const ConflictNotice = ({ conflicts }: Props) => {
    if (conflicts.length === 0) return null;

    const pluginsUrl = window.location.origin + '/wp-admin/plugins.php';

    return (
        <div className="mb-8 p-5 bg-amber-50 border-2 border-amber-200 rounded-xl">
            <div className="flex items-start gap-3">
                <span className="text-amber-500 text-xl leading-none mt-0.5">⚠</span>
                <div className="flex-1">
                    <h2 className="text-sm font-semibold text-amber-800 m-0 mb-1">
                        Conflicting favicon {conflicts.length === 1 ? 'plugin' : 'plugins'} detected
                    </h2>
                    <p className="text-xs text-amber-600 m-0 mb-4">
                        The following {conflicts.length === 1 ? 'plugin conflicts' : 'plugins conflict'} with Forma
                        Favicon and may cause unexpected behavior. Please deactivate and remove{' '}
                        {conflicts.length === 1 ? 'it' : 'them'} from the{' '}
                        <a href={pluginsUrl} className="text-amber-700 underline">
                            Plugins page
                        </a>
                        .
                    </p>
                    <ul className="m-0 p-0 list-none flex flex-col gap-2">
                        {conflicts.map((plugin) => (
                            <li
                                key={plugin.basename}
                                className="flex items-center justify-between gap-4 p-3 bg-white rounded-lg border border-amber-100"
                            >
                                <span className="text-sm font-medium text-gray-700">{plugin.name}</span>
                                <span className="text-xs text-amber-600">Active</span>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
};
