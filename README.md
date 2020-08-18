# FlipFlop

A tiny vanilla JS library to scroll section by section

## Getting Started

Copy and include flipflop.js and flipflop.css into your project.

```
<link rel="stylesheet" href="pathto/flipflop.css">

<script src="pathto/flipflop.js"></script>
```

You need to init flipFlop immediately if you like:

```
<script src="pathto/flipflop.js"></script>
<script>
  flipFlop()
</script>
```
Or do your init in another JS file.

### Default options

By default flipFlop will use the document.body as the page container, and use semantic 'section' tags as sections to scroll between.

If you wanted three sections with navigation you can add the most basic markup like this:

```
<div id="flip_flop_nav"></div><!-- Adding this will enable navigation -->

<section>Section 1<section>
<section>Section 2<section>
<section>Section 3<section>
```
It's healthy to put the sections directly under the body element, but you can get by without it.

### All options

```
flipFlop({
  container: document.body,                           // Styling will need to be altered drastically when changing the container
  sections: document.getElementsByTagName('section'), // To use a class: document.getElementsByClassName('yourClassHere')
  nav: document.getElementById('flip_flop_nav'),      // Change the nav selector - if it doesn't exist in the markup it won't show
  mouseDrag: false,                                   // Dragging the screen up and down often makes other controls difficult to use
  disableOnMax: 960                                   // Sets minimum pixel width for FlipFloppyness
})
```

## Authors

* **Daniel Untiedt** - *Initial work* - [Bugbit](https://bugbit.io)

See also the list of [contributors](https://github.com/bugbit-io/flipflop/contributors) who participated in this project.

## License

This project is licensed under the GNU General Public License v3.0 - see the [LICENSE.md](LICENSE.md) file for details

## Acknowledgments

* https://github.com/danro/easing-js/blob/master/easing.js
* http://www.paulirish.com/2011/requestanimationframe-for-smart-animating/
