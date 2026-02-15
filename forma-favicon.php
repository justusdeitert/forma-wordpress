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

require_once FORMA_FAVICON_DIR . 'inc/helpers.php';
require_once FORMA_FAVICON_DIR . 'inc/settings.php';
require_once FORMA_FAVICON_DIR . 'inc/ico-generator.php';
require_once FORMA_FAVICON_DIR . 'inc/rest-api.php';
require_once FORMA_FAVICON_DIR . 'inc/conflicts.php';
require_once FORMA_FAVICON_DIR . 'inc/admin.php';
require_once FORMA_FAVICON_DIR . 'inc/frontend.php';
require_once FORMA_FAVICON_DIR . 'inc/migration.php';
