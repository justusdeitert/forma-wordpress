<?php
/**
 * Admin page registration and asset enqueuing.
 *
 * @package FormaFavicon
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

/**
 * Add "Favicon" page under Appearance.
 */
function forma_favicon_admin_menu() {
    $hook = add_theme_page(
        __( 'Favicon', 'forma-favicon' ),
        __( 'Favicon', 'forma-favicon' ),
        'manage_options',
        'forma-favicon',
        'forma_favicon_admin_page'
    );

    if ( $hook ) {
        add_action( 'admin_enqueue_scripts', function ( $current_hook ) use ( $hook ) {
            if ( $current_hook !== $hook ) {
                return;
            }

            forma_favicon_enqueue_admin_assets();
        } );
    }
}
add_action( 'admin_menu', 'forma_favicon_admin_menu' );

/**
 * Enqueue scripts and styles for the admin page.
 */
function forma_favicon_enqueue_admin_assets() {
    $asset_dir  = FORMA_FAVICON_DIR . 'build/';
    $asset_uri  = FORMA_FAVICON_URL . 'build/';
    $asset_file = $asset_dir . 'admin-favicon.asset.php';
    $asset      = file_exists( $asset_file )
        ? require $asset_file
        : [ 'dependencies' => [], 'version' => FORMA_FAVICON_VERSION ];

    wp_enqueue_media();

    wp_enqueue_script(
        'forma-favicon-admin',
        $asset_uri . 'admin-favicon.js',
        array_merge( $asset['dependencies'], [ 'media-editor' ] ),
        $asset['version'],
        true
    );

    wp_enqueue_style(
        'forma-favicon-admin',
        $asset_uri . 'admin-favicon.css',
        [],
        $asset['version']
    );

    $option      = get_option( 'forma_favicon', [] );
    $favicon_dir = forma_favicon_get_dir();
    $source_url  = '';

    if ( ! empty( $option['source_id'] ) ) {
        $source_url = wp_get_attachment_image_url( $option['source_id'], 'medium' );
    }

    wp_add_inline_script( 'forma-favicon-admin', 'window.formaFaviconAdmin = ' . wp_json_encode( [
        'nonce'      => wp_create_nonce( 'wp_rest' ),
        'restUrl'    => rest_url( 'forma-favicon/v1/' ),
        'faviconUrl' => $favicon_dir['url'],
        'sourceUrl'  => $source_url,
        'option'     => $option,
    ] ) . ';', 'before' );
}

/**
 * Render the admin page container.
 */
function forma_favicon_admin_page() {
    ?>
    <div class="wrap">
        <div id="forma-favicon-app"></div>
    </div>
    <style>
        #wpbody-content > .notice.inline { display: inline-block; }
        #forma-favicon-app * { box-sizing: border-box; }
        #forma-favicon-app button:focus { outline: none; box-shadow: none; }
    </style>
    <?php
}
