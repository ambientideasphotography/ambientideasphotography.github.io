<?php
/**
 * @package WordPress
 * @subpackage Default_Theme
 */
?>
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" <?php language_attributes(); ?>>

<head profile="http://gmpg.org/xfn/11">
<meta http-equiv="Content-Type" content="<?php bloginfo('html_type'); ?>; charset=<?php bloginfo('charset'); ?>" />

<title><?php wp_title('&laquo;', true, 'right'); ?> <?php bloginfo('name'); ?></title>

<link rel="stylesheet" href="<?php bloginfo('stylesheet_url'); ?>" type="text/css" media="screen" />
<link rel="pingback" href="<?php bloginfo('pingback_url'); ?>" />

<style type="text/css" media="screen">

<?php
// Checks to see whether it needs a sidebar or not
if ( empty($withcomments) && !is_single() ) {
?>
	#page { background: url("<?php bloginfo('stylesheet_directory'); ?>/images/kubrickbg-<?php bloginfo('text_direction'); ?>.jpg") repeat-y top; border: none; }
<?php } else { // No sidebar ?>
	#page { background: url("<?php bloginfo('stylesheet_directory'); ?>/images/kubrickbgwide.jpg") repeat-y top; border: none; }
<?php } ?>

</style>

<?php if ( is_singular() ) wp_enqueue_script( 'comment-reply' ); ?>

<?php wp_head(); ?>
</head>
<body <?php body_class(); ?>>
	
	
<div class="page">


<div class="site-navigation">
	
	
		<!-- TemplateBeginEditable name="NavOnOff0" --><div class="block off"><!-- TemplateEndEditable -->
						<a href="/services/">
							<div>Info</div>
							<span>Our Services</span>
						</a>
				</div>

				<!-- TemplateBeginEditable name="NavOnOff1" --><div class="block off"><!-- TemplateEndEditable -->
						<a href="/portfolios/">
							<div>Portfolios</div>
							<span>View my Work</span>
						</a>
				</div>

				<!-- TemplateBeginEditable name="NavOnOff2" --><div class="block off"><!-- TemplateEndEditable -->
						<a href="/blog/">
							<div>Blog</div>
							<span>Events and Tips</span>
						</a>
				</div>

				<!-- TemplateBeginEditable name="NavOnOff3" --><div class="block off"><!-- TemplateEndEditable -->
						<a href="/training/">
							<div>Training</div>
							<span>Join the Team</span>
						</a>
				</div>
		
		<div class="logo"></div>
	</div>
