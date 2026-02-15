<?php
/**
 * Frontend <head> tag output.
 *
 * @package FormaFavicon
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

/**
 * Output favicon link/meta tags in <head>.
 */
function forma_favicon_output_tags() {
    $option = get_option( 'forma_favicon', [] );

    if ( empty( $option['generated'] ) ) {
        return;
    }

    $favicon_dir = forma_favicon_get_dir();
    $url         = $favicon_dir['url'];
    $path        = $favicon_dir['path'];

    if ( ! is_dir( $path ) ) {
        return;
    }

    $link_tags = [
        [ 'file' => 'favicon.ico',    'rel' => 'icon', 'type' => 'image/x-icon', 'sizes' => '' ],
        [ 'file' => 'favicon-32x32.png', 'rel' => 'icon', 'type' => 'image/png', 'sizes' => '32x32' ],
        [ 'file' => 'favicon-16x16.png', 'rel' => 'icon', 'type' => 'image/png', 'sizes' => '16x16' ],
        [ 'file' => 'apple-touch-icon.png', 'rel' => 'apple-touch-icon', 'type' => '', 'sizes' => '180x180' ],
        [ 'file' => 'site.webmanifest', 'rel' => 'manifest', 'type' => '', 'sizes' => '' ],
    ];

    foreach ( $link_tags as $tag ) {
        if ( ! file_exists( $path . '/' . $tag['file'] ) ) {
            continue;
        }

        $attrs = 'rel="' . esc_attr( $tag['rel'] ) . '"';
        if ( $tag['type'] )  $attrs .= ' type="' . esc_attr( $tag['type'] ) . '"';
        if ( $tag['sizes'] ) $attrs .= ' sizes="' . esc_attr( $tag['sizes'] ) . '"';
        $attrs .= ' href="' . esc_url( $url . '/' . $tag['file'] ) . '"';

        // Each attribute value is already escaped above via esc_attr/esc_url.
        echo '<link ' . wp_kses_post( $attrs ) . '>' . "\n";
    }

    $theme_color = ! empty( $option['theme_color'] ) ? $option['theme_color'] : '#ffffff';
    $bg_color    = ! empty( $option['bg_color'] )    ? $option['bg_color']    : '#ffffff';

    echo '<meta name="theme-color" content="' . esc_attr( $theme_color ) . '">' . "\n";
    echo '<meta name="msapplication-TileColor" content="' . esc_attr( $bg_color ) . '">' . "\n";
}
add_action( 'wp_head', 'forma_favicon_output_tags', 1 );
add_action( 'admin_head', 'forma_favicon_output_tags', 1 );
add_action( 'login_head', 'forma_favicon_output_tags', 1 );

/**
 * Disable the default WordPress site icon when our favicons are active.
 */
function forma_favicon_disable_default_site_icon() {
    $option = get_option( 'forma_favicon', [] );

    if ( ! empty( $option['generated'] ) ) {
        remove_action( 'wp_head', 'wp_site_icon', 99 );
        remove_action( 'admin_head', 'wp_site_icon', 99 );
        remove_action( 'login_head', 'wp_site_icon', 99 );
    }
}
add_action( 'wp_head', 'forma_favicon_disable_default_site_icon', 0 );
add_action( 'admin_head', 'forma_favicon_disable_default_site_icon', 0 );
add_action( 'login_head', 'forma_favicon_disable_default_site_icon', 0 );

/**
 * Show admin notice on Settings → General pointing to Forma Favicon.
 */
function forma_favicon_general_settings_notice() {
    $screen = get_current_screen();

    if ( ! $screen || $screen->id !== 'options-general' ) {
        return;
    }

    $option = get_option( 'forma_favicon', [] );

    if ( empty( $option['generated'] ) ) {
        return;
    }

    $url = esc_url( admin_url( 'themes.php?page=forma-favicon' ) );

    printf(
        '<div class="notice notice-info"><p>%s <a href="%s">%s</a></p></div>',
        wp_kses( __( 'Your site icon (favicon) is managed by <strong>Forma Favicon</strong>.', 'forma-favicon' ), [ 'strong' => [] ] ),
        esc_url( $url ),
        esc_html__( 'Go to Favicon settings →', 'forma-favicon' )
    );
}
add_action( 'admin_notices', 'forma_favicon_general_settings_notice' );
