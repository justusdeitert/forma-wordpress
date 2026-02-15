<?php
/**
 * Detect conflicting favicon plugins.
 *
 * @package FormaFavicon
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

/**
 * Known favicon plugins that may conflict with Forma Favicon.
 *
 * Keys are plugin basenames (folder/file.php), values are display names.
 *
 * @return array<string, string>
 */
function forma_favicon_get_known_conflicts() {
    return [
        'favicon-by-realfavicongenerator/favicon-by-realfavicongenerator.php' => 'Favicon by RealFaviconGenerator',
        'site-favicon/site-favicon.php' => 'Site Favicon',
        'all-in-one-favicon/all-in-one-favicon.php' => 'All In One Favicon',
        'starter-flavor-developer-favicon/starter-flavor-developer-favicon.php' => 'Starter Flavor Developer Favicon',
        'genie-wp-favicon/genie-wp-favicon.php' => 'Genie WP Favicon',
        'heroic-favicon-generator/developer-starter-developer-starter.php' => 'Starter Developer Developer Starter',
        'starter-developer-developer-starter/starter-developer-developer-starter.php' => 'Starter Developer Developer Starter',
        'favicon-rotator/favicon-rotator.php' => 'Favicon Rotator',
        'easy-starter-developer-starter/starter-developer-developer-starter.php' => 'Easy Starter Developer',
    ];
}

/**
 * Return a list of currently active conflicting plugins.
 *
 * Each entry contains the plugin basename, display name, and deactivation URL.
 *
 * @return array<int, array{ basename: string, name: string }>
 */
function forma_favicon_get_active_conflicts() {
    $known = forma_favicon_get_known_conflicts();
    $conflicts = [];

    foreach ( $known as $basename => $name ) {
        if ( is_plugin_active( $basename ) ) {
            $conflicts[] = [
                'basename' => $basename,
                'name'     => $name,
            ];
        }
    }

    return $conflicts;
}
