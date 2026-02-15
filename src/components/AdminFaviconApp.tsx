/**
 * Root component for the Favicon admin page.
 *
 * @package FormaFavicon
 */

import { useState } from '@wordpress/element';
import { useFavicon } from '../hooks/use-favicon';
import { getWindowData } from '../utils/get-data';
import { ConflictNotice } from './ConflictNotice';
import { Notice } from './Notice';
import { SourceImage } from './SourceImage';
import { ColorPickers } from './ColorPickers';
import { Actions } from './Actions';
import { DeleteModal } from './DeleteModal';
import { Preview } from './Preview';

export const AdminFaviconApp = () => {
    const {
        sourceId,
        sourceUrl,
        generated,
        themeColor,
        bgColor,
        saving,
        deleting,
        notice,
        cacheBuster,
        faviconUrl,
        setThemeColor,
        setBgColor,
        openMediaLibrary,
        generate,
        deleteFavicons,
    } = useFavicon();

    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const { conflicts } = getWindowData();

    return (
        <div className="max-w-4xl">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-2xl font-semibold text-gray-900 m-0 mb-2">Favicon</h1>
                <p className="text-sm text-gray-500 m-0">
                    Upload a source image (at least 512×512 px) and generate all favicon sizes including ICO, Apple
                    Touch Icon, Android Chrome icons, and web manifest.
                </p>
            </div>

            <ConflictNotice conflicts={conflicts} />

            {notice && <Notice notice={notice} />}

            <SourceImage sourceUrl={sourceUrl} onSelect={openMediaLibrary} />

            {sourceId > 0 && (
                <ColorPickers
                    themeColor={themeColor}
                    bgColor={bgColor}
                    onThemeColorChange={setThemeColor}
                    onBgColorChange={setBgColor}
                />
            )}

            {sourceId > 0 && (
                <Actions
                    generated={generated}
                    saving={saving}
                    deleting={deleting}
                    onGenerate={generate}
                    onDelete={() => setShowDeleteModal(true)}
                />
            )}

            {showDeleteModal && (
                <DeleteModal
                    deleting={deleting}
                    onConfirm={() => {
                        setShowDeleteModal(false);
                        deleteFavicons();
                    }}
                    onCancel={() => setShowDeleteModal(false)}
                />
            )}

            {generated && <Preview faviconUrl={faviconUrl} cacheBuster={cacheBuster} />}
        </div>
    );
};
