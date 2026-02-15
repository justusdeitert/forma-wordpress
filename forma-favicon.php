<?php
/**
 * Plugin Name:  Forma Favicon
 * Description:  Favicon generator — upload a source image, configure colors, and generate all favicon sizes + ICO file.
 * Version:      1.0.0
 * Author:       Forma
 * Text Domain:  forma-favicon
 * License:      GPL-2.0-or-later
 *
 * @package FormaFavicon
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

define( 'FORMA_FAVICON_VERSION', '1.0.0' );
define( 'FORMA_FAVICON_DIR', plugin_dir_path( __FILE__ ) );
define( 'FORMA_FAVICON_URL', plugin_dir_url( __FILE__ ) );

/* ─────────────────────────────── Option ─────────────────────────────── */

function forma_favicon_register_setting() {
    register_setting( 'forma_favicon_group', 'forma_favicon', [
        'type'              => 'object',
        'default'           => [],
        'show_in_rest'      => [
            'schema' => [
                'type'       => 'object',
                'properties' => [
                    'source_id'   => [ 'type' => 'integer' ],
                    'generated'   => [ 'type' => 'boolean' ],
                    'theme_color' => [ 'type' => 'string' ],
                    'bg_color'    => [ 'type' => 'string' ],
                ],
            ],
        ],
        'sanitize_callback' => 'forma_favicon_sanitize',
    ] );
}
add_action( 'init', 'forma_favicon_register_setting' );

function forma_favicon_sanitize( $value ) {
    if ( ! is_array( $value ) ) return [];
    return [
        'source_id'   => isset( $value['source_id'] )   ? absint( $value['source_id'] )              : 0,
        'generated'   => isset( $value['generated'] )    ? (bool) $value['generated']                 : false,
        'theme_color' => isset( $value['theme_color'] )  ? sanitize_hex_color( $value['theme_color'] ) : '#ffffff',
        'bg_color'    => isset( $value['bg_color'] )     ? sanitize_hex_color( $value['bg_color'] )    : '#ffffff',
    ];
}

/* ─────────────────────────────── Helpers ─────────────────────────────── */

function forma_favicon_get_dir() {
    $upload_dir = wp_upload_dir();
    return [
        'path' => $upload_dir['basedir'] . '/favicon',
        'url'  => $upload_dir['baseurl'] . '/favicon',
    ];
}

/* ─────────────────────────────── REST API ─────────────────────────────── */

function forma_favicon_register_rest_routes() {
    register_rest_route( 'forma-favicon/v1', '/generate', [
        'methods'             => 'POST',
        'callback'            => 'forma_favicon_generate',
        'permission_callback' => function () { return current_user_can( 'manage_options' ); },
        'args'                => [
            'attachment_id' => [ 'required' => false, 'type' => 'integer',  'sanitize_callback' => 'absint' ],
            'source_data'   => [ 'required' => false, 'type' => 'string',  'description' => 'Base64-encoded PNG data (client-side SVG rasterization)' ],
            'theme_color'   => [ 'type' => 'string', 'default' => '#ffffff', 'sanitize_callback' => 'sanitize_hex_color' ],
            'bg_color'      => [ 'type' => 'string', 'default' => '#ffffff', 'sanitize_callback' => 'sanitize_hex_color' ],
        ],
    ] );

    register_rest_route( 'forma-favicon/v1', '/delete', [
        'methods'             => 'POST',
        'callback'            => 'forma_favicon_delete',
        'permission_callback' => function () { return current_user_can( 'manage_options' ); },
    ] );
}
add_action( 'rest_api_init', 'forma_favicon_register_rest_routes' );

/* ─── Generate ─── */

