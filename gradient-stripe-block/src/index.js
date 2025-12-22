/**
 * Gradient Stripe Block - Main Entry
 */
import { registerBlockType } from '@wordpress/blocks';
import './editor.css';
import './style.css';
import metadata from './block.json';
import Edit from './edit';
import save from './save';

registerBlockType(metadata.name, {
    ...metadata,
    edit: Edit,
    save,
});
