/**
 * Forma Favicon — Admin entry point.
 *
 * Mounts the React app on the WP Admin "Favicon" page.
 *
 * @package FormaFavicon
 */

import { render } from '@wordpress/element';
import 'uno.css';
import { AdminFaviconApp } from './components/AdminFaviconApp';

const root = document.getElementById('forma-favicon-app');
if (root) {
    render(<AdminFaviconApp />, root);
}