function forma_favicon_generate( WP_REST_Request $request ) {
    $attachment_id = $request->get_param( 'attachment_id' );
    $source_data   = $request->get_param( 'source_data' );
    $theme_color   = $request->get_param( 'theme_color' ) ?: '#ffffff';
    $bg_color      = $request->get_param( 'bg_color' )    ?: '#ffffff';

    $favicon_dir = forma_favicon_get_dir();
    $dir_path    = $favicon_dir['path'];

    if ( ! wp_mkdir_p( $dir_path ) ) {
        return new WP_Error( 'dir_error', 'Could not create favicon directory.', [ 'status' => 500 ] );
    }

    $sizes = [
        'favicon-16x16.png'          => 16,
        'favicon-32x32.png'          => 32,
        'favicon-48x48.png'          => 48,
        'apple-touch-icon.png'       => 180,
        'android-chrome-192x192.png' => 192,
        'android-chrome-512x512.png' => 512,
    ];

    $source_image = null;

    if ( ! empty( $source_data ) ) {
        if ( strpos( $source_data, 'data:' ) === 0 ) {
            $source_data = preg_replace( '/^data:image\/\w+;base64,/', '', $source_data );
        }
        $decoded = base64_decode( $source_data );
        if ( $decoded ) {
            $source_image = @imagecreatefromstring( $decoded );
        }
    } elseif ( $attachment_id ) {
        $source_path = get_attached_file( $attachment_id );
        if ( ! $source_path || ! file_exists( $source_path ) ) {
            return new WP_Error( 'invalid_image', 'Source image not found.', [ 'status' => 400 ] );
        }
        $mime    = wp_check_filetype( $source_path );
        $allowed = [ 'image/png', 'image/jpeg', 'image/gif', 'image/webp' ];
        if ( ! in_array( $mime['type'], $allowed, true ) ) {
            return new WP_Error( 'invalid_type', 'File must be a PNG, JPEG, GIF, or WebP image.', [ 'status' => 400 ] );
        }
        $img_info = @getimagesize( $source_path );
        if ( $img_info ) {
            switch ( $img_info[2] ) {
                case IMAGETYPE_PNG:  $source_image = @imagecreatefrompng( $source_path );  break;
                case IMAGETYPE_JPEG: $source_image = @imagecreatefromjpeg( $source_path ); break;
                case IMAGETYPE_GIF:  $source_image = @imagecreatefromgif( $source_path );  break;
                case IMAGETYPE_WEBP: $source_image = @imagecreatefromwebp( $source_path ); break;
            }
        }
    } else {
        return new WP_Error( 'no_source', 'No source image provided.', [ 'status' => 400 ] );
    }

    if ( ! $source_image ) {
        return new WP_Error( 'gd_error', 'Could not load source image. Ensure GD is installed and the image is valid.', [ 'status' => 500 ] );
    }

    $src_w = imagesx( $source_image );
    $src_h = imagesy( $source_image );

    foreach ( $sizes as $filename => $size ) {
        $resized = imagecreatetruecolor( $size, $size );
        imagealphablending( $resized, false );
        imagesavealpha( $resized, true );
        $transparent = imagecolorallocatealpha( $resized, 0, 0, 0, 127 );
        imagefill( $resized, 0, 0, $transparent );
        imagecopyresampled( $resized, $source_image, 0, 0, 0, 0, $size, $size, $src_w, $src_h );
        imagepng( $resized, $dir_path . '/' . $filename, 9 );
        imagedestroy( $resized );
    }

    imagedestroy( $source_image );

    // ICO file
    forma_favicon_generate_ico( $dir_path );

    // Web manifest
    $manifest = [
        'name'             => get_bloginfo( 'name' ),
        'short_name'       => get_bloginfo( 'name' ),
        'icons'            => [
            [ 'src' => 'android-chrome-192x192.png', 'sizes' => '192x192', 'type' => 'image/png' ],
            [ 'src' => 'android-chrome-512x512.png', 'sizes' => '512x512', 'type' => 'image/png' ],
        ],
        'theme_color'      => $theme_color,
        'background_color' => $bg_color,
        'display'          => 'standalone',
    ];
    file_put_contents( $dir_path . '/site.webmanifest', wp_json_encode( $manifest, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES ) );

    // Browser config
    $browserconfig = '<?xml version="1.0" encoding="utf-8"?>' . "\n"
        . '<browserconfig><msapplication><tile>' . "\n"
        . '<square150x150logo src="android-chrome-192x192.png"/>' . "\n"
        . '<TileColor>' . esc_attr( $bg_color ) . '</TileColor>' . "\n"
        . '</tile></msapplication></browserconfig>';
    file_put_contents( $dir_path . '/browserconfig.xml', $browserconfig );

    update_option( 'forma_favicon', [
        'source_id'   => $attachment_id,
        'generated'   => true,
        'theme_color' => $theme_color,
        'bg_color'    => $bg_color,
    ] );

    return rest_ensure_response( [
        'success' => true,
        'files'   => array_keys( $sizes ),
        'url'     => $favicon_dir['url'],
    ] );
}

/* ─── Delete ─── */

function forma_favicon_delete() {
    $favicon_dir = forma_favicon_get_dir();
    $dir_path    = $favicon_dir['path'];

    if ( is_dir( $dir_path ) ) {
        $files = glob( $dir_path . '/*' );
        foreach ( $files as $file ) {
            if ( is_file( $file ) ) unlink( $file );
        }
        rmdir( $dir_path );
    }

    update_option( 'forma_favicon', [
        'source_id'   => 0,
        'generated'   => false,
        'theme_color' => '#ffffff',
        'bg_color'    => '#ffffff',
    ] );

    return rest_ensure_response( [ 'success' => true ] );
}

/* ─── ICO generator ─── */

