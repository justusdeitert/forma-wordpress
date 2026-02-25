<?php
/**
 * Plugin Name:  Forma Favicon
 * Description:  Favicon generator — upload a source image, configure colors, and generate all favicon sizes + ICO file.
 * Version:      1.0.0
 * Requires at least: 6.2
 * Requires PHP: 7.4
 * Author:       Forma
 * Author URI:   https://github.com/justusdeitert
 * Plugin URI:   https://github.com/justusdeitert/forma-favicon
 * Text Domain:  forma-favicon
 * Domain Path:  /languages
 * License:      GPL-2.0-or-later
 *
 * @package FormaFavicon
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

/**
 * Load plugin text domain for translations.
 */
function forma_favicon_load_textdomain() {
    load_plugin_textdomain( 'forma-favicon', false, dirname( plugin_basename( __FILE__ ) ) . '/languages' );
}
add_action( 'init', 'forma_favicon_load_textdomain' );

define( 'FORMA_FAVICON_VERSION', '1.0.0' );
define( 'FORMA_FAVICON_DIR', plugin_dir_path( __FILE__ ) );
define( 'FORMA_FAVICON_URL', plugin_dir_url( __FILE__ ) );

require_once FORMA_FAVICON_DIR . 'inc/helpers.php';
require_once FORMA_FAVICON_DIR . 'inc/settings.php';
require_once FORMA_FAVICON_DIR . 'inc/ico-generator.php';
require_once FORMA_FAVICON_DIR . 'inc/rest-api.php';
require_once FORMA_FAVICON_DIR . 'inc/conflicts.php';
require_once FORMA_FAVICON_DIR . 'inc/admin.php';
require_once FORMA_FAVICON_DIR . 'inc/frontend.php';
require_once FORMA_FAVICON_DIR . 'inc/migration.php';
