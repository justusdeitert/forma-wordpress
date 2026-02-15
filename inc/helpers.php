<?php
/**
 * Shared helper functions.
 *
 * @package FormaFavicon
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

/**
 * Get the favicon upload directory path and URL.
 *
 * @return array{ path: string, url: string }
 */
function forma_favicon_get_dir() {
    $upload_dir = wp_upload_dir();

    return [
        'path' => $upload_dir['basedir'] . '/favicon',
        'url'  => $upload_dir['baseurl'] . '/favicon',
    ];
}
