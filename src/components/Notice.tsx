/**
 * Toast-style notice banner.
 *
 * @package FormaFavicon
 */

import type { Notice as NoticeType } from '../types';

interface Props {
    notice: NoticeType;
}

export const Notice = ({ notice }: Props) => (
    <div
        className={[
            'mb-6 px-4 py-3 rounded-lg border text-sm flex items-center gap-2',
            notice.type === 'success'
                ? 'bg-green-50 border-green-200 text-green-700'
                : 'bg-red-50 border-red-200 text-red-700',
        ].join(' ')}
    >
        <span>{notice.type === 'success' ? '✓' : '✕'}</span>
        {notice.message}
    </div>
);
