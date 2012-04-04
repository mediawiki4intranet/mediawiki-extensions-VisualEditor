/**
 * Creates an ve.ce.DocumentNode object.
 * 
 * @class
 * @constructor
 * @extends {ve.ce.BranchNode}
 * @param {ve.dm.DocumentNode} documentModel Document model to view
 * @param {ve.ce.Surface} surfaceView Surface view this view is a child of
 */
ve.ce.DocumentNode = function( model, surfaceView ) {
	// Inheritance
	ve.ce.BranchNode.call( this, model );

	// Properties
	this.surfaceView = surfaceView;

	// DOM Changes
	this.$.addClass( 've-ce-documentNode' );
	this.$.attr('contentEditable', 'true');
	this.$.attr('spellcheck', 'true');
};

/* Static Members */


/**
 * Mapping of symbolic names and splitting rules.
 * 
 * Each rule is an object with a self and children property. Each of these properties may contain
 * one of two possible values:
 *     Boolean - Whether a split is allowed
 *     Null - Node is a leaf, so there's nothing to split
 * 
 * @example Paragraph rules
 *     {
 *         'self': true
 *         'children': null
 *     }
 * @example List rules
 *     {
 *         'self': false,
 *         'children': true
 *     }
 * @example ListItem rules
 *     {
 *         'self': true,
 *         'children': false
 *     }
 */
ve.ce.DocumentNode.splitRules = {};

/* Methods */

/**
 * Get the document offset of a position created from passed DOM event
 * 
 * @method
 * @param e {Event} Event to create ve.Position from
 * @returns {Integer} Document offset
 */
ve.ce.DocumentNode.prototype.getOffsetFromEvent = function( e ) {
	var position = ve.Position.newFromEventPagePosition( e );
	return this.getOffsetFromRenderedPosition( position );
};

ve.ce.DocumentNode.splitRules.document = {
	'self': false,
	'children': true
};

/* Inheritance */

ve.extendClass( ve.ce.DocumentNode, ve.ce.BranchNode );
