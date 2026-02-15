/**
 * Warning banner shown when conflicting favicon plugins are active.
 *
 * @package FormaFavicon
 */

import { useState } from '@wordpress/element';
import type { ConflictingPlugin } from '../types';
import { getWindowData } from '../utils/get-data';

type PluginStatus = 'active' | 'deactivating' | 'inactive' | 'deleting' | 'deleted';

interface Props {
    conflicts: ConflictingPlugin[];
}

export const ConflictNotice = ({ conflicts }: Props) => {
    const [statuses, setStatuses] = useState<Record<string, PluginStatus>>(() =>
        Object.fromEntries(conflicts.map((p) => [p.basename, 'active']))
    );

    const data = getWindowData();

    if (conflicts.length === 0) return null;

    const visibleConflicts = conflicts.filter((p) => statuses[p.basename] !== 'deleted');
    if (visibleConflicts.length === 0) return null;

    const handleDeactivate = async (basename: string) => {
        setStatuses((s) => ({ ...s, [basename]: 'deactivating' }));

        try {
            const res = await fetch(data.restUrl + 'conflict/deactivate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'X-WP-Nonce': data.nonce },
                body: JSON.stringify({ plugin: basename }),
            });
            const json = await res.json();

            if (res.ok && json.success) {
                setStatuses((s) => ({ ...s, [basename]: 'inactive' }));
            } else {
                setStatuses((s) => ({ ...s, [basename]: 'active' }));
            }
        } catch {
            setStatuses((s) => ({ ...s, [basename]: 'active' }));
        }
    };

    const handleDelete = async (basename: string) => {
        setStatuses((s) => ({ ...s, [basename]: 'deleting' }));

        try {
            const res = await fetch(data.restUrl + 'conflict/delete', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'X-WP-Nonce': data.nonce },
                body: JSON.stringify({ plugin: basename }),
            });
            const json = await res.json();

            if (res.ok && json.success) {
                setStatuses((s) => ({ ...s, [basename]: 'deleted' }));
            } else {
                setStatuses((s) => ({ ...s, [basename]: 'inactive' }));
            }
        } catch {
            setStatuses((s) => ({ ...s, [basename]: 'inactive' }));
        }
    };

    return (
        <div className="mb-8 p-5 bg-amber-50 border-2 border-amber-200 rounded-xl">
            <div className="flex items-start gap-3">
                <span className="text-amber-500 text-xl leading-none mt-0.5">⚠</span>
                <div className="flex-1">
                    <h2 className="text-sm font-semibold text-amber-800 m-0 mb-1">
                        Conflicting favicon {visibleConflicts.length === 1 ? 'plugin' : 'plugins'} detected
                    </h2>
                    <p className="text-xs text-amber-600 m-0 mb-4">
                        The following {visibleConflicts.length === 1 ? 'plugin conflicts' : 'plugins conflict'} with
                        Forma Favicon and may cause unexpected behavior. We recommend deactivating and removing{' '}
                        {visibleConflicts.length === 1 ? 'it' : 'them'}.
                    </p>
                    <ul className="m-0 p-0 list-none flex flex-col gap-2">
                        {visibleConflicts.map((plugin) => {
                            const status = statuses[plugin.basename];

                            return (
                                <li
                                    key={plugin.basename}
                                    className="flex items-center justify-between gap-4 p-3 bg-white rounded-lg border border-amber-100"
                                >
                                    <span className="text-sm font-medium text-gray-700">{plugin.name}</span>
                                    <div className="flex items-center gap-2">
                                        {status === 'active' && (
                                            <button
                                                type="button"
                                                onClick={() => handleDeactivate(plugin.basename)}
                                                className="inline-flex items-center px-3 py-1.5 rounded-md text-xs font-medium bg-amber-100 text-amber-700 border-none cursor-pointer hover:bg-amber-200 transition-colors"
                                            >
                                                Deactivate
                                            </button>
                                        )}
                                        {status === 'deactivating' && (
                                            <span className="text-xs text-amber-600">Deactivating…</span>
                                        )}
                                        {status === 'inactive' && (
                                            <>
                                                <span className="text-xs text-green-600">Deactivated ✓</span>
                                                <button
                                                    type="button"
                                                    onClick={() => handleDelete(plugin.basename)}
                                                    className="inline-flex items-center px-3 py-1.5 rounded-md text-xs font-medium bg-red-100 text-red-700 border-none cursor-pointer hover:bg-red-200 transition-colors"
                                                >
                                                    Delete
                                                </button>
                                            </>
                                        )}
                                        {status === 'deleting' && (
                                            <span className="text-xs text-red-600">Deleting…</span>
                                        )}
                                    </div>
                                </li>
                            );
                        })}
                    </ul>
                </div>
            </div>
        </div>
    );
};
