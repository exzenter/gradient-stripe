<?php
/**
 * Plugin Name:       Gradient Stripe Block
 * Description:       A beautiful animated mesh gradient stripe block inspired by Stripe's design.
 * Version:           1.0.0
 * Author:            Exzent
 * Author URI:        https://exzenter.github.io/gradient-stripe/
 * License:           MIT
 * Text Domain:       gradient-stripe-block
 */

if (!defined('ABSPATH')) {
    exit;
}

/**
 * Register the block and its assets
 */
function gradient_stripe_block_init() {
    register_block_type(__DIR__ . '/build');
}
add_action('init', 'gradient_stripe_block_init');

/**
 * Enqueue frontend script for the gradient
 */
function gradient_stripe_block_frontend_script() {
    if (has_block('gsb/gradient-stripe')) {
        wp_enqueue_script(
            'gradient-stripe-frontend',
            plugins_url('build/frontend.js', __FILE__),
            array(),
            '1.0.0',
            true
        );
    }
}
add_action('wp_enqueue_scripts', 'gradient_stripe_block_frontend_script');
