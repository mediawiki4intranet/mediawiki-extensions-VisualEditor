<?php
/**
 * Resource loader module providing extra data from the server to VisualEditor.
 *
 * @file
 * @ingroup Extensions
 * @copyright 2011-2016 VisualEditor Team and others; see AUTHORS.txt
 * @license The MIT License (MIT); see LICENSE.txt
 */

class VisualEditorDataModule extends ResourceLoaderModule {

	/* Protected Members */

	protected $origin = self::ORIGIN_USER_SITEWIDE;
	protected $targets = array( 'desktop', 'mobile' );

	/* Methods */

	public function __construct() {
	}

	public function getScript( ResourceLoaderContext $context ) {
		// Messages
		$msgInfo = $this->getMessageInfo();
		$parsedMessages = array();
		$messages = array();
		foreach ( $msgInfo['args'] as $msgKey => $msgArgs ) {
			$parsedMessages[ $msgKey ] = call_user_func_array( 'wfMessage', $msgArgs )
				->inLanguage( $context->getLanguage() )
				->parse();
		}
		foreach ( $msgInfo['vals'] as $msgKey => $msgVal ) {
			$messages[ $msgKey ] = $msgVal;
		}

		return
			've.init.platform.addParsedMessages(' . FormatJson::encode(
				$parsedMessages,
				ResourceLoader::inDebugMode()
			) . ');'.
			've.init.platform.addMessages(' . FormatJson::encode(
				$messages,
				ResourceLoader::inDebugMode()
			) . ');';
	}

	protected function getMessageInfo() {
		// Messages that just require simple parsing
		$msgArgs = array(
			'minoredit' => array( 'minoredit' ),
			'missingsummary' => array( 'missingsummary' ),
			'summary' => array( 'summary' ),
			'watchthis' => array( 'watchthis' ),
			'visualeditor-browserwarning' => array( 'visualeditor-browserwarning' ),
			'visualeditor-wikitext-warning' => array( 'visualeditor-wikitext-warning' ),
		);

		// Override message value
		$msgVals = array(
			'visualeditor-feedback-link' => wfMessage( 'visualeditor-feedback-link' )
				->inContentLanguage()
				->text(),
		);

		// Copyright warning (based on EditPage::getCopyrightWarning)
		$rightsText = $this->config->get( 'RightsText' );
		if ( $rightsText ) {
			$copywarnMsg = array( 'copyrightwarning',
				'[[' . wfMessage( 'copyrightpage' )->inContentLanguage()->text() . ']]',
				$rightsText );
		} else {
			$copywarnMsg = array( 'copyrightwarning2',
				'[[' . wfMessage( 'copyrightpage' )->inContentLanguage()->text() . ']]' );
		}
		// EditPage supports customisation based on title, we can't support that here
		// since these messages are cached on a site-level. $wgTitle is likely set to null.
		$title = Title::newFromText( 'Dwimmerlaik' );
		Hooks::run( 'EditPageCopyrightWarning', array( $title, &$copywarnMsg ) );

		// Normalise to 'copyrightwarning' so we have a consistent key in the front-end.
		$msgArgs[ 'copyrightwarning' ] = $copywarnMsg;

		// Citation tools
		$msgVals['visualeditor-cite-tool-definition.json'] = json_encode( self::getCitationTools() );

		return array(
			'args' => $msgArgs,
			'vals' => $msgVals,
		);
	}

	/**
	 * Retrieve the list of citation templates that we want to make available in the
	 * VisualEditor toolbar (via the Cite dropdown). These are defined on-wiki at
	 * MediaWiki:Visualeditor-cite-tool-definition.json.
	 *
	 * @return array
	 */
	public static function getCitationTools() {
		$citationDefinition = json_decode(
			wfMessage( 'visualeditor-cite-tool-definition.json' )->plain()
		);
		$citationTools = array();
		if ( is_array( $citationDefinition ) ) {
			foreach ( $citationDefinition as $tool ) {
				if ( !isset( $tool->title ) && isset( $tool->name ) ) {
					$tool->title =
						wfMessage( 'visualeditor-cite-tool-name-' . $tool->name )->text();
				}
				$citationTools[] = $tool;
			}
		}
		return $citationTools;
	}

	public function enableModuleContentVersion() {
		return true;
	}

	public function getDependencies( ResourceLoaderContext $context = null ) {
		return array(
			'ext.visualEditor.base',
			'ext.visualEditor.mediawiki',
		);
	}
}
