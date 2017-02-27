

var gobble = require('gobble');
var src = gobble('src');


// Run rollup on the web worker code, in order to include GeoJSON-vt and TopoJSON into it.
var concatenatedWebWorker = src.transform('rollup', {
	entry: 'slicerWebWorker.js',
	dest: 'slicerWebWorker.js.worker',
	format: 'cjs',
	sourceMap: true,
	plugins: [
		require('rollup-plugin-buble')({
			include: '**/**.js'
		}),
		require('rollup-plugin-node-resolve')({
			jsnext: false,
			main: true
		}),
		require('rollup-plugin-commonjs')(),
// 		require('rollup-plugin-file-as-blob')({
// 			include: '**/**.png'
// 		}),
	]
});

var uglifiedWebWorker = src.transform('rollup', {
	entry: 'slicerWebWorker.js',
	dest: 'slicerWebWorker.js.worker',
	format: 'cjs',
	sourceMap: false,
	plugins: [
		require('rollup-plugin-buble')({
			include: '**/**.js'
		}),
		require('rollup-plugin-node-resolve')({
			jsnext: false,
			main: true
		}),
		require('rollup-plugin-commonjs')(),
		require('rollup-plugin-uglify')()
	]
});

// Get the rolled-up worker code back next to the same directory as the main code
var src2         = gobble([src, concatenatedWebWorker]);
var src2uglified = gobble([src, uglifiedWebWorker]);


// We'll run rollup four times, with slightly different options and using different
// source files (uglified worker or not). But the plugins stay the same.
var rollupPluginOptions = [
	require('rollup-plugin-file-as-blob')({
		// Note the '.*' at the beginning of the minimatch, because
		// https://github.com/rollup/rollup-pluginutils/issues/9
		include: '.*/**/**.worker'
	}),
	require('rollup-plugin-buble')({
		include: '**/**.js'
	}),
	require('rollup-plugin-node-resolve')({
		jsnext: false,
		main: true
	}),
	require('rollup-plugin-commonjs')(),
];

var rollupUglyPluginOptions = rollupPluginOptions.concat([require('rollup-plugin-uglify')()]);

// Roll up the main code, merging the web worker code as a blob URL.
var builtCode = src2.transform('rollup', {
	entry: 'bundle.js',
	dest: 'Leaflet.VectorGrid.js',
	format: 'cjs',
	sourceMap: true,
	plugins: rollupPluginOptions
});


// Roll up the main code plus the optional bundled deps, merging the web worker code as a blob URL.
var bundledCode = src2.transform('rollup', {
	entry: 'bundle-extra.js',
	dest: 'Leaflet.VectorGrid.bundled.js',
	format: 'iife',
	sourceMap: true,
	plugins: rollupPluginOptions,
	globals: {
		Pbf: 'Pbf',
		VectorTile: 'vector-tile',
	}
});


var uglifiedCode = src2uglified.transform('rollup', {
	entry: 'bundle.js',
	dest: 'Leaflet.VectorGrid.min.js',
	format: 'cjs',
	sourceMap: false,
	plugins: rollupUglyPluginOptions
});


var uglifiedBundledCode = src2uglified.transform('rollup', {
	entry: 'bundle-extra.js',
	dest: 'Leaflet.VectorGrid.bundled.min.js',
	format: 'cjs',
	sourceMap: false,
	plugins: rollupUglyPluginOptions
});


var leafdoc = src.transform('leafdoc', {
	templateDir: 'leafdoc-templates',
	output: 'vectorgrid-api-docs.html',
	showInheritancesWhenEmpty: true,

});

// var leaflet = vendor.include([
// 	'leaflet-src.js',
// 	'leaflet-src.map',
// 	'leaflet.css'
// ]).moveTo('demo');


module.exports = gobble([
	builtCode,          	// No extra deps, no minified
	bundledCode,        	//    Extra deps, no minified
	uglifiedCode,       	// No extra deps,    minified
	uglifiedBundledCode,	//    Extra deps,    minified

// 	leaflet
	leafdoc
]);
