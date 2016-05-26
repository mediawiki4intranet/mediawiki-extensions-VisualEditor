/*!
 * VisualEditor MediaWiki Initialization Target class.
 *
 * @copyright 2011-2016 VisualEditor Team and others; see AUTHORS.txt
 * @license The MIT License (MIT); see LICENSE.txt
 */

/**
 * Initialization MediaWiki target.
 *
 * @class
 * @extends ve.init.Target
 *
 * @constructor
 * @param {Object} [config] Configuration options
 */
ve.init.mw.Target = function VeInitMwTarget( config ) {
	// Parent constructor
	ve.init.mw.Target.super.call( this, config );

	// Initialization
	this.$element.addClass( 've-init-mw-target' );
};

/* Inheritance */

OO.inheritClass( ve.init.mw.Target, ve.init.Target );

/* Events */

/**
 * @event surfaceReady
 */

/* Static Properties */

/**
 * Symbolic name for this target class.
 *
 * @static
 * @property {string}
 * @inheritable
 */
ve.init.mw.Target.static.name = null;

ve.init.mw.Target.static.toolbarGroups = [
	// History
	{ include: [ 'undo', 'redo' ] },
	// Format
	{
		classes: [ 've-test-toolbar-format' ],
		type: 'menu',
		indicator: 'down',
		title: OO.ui.deferMsg( 'visualeditor-toolbar-format-tooltip' ),
		include: [ { group: 'format' } ],
		promote: [ 'paragraph' ],
		demote: [ 'preformatted', 'blockquote', 'heading1' ]
	},
	// Style
	{
		classes: [ 've-test-toolbar-style' ],
		type: 'list',
		icon: 'textStyle',
		indicator: 'down',
		title: OO.ui.deferMsg( 'visualeditor-toolbar-style-tooltip' ),
		include: [ { group: 'textStyle' }, 'language', 'clear' ],
		forceExpand: [ 'bold', 'italic', 'clear' ],
		promote: [ 'bold', 'italic' ],
		demote: [ 'strikethrough', 'code', 'underline', 'language', 'clear' ]
	},
	// Link
	{ include: [ 'link' ] },
	// Structure
	{
		classes: [ 've-test-toolbar-structure' ],
		type: 'list',
		icon: 'listBullet',
		indicator: 'down',
		title: OO.ui.deferMsg( 'visualeditor-toolbar-structure' ),
		include: [ { group: 'structure' } ],
		demote: [ 'outdent', 'indent' ]
	},
	// Insert
	{
		classes: [ 've-test-toolbar-insert' ],
		label: OO.ui.deferMsg( 'visualeditor-toolbar-insert' ),
		indicator: 'down',
		title: OO.ui.deferMsg( 'visualeditor-toolbar-insert' ),
		include: '*',
		forceExpand: [ 'media', 'transclusion', 'insertTable' ],
		promote: [ 'media', 'transclusion', 'insertTable' ]
	},
	// SpecialCharacter
	{ include: [ 'specialCharacter' ] }
];

ve.init.mw.Target.static.importRules = {
	external: {
		blacklist: [
			// Annotations
			'link/mwExternal', 'textStyle/span', 'textStyle/font', 'textStyle/underline', 'meta/language',
			// Nodes
			'div', 'alienInline', 'alienBlock', 'comment'
		],
		removeOriginalDomElements: true,
		nodeSanitization: true
	},
	all: null
};

/**
 * Type of integration. Used by ve.init.mw.trackSubscriber.js for event tracking.
 *
 * @static
 * @property {string}
 * @inheritable
 */
ve.init.mw.Target.static.integrationType = null;

/**
 * Type of platform. Used by ve.init.mw.trackSubscriber.js for event tracking.
 *
 * @static
 * @property {string}
 * @inheritable
 */
ve.init.mw.Target.static.platformType = null;

/* Static Methods */

/**
 * Fix the base URL from Parsoid if necessary.
 *
 * Absolutizes the base URL if it's relative, and sets a base URL based on wgArticlePath
 * if there was no base URL at all.
 *
 * @param {HTMLDocument} doc Parsoid document
 */
ve.init.mw.Target.static.fixBase = function ( doc ) {
	ve.fixBase( doc, document, ve.resolveUrl(
		// Don't replace $1 with the page name, because that'll break if
		// the page name contains a slash
		mw.config.get( 'wgArticlePath' ).replace( '$1', '' ),
		document
	) );
};

/* Methods */

/**
 * Parse HTML into a document
 *
 * @param {string} html HTML
 * @return {HTMLDocument} HTML document
 */
ve.init.mw.Target.prototype.parseHtml = function ( html ) {
	var doc = ve.parseXhtml( html );

	// Fix relative or missing base URL if needed
	this.constructor.static.fixBase( doc );

	return doc;
};

/**
 * Handle both DOM and modules being loaded and ready.
 *
 * @param {HTMLDocument} doc HTML document
 */
ve.init.mw.Target.prototype.documentReady = function ( doc ) {
	this.setupSurface( doc, this.surfaceReady.bind( this ) );
};

/**
 * Once surface is ready ready, initialize the UI
 *
 * @method
 * @fires surfaceReady
 */
