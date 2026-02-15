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
            'padding'       => [
                'type'              => 'integer',
                'default'           => 0,
                'sanitize_callback' => 'absint',
            ],
            'border_radius' => [
                'type'              => 'integer',
                'default'           => 0,
                'sanitize_callback' => 'absint',
            ],
            'icon_bg_color' => [
                'type'              => 'string',
                'default'           => '',
                'sanitize_callback' => 'sanitize_text_field',
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

    register_rest_route( 'forma-favicon/v1', '/conflict/deactivate', [
        'methods'             => 'POST',
        'callback'            => 'forma_favicon_conflict_deactivate',
        'permission_callback' => function () {
            return current_user_can( 'activate_plugins' );
        },
        'args'                => [
            'plugin' => [
                'required'          => true,
                'type'              => 'string',
                'sanitize_callback' => 'sanitize_text_field',
            ],
        ],
    ] );

    register_rest_route( 'forma-favicon/v1', '/conflict/delete', [
        'methods'             => 'POST',
        'callback'            => 'forma_favicon_conflict_delete',
        'permission_callback' => function () {
            return current_user_can( 'delete_plugins' );
        },
        'args'                => [
            'plugin' => [
                'required'          => true,
                'type'              => 'string',
                'sanitize_callback' => 'sanitize_text_field',
            ],
        ],
    ] );

    register_rest_route( 'forma-favicon/v1', '/clear-site-icon', [
        'methods'             => 'POST',
        'callback'            => 'forma_favicon_clear_site_icon',
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
    $padding       = min( 40, max( 0, (int) $request->get_param( 'padding' ) ) );
    $border_radius = min( 50, max( 0, (int) $request->get_param( 'border_radius' ) ) );
    $icon_bg_color = $request->get_param( 'icon_bg_color' ) ?: '';

    $favicon_dir = forma_favicon_get_dir();
    $dir_path    = $favicon_dir['path'];

    if ( ! wp_mkdir_p( $dir_path ) ) {
        return new WP_Error( 'dir_error', 'Could not create favicon directory.', [ 'status' => 500 ] );
    }

    $source_image = forma_favicon_load_source( $attachment_id, $source_data );

    if ( is_wp_error( $source_image ) ) {
        return $source_image;
    }

    forma_favicon_resize_all( $source_image, $dir_path, $padding, $border_radius, $icon_bg_color );
    imagedestroy( $source_image );

    forma_favicon_generate_ico( $dir_path );
    forma_favicon_write_manifest( $dir_path, $theme_color, $bg_color );
    forma_favicon_write_browserconfig( $dir_path, $bg_color );

    update_option( 'forma_favicon', [
        'source_id'     => $attachment_id,
        'generated'     => true,
        'theme_color'   => $theme_color,
        'bg_color'      => $bg_color,
        'padding'       => $padding,
        'border_radius' => $border_radius,
        'icon_bg_color' => $icon_bg_color,
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
 * Supports padding (percentage inset), border radius (percentage corners),
 * and an optional background color behind the icon.
 *
 * @param resource|GdImage $source_image  GD image resource.
 * @param string           $dir_path      Output directory.
 * @param int              $padding       Padding percentage (0–40).
 * @param int              $border_radius Border radius percentage (0–50).
 * @param string           $icon_bg_color Hex background color (empty = transparent).
 */
function forma_favicon_resize_all( $source_image, $dir_path, $padding = 0, $border_radius = 0, $icon_bg_color = '' ) {
    $src_w = imagesx( $source_image );
    $src_h = imagesy( $source_image );

    foreach ( forma_favicon_get_sizes() as $filename => $size ) {
        $canvas = imagecreatetruecolor( $size, $size );
        imagealphablending( $canvas, false );
        imagesavealpha( $canvas, true );
        $transparent = imagecolorallocatealpha( $canvas, 0, 0, 0, 127 );
        imagefill( $canvas, 0, 0, $transparent );

        // Fill background color if set.
        if ( $icon_bg_color ) {
            $bg_rgb = forma_favicon_hex_to_rgb( $icon_bg_color );
            $bg     = imagecolorallocate( $canvas, $bg_rgb[0], $bg_rgb[1], $bg_rgb[2] );
            imagealphablending( $canvas, true );
            imagefilledrectangle( $canvas, 0, 0, $size - 1, $size - 1, $bg );
        }

        // Calculate padding offset.
        $pad_px   = (int) round( $size * $padding / 100 );
        $icon_size = $size - ( $pad_px * 2 );

        if ( $icon_size < 1 ) {
            $icon_size = 1;
            $pad_px    = (int) ( ( $size - 1 ) / 2 );
        }

        imagealphablending( $canvas, true );
        imagecopyresampled( $canvas, $source_image, $pad_px, $pad_px, 0, 0, $icon_size, $icon_size, $src_w, $src_h );

        // Apply border radius mask.
        if ( $border_radius > 0 ) {
            forma_favicon_apply_border_radius( $canvas, $size, $border_radius );
        }

        imagealphablending( $canvas, false );
        imagesavealpha( $canvas, true );
        imagepng( $canvas, $dir_path . '/' . $filename, 9 );
        imagedestroy( $canvas );
    }
}

/**
 * Apply a rounded-corner mask to a GD image.
 *
 * @param resource|GdImage $image         GD image resource (modified in place).
 * @param int              $size          Image width/height in pixels.
 * @param int              $radius_pct    Border radius as percentage (0–50).
 */
function forma_favicon_apply_border_radius( &$image, $size, $radius_pct ) {
    $radius = (int) round( $size * $radius_pct / 100 );

    if ( $radius < 1 ) {
        return;
    }

    // Create a mask image: white = keep, black (transparent) = discard.
    $mask = imagecreatetruecolor( $size, $size );
    imagealphablending( $mask, false );
    imagesavealpha( $mask, true );
    $mask_transparent = imagecolorallocatealpha( $mask, 0, 0, 0, 127 );
    imagefill( $mask, 0, 0, $mask_transparent );

    $white = imagecolorallocate( $mask, 255, 255, 255 );

    // Draw filled rounded rectangle on the mask.
    // Center rectangle (horizontal bar).
    imagefilledrectangle( $mask, $radius, 0, $size - $radius - 1, $size - 1, $white );
    // Left bar.
    imagefilledrectangle( $mask, 0, $radius, $radius - 1, $size - $radius - 1, $white );
    // Right bar.
    imagefilledrectangle( $mask, $size - $radius, $radius, $size - 1, $size - $radius - 1, $white );

    // Four corner arcs.
    $diameter = $radius * 2;
    imagefilledellipse( $mask, $radius, $radius, $diameter, $diameter, $white );                          // top-left
    imagefilledellipse( $mask, $size - $radius - 1, $radius, $diameter, $diameter, $white );              // top-right
    imagefilledellipse( $mask, $radius, $size - $radius - 1, $diameter, $diameter, $white );              // bottom-left
    imagefilledellipse( $mask, $size - $radius - 1, $size - $radius - 1, $diameter, $diameter, $white );  // bottom-right

    // Apply mask: make pixels transparent where mask is not white.
    imagealphablending( $image, false );
    $transparent = imagecolorallocatealpha( $image, 0, 0, 0, 127 );

    for ( $x = 0; $x < $size; $x++ ) {
        for ( $y = 0; $y < $size; $y++ ) {
            $mask_color = imagecolorat( $mask, $x, $y );
            $mask_alpha = ( $mask_color >> 24 ) & 0x7F;

            if ( $mask_alpha > 0 ) {
                imagesetpixel( $image, $x, $y, $transparent );
            }
        }
    }

    imagesavealpha( $image, true );
    imagedestroy( $mask );
}

/**
 * Convert a hex color string to an RGB array.
 *
 * @param string $hex Hex color (e.g. '#ff0000').
 * @return int[] [r, g, b]
 */
function forma_favicon_hex_to_rgb( $hex ) {
    $hex = ltrim( $hex, '#' );

    if ( strlen( $hex ) === 3 ) {
        $hex = $hex[0] . $hex[0] . $hex[1] . $hex[1] . $hex[2] . $hex[2];
    }

    return [
        hexdec( substr( $hex, 0, 2 ) ),
        hexdec( substr( $hex, 2, 2 ) ),
        hexdec( substr( $hex, 4, 2 ) ),
    ];
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
                wp_delete_file( $file );
            }
        }

        global $wp_filesystem;
        if ( ! function_exists( 'WP_Filesystem' ) ) {
            require_once ABSPATH . 'wp-admin/includes/file.php';
        }
        WP_Filesystem();
        $wp_filesystem->rmdir( $dir_path );
    }

    update_option( 'forma_favicon', [
        'source_id'   => 0,
        'generated'   => false,
        'theme_color' => '#ffffff',
        'bg_color'    => '#ffffff',
    ] );

    return rest_ensure_response( [ 'success' => true ] );
}

/* ─────────────────────────── Conflict management ─────────────────────────── */

/**
 * Validate that a plugin basename is in our known conflicts list.
 *
 * @param string $basename Plugin basename.
 * @return true|WP_Error
 */
function forma_favicon_validate_conflict( $basename ) {
    $known = forma_favicon_get_known_conflicts();

    if ( ! isset( $known[ $basename ] ) ) {
        return new WP_Error( 'unknown_plugin', 'Plugin is not in the known conflicts list.', [ 'status' => 400 ] );
    }

    return true;
}

/**
 * Deactivate a conflicting plugin via REST.
 *
 * @param WP_REST_Request $request REST request object.
 * @return WP_REST_Response|WP_Error
 */
function forma_favicon_conflict_deactivate( WP_REST_Request $request ) {
    $basename = $request->get_param( 'plugin' );
    $valid    = forma_favicon_validate_conflict( $basename );

    if ( is_wp_error( $valid ) ) {
        return $valid;
    }

    if ( ! is_plugin_active( $basename ) ) {
        return rest_ensure_response( [ 'success' => true, 'message' => 'Plugin is already inactive.' ] );
    }

    deactivate_plugins( $basename );

    if ( is_plugin_active( $basename ) ) {
        return new WP_Error( 'deactivation_failed', 'Could not deactivate the plugin.', [ 'status' => 500 ] );
    }

    return rest_ensure_response( [ 'success' => true ] );
}

/**
 * Delete a conflicting plugin via REST (must be inactive).
 *
 * @param WP_REST_Request $request REST request object.
 * @return WP_REST_Response|WP_Error
 */
function forma_favicon_conflict_delete( WP_REST_Request $request ) {
    $basename = $request->get_param( 'plugin' );
    $valid    = forma_favicon_validate_conflict( $basename );

    if ( is_wp_error( $valid ) ) {
        return $valid;
    }

    if ( is_plugin_active( $basename ) ) {
        return new WP_Error( 'still_active', 'Deactivate the plugin before deleting it.', [ 'status' => 400 ] );
    }

    $result = delete_plugins( [ $basename ] );

    if ( is_wp_error( $result ) ) {
        return $result;
    }

    return rest_ensure_response( [ 'success' => true ] );
}

/* ─────────────────────────── WordPress Site Icon ─────────────────────────── */

/**
 * Clear the WordPress built-in site icon.
 *
 * @return WP_REST_Response
 */
function forma_favicon_clear_site_icon() {
    delete_option( 'site_icon' );

    return rest_ensure_response( [ 'success' => true ] );
}
