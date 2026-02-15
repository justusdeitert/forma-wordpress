/**
 * Root component for the Favicon admin page.
 *
 * @package FormaFavicon
 */

import { useState } from '@wordpress/element';
import { useFavicon } from '../hooks/use-favicon';
import { useFaviconPreview } from '../hooks/use-favicon-preview';
import { getWindowData } from '../utils/get-data';
import { ConflictNotice } from './ConflictNotice';
import { SiteIconNotice } from './SiteIconNotice';
import { Notice } from './Notice';
import { SourceImage } from './SourceImage';
import { ColorPickers } from './ColorPickers';
import { IconOptions } from './IconOptions';
import { Actions } from './Actions';
import { DeleteModal } from './DeleteModal';
import { BrowserTabPreview } from './BrowserTabPreview';
import { Preview } from './Preview';

export const AdminFaviconApp = () => {
    const {
        sourceId,
        sourceUrl,
        generated,
        themeColor,
        bgColor,
        padding,
        borderRadius,
        iconBgColor,
        saving,
        deleting,
        notice,
        cacheBuster,
        faviconUrl,
        hasUnsavedChanges,
        setThemeColor,
        setBgColor,
        setPadding,
        setBorderRadius,
        setIconBgColor,
        openMediaLibrary,
        generate,
        deleteFavicons,
    } = useFavicon();

    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const { conflicts } = getWindowData();

    const livePreviewUrl = useFaviconPreview({
        sourceUrl,
        padding,
        borderRadius,
        iconBgColor,
    });

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

            {generated && <SiteIconNotice />}

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
                <IconOptions
                    padding={padding}
                    borderRadius={borderRadius}
                    iconBgColor={iconBgColor}
                    onPaddingChange={setPadding}
                    onBorderRadiusChange={setBorderRadius}
                    onIconBgColorChange={setIconBgColor}
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

            {sourceId > 0 && (
                <BrowserTabPreview
                    faviconUrl={faviconUrl}
                    cacheBuster={cacheBuster}
                    livePreviewUrl={hasUnsavedChanges || !generated ? livePreviewUrl : undefined}
                    unsaved={hasUnsavedChanges}
                />
            )}

            {generated && <Preview faviconUrl={faviconUrl} cacheBuster={cacheBuster} />}
        </div>
    );
};
