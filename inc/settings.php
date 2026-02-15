<?php
/**
 * Settings registration and sanitization.
 *
 * @package FormaFavicon
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

/**
 * Register the forma_favicon option with REST API schema.
 */
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

/**
 * Sanitize the option value.
 *
 * @param mixed $value Raw option value.
 * @return array Sanitized option.
 */
function forma_favicon_sanitize( $value ) {
    if ( ! is_array( $value ) ) {
        return [];
    }

    return [
        'source_id'   => isset( $value['source_id'] )   ? absint( $value['source_id'] )               : 0,
        'generated'   => isset( $value['generated'] )    ? (bool) $value['generated']                  : false,
        'theme_color' => isset( $value['theme_color'] )  ? sanitize_hex_color( $value['theme_color'] ) : '#ffffff',
        'bg_color'    => isset( $value['bg_color'] )     ? sanitize_hex_color( $value['bg_color'] )    : '#ffffff',
    ];
}
