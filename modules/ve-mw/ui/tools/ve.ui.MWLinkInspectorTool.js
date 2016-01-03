/*!
 * VisualEditor UserInterface MediaWiki LinkInspectorTool classes.
 *
 * @copyright 2011-2016 VisualEditor Team and others; see AUTHORS.txt
 * @license The MIT License (MIT); see LICENSE.txt
 */

/**
 * UserInterface link tool. Overrides link tool from core.
 *
 * Works for both link annotations and link nodes, and fires the 'link' command
 * which works for both as well.
 *
 * @class
 * @extends ve.ui.LinkInspectorTool
 *
 * @constructor
 * @param {OO.ui.ToolGroup} toolGroup
 * @param {Object} [config] Configuration options
 */
ve.ui.MWLinkInspectorTool = function VeUiMwLinkInspectorTool() {
	ve.ui.MWLinkInspectorTool.super.apply( this, arguments );
	ve.ui.MWEducationPopupTool.call( this, {
		title: ve.msg( 'visualeditor-linkinspector-educationpopup-title' ),
		text: ve.msg( 'visualeditor-linkinspector-educationpopup-text' )
	} );
};

/* Inheritance */

OO.inheritClass( ve.ui.MWLinkInspectorTool, ve.ui.LinkInspectorTool );
OO.mixinClass( ve.ui.MWLinkInspectorTool, ve.ui.MWEducationPopupTool );

/* Static Properties */

ve.ui.MWLinkInspectorTool.static.modelClasses =
	ve.ui.MWLinkInspectorTool.super.static.modelClasses.concat( [
		ve.dm.MWNumberedExternalLinkNode,
		ve.dm.MWMagicLinkNode
	] );

ve.ui.MWLinkInspectorTool.static.associatedWindows = [ 'link', 'linkNode', 'linkMagicNode' ];

/* Methods */

/**
 * @inheritdoc
 */
ve.ui.MWLinkInspectorTool.prototype.onUpdateState = function ( fragment ) {
	var node, type, title;

	// Parent method
	ve.ui.MWLinkInspectorTool.super.prototype.onUpdateState.apply( this, arguments );

	// Vary title based on link type.
	node = fragment && fragment.getSelectedNode();
	type = node instanceof ve.dm.MWMagicLinkNode ?
		'magiclinknode-tooltip-' + node.getMagicType().toLowerCase() :
		node instanceof ve.dm.MWNumberedExternalLinkNode ?
		'linknode-tooltip' : null;
	title = type ?
		OO.ui.deferMsg( 'visualeditor-annotationbutton-' + type ) :
		ve.ui.MWLinkInspectorTool.static.title;

	this.setTitle( title  );
};

/* Registration */

ve.ui.toolFactory.register( ve.ui.MWLinkInspectorTool );

ve.ui.commandRegistry.register(
	new ve.ui.Command(
		'link', 'link', 'open', { supportedSelections: [ 'linear' ] }
	)
);

ve.ui.sequenceRegistry.register(
	new ve.ui.Sequence( 'wikitextLink', 'link', '[[', 2 )
);

ve.ui.commandHelpRegistry.register( 'textStyle', 'link', { sequences: [ 'wikitextLink' ] } );
