<?php
/**
 * One-time migration from legacy theme_favicon option.
 *
 * @package FormaFavicon
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

/**
 * Migrate the old theme_favicon option to forma_favicon if needed.
 */
function forma_favicon_maybe_migrate() {
    if ( get_option( 'forma_favicon_migrated' ) ) {
        return;
    }

    $old = get_option( 'theme_favicon', [] );

    if ( ! empty( $old ) && ! empty( $old['generated'] ) ) {
        update_option( 'forma_favicon', $old );
    }

    update_option( 'forma_favicon_migrated', true );
}
add_action( 'admin_init', 'forma_favicon_maybe_migrate' );