ve.init.mw.Target.prototype.surfaceReady = function () {
	this.emit( 'surfaceReady' );
};

/**
 * Get HTML to send to Parsoid. This takes a document generated by the converter and
 * transplants the head tag from the old document into it, as well as the attributes on the
 * html and body tags.
 *
 * @param {HTMLDocument} newDoc Document generated by ve.dm.Converter. Will be modified.
 * @param {HTMLDocument} [oldDoc] Old document to copy attributes from.
 * @return {string} Full HTML document
 */
ve.init.mw.Target.prototype.getHtml = function ( newDoc, oldDoc ) {
	var i, len;

	function copyAttributes( from, to ) {
		var i, len;
		for ( i = 0, len = from.attributes.length; i < len; i++ ) {
			to.setAttribute( from.attributes[ i ].name, from.attributes[ i ].value );
		}
	}

	if ( oldDoc ) {
		// Copy the head from the old document
		for ( i = 0, len = oldDoc.head.childNodes.length; i < len; i++ ) {
			newDoc.head.appendChild( oldDoc.head.childNodes[ i ].cloneNode( true ) );
		}
		// Copy attributes from the old document for the html, head and body
		copyAttributes( oldDoc.documentElement, newDoc.documentElement );
		copyAttributes( oldDoc.head, newDoc.head );
		copyAttributes( oldDoc.body, newDoc.body );
	}

	// Filter out junk that may have been added by browser plugins
	$( newDoc )
		.find(
			'script, ' + // T54884, T65229, T96533, T103430
			'object, ' + // T65229
			'style, ' + // T55252
			'embed, ' + // T53521, T54791, T65121
			'div[id="myEventWatcherDiv"], ' + // T53423
			'div[id="sendToInstapaperResults"], ' + // T63776
			'div[id="kloutify"], ' + // T69006
			'div[id^="mittoHidden"]' // T70900
		)
		.remove();
	// Add doctype manually
	return '<!doctype html>' + ve.serializeXhtml( newDoc );
};

/**
 * Track an event
 *
 * @param {string} name Event name
 */
ve.init.mw.Target.prototype.track = function () {};

/**
 * @inheritdoc
 */
ve.init.Target.prototype.createTargetWidget = function ( dmDoc, config ) {
	return new ve.ui.MWTargetWidget( dmDoc, config );
};

/**
 * @inheritdoc
 */
ve.init.mw.Target.prototype.createSurface = function () {
	var surface, surfaceView, $documentNode;

	// Parent method
	surface = ve.init.mw.Target.super.prototype.createSurface.apply( this, arguments );

	surfaceView = surface.getView();
	$documentNode = surfaceView.getDocument().getDocumentNode().$element;

	surface.$element.addClass( this.protectedClasses );

	$documentNode.addClass(
		// Add appropriately mw-content-ltr or mw-content-rtl class
		'mw-content-' + mw.config.get( 'wgVisualEditor' ).pageLanguageDir
	);

	return surface;
};

/**
 * Switch to editing mode.
 *
 * @method
 * @param {HTMLDocument} doc HTML document
 * @param {Function} [callback] Callback to call when done
 */
ve.init.mw.Target.prototype.setupSurface = function ( doc, callback ) {
	var target = this;
	setTimeout( function () {
		// Build model
		var dmDoc,
			conf = mw.config.get( 'wgVisualEditor' );

		target.track( 'trace.convertModelFromDom.enter' );
		dmDoc = ve.dm.converter.getModelFromDom( doc, {
			lang: conf.pageLanguageCode,
			dir: conf.pageLanguageDir
		} );
		target.track( 'trace.convertModelFromDom.exit' );

		// Build DM tree now (otherwise it gets lazily built when building the CE tree)
		target.track( 'trace.buildModelTree.enter' );
		dmDoc.buildNodeTree();
		target.track( 'trace.buildModelTree.exit' );

		setTimeout( function () {
			var surface;
			// Clear dummy surfaces
			target.clearSurfaces();

			// Create ui.Surface (also creates ce.Surface and dm.Surface and builds CE tree)
			target.track( 'trace.createSurface.enter' );
			surface = target.addSurface( dmDoc );
			// Add classes specific to surfaces attached directly to the target,
			// as opposed to TargetWidget surfaces
			surface.$element.addClass( 've-init-mw-target-surface' );
			target.track( 'trace.createSurface.exit' );

			target.dummyToolbar = false;

			target.setSurface( surface );

			setTimeout( function () {
				// Initialize surface
				target.track( 'trace.initializeSurface.enter' );

				target.active = true;
				// Now that the surface is attached to the document and ready,
				// let it initialize itself
				surface.initialize();
				if ( surface.debugBar ) {
					// Move debug bar to end of target if the surface is nested
					target.$element.append( surface.debugBar.$element );
				}

				target.track( 'trace.initializeSurface.exit' );
				setTimeout( callback );
			} );
		} );
	} );
};

/**
 * @inheritdoc
 */
ve.init.mw.Target.prototype.setSurface = function ( surface ) {
	if ( !surface.$element.parent().length ) {
		this.$element.append( surface.$element );
	}

	// Parent method
	ve.init.mw.Target.super.prototype.setSurface.apply( this, arguments );
};