function forma_favicon_generate_ico( $dir_path ) {
    $ico_sizes = [
        $dir_path . '/favicon-16x16.png' => 16,
        $dir_path . '/favicon-32x32.png' => 32,
        $dir_path . '/favicon-48x48.png' => 48,
    ];

    $images = [];
    foreach ( $ico_sizes as $file => $size ) {
        if ( ! file_exists( $file ) ) continue;
        $png_data = file_get_contents( $file );
        if ( $png_data === false ) continue;
        $im = @imagecreatefromstring( $png_data );
        if ( ! $im ) continue;

        $resized = imagecreatetruecolor( $size, $size );
        imagealphablending( $resized, false );
        imagesavealpha( $resized, true );
        $transparent = imagecolorallocatealpha( $resized, 0, 0, 0, 127 );
        imagefill( $resized, 0, 0, $transparent );
        imagecopyresampled( $resized, $im, 0, 0, 0, 0, $size, $size, imagesx( $im ), imagesy( $im ) );

        ob_start();
        imagepng( $resized );
        $png_content = ob_get_clean();

        $images[] = [ 'size' => $size, 'data' => $png_content ];
        imagedestroy( $im );
        imagedestroy( $resized );
    }

    if ( empty( $images ) ) return;

    $icon_dir_count = count( $images );
    $offset         = 6 + ( 16 * $icon_dir_count );
    $ico            = pack( 'vvv', 0, 1, $icon_dir_count );
    $data_sections  = '';

    foreach ( $images as $img ) {
        $size     = $img['size'] >= 256 ? 0 : $img['size'];
        $data_len = strlen( $img['data'] );
        $ico .= pack( 'CCCCvvVV', $size, $size, 0, 0, 1, 32, $data_len, $offset );
        $data_sections .= $img['data'];
        $offset += $data_len;
    }

    $ico .= $data_sections;
    file_put_contents( $dir_path . '/favicon.ico', $ico );
}

/* ─────────────────────────────── Admin Page ─────────────────────────────── */

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
            if ( $current_hook !== $hook ) return;

            $asset_dir = FORMA_FAVICON_DIR . 'build/';
            $asset_uri = FORMA_FAVICON_URL . 'build/';
            $asset_file = $asset_dir . 'admin-favicon.asset.php';
            $asset = file_exists( $asset_file )
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

            $option     = get_option( 'forma_favicon', [] );
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
        } );
    }
}
add_action( 'admin_menu', 'forma_favicon_admin_menu' );

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

/* ─────────────────────────────── Frontend Head Tags ─────────────────────────────── */

function forma_favicon_output_tags() {
    $option = get_option( 'forma_favicon', [] );
    if ( empty( $option['generated'] ) ) return;

    $favicon_dir = forma_favicon_get_dir();
    $url  = $favicon_dir['url'];
    $path = $favicon_dir['path'];

    if ( ! is_dir( $path ) ) return;

    if ( file_exists( $path . '/favicon.ico' ) )
        echo '<link rel="icon" type="image/x-icon" href="' . esc_url( $url . '/favicon.ico' ) . '">' . "\n";
    if ( file_exists( $path . '/favicon-32x32.png' ) )
        echo '<link rel="icon" type="image/png" sizes="32x32" href="' . esc_url( $url . '/favicon-32x32.png' ) . '">' . "\n";
    if ( file_exists( $path . '/favicon-16x16.png' ) )
        echo '<link rel="icon" type="image/png" sizes="16x16" href="' . esc_url( $url . '/favicon-16x16.png' ) . '">' . "\n";
    if ( file_exists( $path . '/apple-touch-icon.png' ) )
        echo '<link rel="apple-touch-icon" sizes="180x180" href="' . esc_url( $url . '/apple-touch-icon.png' ) . '">' . "\n";
    if ( file_exists( $path . '/site.webmanifest' ) )
        echo '<link rel="manifest" href="' . esc_url( $url . '/site.webmanifest' ) . '">' . "\n";

    $theme_color = ! empty( $option['theme_color'] ) ? $option['theme_color'] : '#ffffff';
    echo '<meta name="theme-color" content="' . esc_attr( $theme_color ) . '">' . "\n";
    echo '<meta name="msapplication-TileColor" content="' . esc_attr( ! empty( $option['bg_color'] ) ? $option['bg_color'] : '#ffffff' ) . '">' . "\n";
}
add_action( 'wp_head', 'forma_favicon_output_tags', 1 );

function forma_favicon_disable_default_site_icon() {
    $option = get_option( 'forma_favicon', [] );
    if ( ! empty( $option['generated'] ) ) {
        remove_action( 'wp_head', 'wp_site_icon', 99 );
    }
}
add_action( 'wp_head', 'forma_favicon_disable_default_site_icon', 0 );

/* ─────────────────────────────── Migration ─────────────────────────────── */

/**
 * One-time migration: copy the old theme_favicon option to the new forma_favicon option.
 */
function forma_favicon_maybe_migrate() {
    if ( get_option( 'forma_favicon_migrated' ) ) return;

    $old = get_option( 'theme_favicon', [] );
    if ( ! empty( $old ) && ! empty( $old['generated'] ) ) {
        update_option( 'forma_favicon', $old );
    }

    update_option( 'forma_favicon_migrated', true );
}
add_action( 'admin_init', 'forma_favicon_maybe_migrate' );
