<?php
/**
 * REST API endpoints for generating and deleting favicons.
 *
 * @package FormaFavicon
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

/**
 * Register REST routes.
 */
function forma_favicon_register_rest_routes() {
    register_rest_route( 'forma-favicon/v1', '/generate', [
        'methods'             => 'POST',
        'callback'            => 'forma_favicon_generate',
        'permission_callback' => function () {
            return current_user_can( 'manage_options' );
        },
        'args'                => [
            'attachment_id' => [
                'required'          => false,
                'type'              => 'integer',
                'sanitize_callback' => 'absint',
            ],
            'source_data'   => [
                'required'    => false,
                'type'        => 'string',
                'description' => 'Base64-encoded PNG data (client-side SVG rasterization)',
            ],
            'theme_color'   => [
                'type'              => 'string',
                'default'           => '#ffffff',
                'sanitize_callback' => 'sanitize_hex_color',
            ],
            'bg_color'      => [
                'type'              => 'string',
                'default'           => '#ffffff',
                'sanitize_callback' => 'sanitize_hex_color',
            ],
        ],
    ] );

    register_rest_route( 'forma-favicon/v1', '/delete', [
        'methods'             => 'POST',
        'callback'            => 'forma_favicon_delete',
        'permission_callback' => function () {
            return current_user_can( 'manage_options' );
        },
    ] );
}
add_action( 'rest_api_init', 'forma_favicon_register_rest_routes' );

/* ─────────────────────────── Favicon sizes ─────────────────────────── */

/**
 * All PNG sizes that get generated.
 */
function forma_favicon_get_sizes() {
    return [
        'favicon-16x16.png'          => 16,
        'favicon-32x32.png'          => 32,
        'favicon-48x48.png'          => 48,
        'apple-touch-icon.png'       => 180,
        'android-chrome-192x192.png' => 192,
        'android-chrome-512x512.png' => 512,
    ];
}

/* ─────────────────────────── Generate ─────────────────────────── */

/**
 * Generate all favicon files from the uploaded source image.
 *
 * @param WP_REST_Request $request REST request object.
 * @return WP_REST_Response|WP_Error
 */
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

    $source_image = forma_favicon_load_source( $attachment_id, $source_data );

    if ( is_wp_error( $source_image ) ) {
        return $source_image;
    }

    forma_favicon_resize_all( $source_image, $dir_path );
    imagedestroy( $source_image );

    forma_favicon_generate_ico( $dir_path );
    forma_favicon_write_manifest( $dir_path, $theme_color, $bg_color );
    forma_favicon_write_browserconfig( $dir_path, $bg_color );

    update_option( 'forma_favicon', [
        'source_id'   => $attachment_id,
        'generated'   => true,
        'theme_color' => $theme_color,
        'bg_color'    => $bg_color,
    ] );

    return rest_ensure_response( [
        'success' => true,
        'files'   => array_keys( forma_favicon_get_sizes() ),
        'url'     => $favicon_dir['url'],
    ] );
}

/* ─────────────────────────── Source loading ─────────────────────────── */

/**
 * Load a GD image resource from attachment or base64 data.
 *
 * @param int|null    $attachment_id WordPress attachment ID.
 * @param string|null $source_data   Base64-encoded PNG data.
 * @return resource|GdImage|WP_Error
 */
function forma_favicon_load_source( $attachment_id, $source_data ) {
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

    return $source_image;
}

/* ─────────────────────────── Resizing ─────────────────────────── */

/**
 * Resize source image to all required favicon sizes.
 *
 * @param resource|GdImage $source_image GD image resource.
 * @param string           $dir_path     Output directory.
 */
function forma_favicon_resize_all( $source_image, $dir_path ) {
    $src_w = imagesx( $source_image );
    $src_h = imagesy( $source_image );

    foreach ( forma_favicon_get_sizes() as $filename => $size ) {
        $resized = imagecreatetruecolor( $size, $size );
        imagealphablending( $resized, false );
        imagesavealpha( $resized, true );
        $transparent = imagecolorallocatealpha( $resized, 0, 0, 0, 127 );
        imagefill( $resized, 0, 0, $transparent );
        imagecopyresampled( $resized, $source_image, 0, 0, 0, 0, $size, $size, $src_w, $src_h );
        imagepng( $resized, $dir_path . '/' . $filename, 9 );
        imagedestroy( $resized );
    }
}

/* ─────────────────────────── Manifest / Config files ─────────────────────────── */

/**
 * Write site.webmanifest.
 *
 * @param string $dir_path    Output directory.
 * @param string $theme_color Theme color hex.
 * @param string $bg_color    Background color hex.
 */
function forma_favicon_write_manifest( $dir_path, $theme_color, $bg_color ) {
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

    file_put_contents(
        $dir_path . '/site.webmanifest',
        wp_json_encode( $manifest, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES )
    );
}

/**
 * Write browserconfig.xml.
 *
 * @param string $dir_path Output directory.
 * @param string $bg_color Background color hex.
 */
function forma_favicon_write_browserconfig( $dir_path, $bg_color ) {
    $xml = '<?xml version="1.0" encoding="utf-8"?>' . "\n"
        . '<browserconfig><msapplication><tile>' . "\n"
        . '<square150x150logo src="android-chrome-192x192.png"/>' . "\n"
        . '<TileColor>' . esc_attr( $bg_color ) . '</TileColor>' . "\n"
        . '</tile></msapplication></browserconfig>';

    file_put_contents( $dir_path . '/browserconfig.xml', $xml );
}

/* ─────────────────────────── Delete ─────────────────────────── */

/**
 * Delete all generated favicon files and reset the option.
 *
 * @return WP_REST_Response
 */
function forma_favicon_delete() {
    $favicon_dir = forma_favicon_get_dir();
    $dir_path    = $favicon_dir['path'];

    if ( is_dir( $dir_path ) ) {
        $files = glob( $dir_path . '/*' );
        foreach ( $files as $file ) {
            if ( is_file( $file ) ) {
                unlink( $file );
            }
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
