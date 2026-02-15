<?php
/**
 * ICO file generator using GD.
 *
 * Combines multiple PNG sizes into a single .ico file.
 *
 * @package FormaFavicon
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

/**
 * Generate an ICO file from existing PNG favicons.
 *
 * @param string $dir_path Absolute path to the favicon directory.
 */
function forma_favicon_generate_ico( $dir_path ) {
    $ico_sizes = [
        $dir_path . '/favicon-16x16.png' => 16,
        $dir_path . '/favicon-32x32.png' => 32,
        $dir_path . '/favicon-48x48.png' => 48,
    ];

    $images = [];

    foreach ( $ico_sizes as $file => $size ) {
        if ( ! file_exists( $file ) ) {
            continue;
        }

        $png_data = file_get_contents( $file );
        if ( $png_data === false ) {
            continue;
        }

        $im = @imagecreatefromstring( $png_data );
        if ( ! $im ) {
            continue;
        }

        $resized = imagecreatetruecolor( $size, $size );
        imagealphablending( $resized, false );
        imagesavealpha( $resized, true );
        $transparent = imagecolorallocatealpha( $resized, 0, 0, 0, 127 );
        imagefill( $resized, 0, 0, $transparent );
        imagecopyresampled( $resized, $im, 0, 0, 0, 0, $size, $size, imagesx( $im ), imagesy( $im ) );

        ob_start();
        imagepng( $resized );
        $png_content = ob_get_clean();

        $images[] = [
            'size' => $size,
            'data' => $png_content,
        ];

        imagedestroy( $im );
        imagedestroy( $resized );
    }

    if ( empty( $images ) ) {
        return;
    }

    $icon_dir_count = count( $images );
    $offset         = 6 + ( 16 * $icon_dir_count );
    $ico            = pack( 'vvv', 0, 1, $icon_dir_count );
    $data_sections  = '';

    foreach ( $images as $img ) {
        $size     = $img['size'] >= 256 ? 0 : $img['size'];
        $data_len = strlen( $img['data'] );
        $ico     .= pack( 'CCCCvvVV', $size, $size, 0, 0, 1, 32, $data_len, $offset );
        $data_sections .= $img['data'];
        $offset        += $data_len;
    }

    $ico .= $data_sections;
    file_put_contents( $dir_path . '/favicon.ico', $ico );
}
