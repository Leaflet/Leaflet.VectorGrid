

# Leaflet.VectorGrid


Display gridded vector data (sliced [GeoJSON](http://geojson.org/), [TopoJSON](https://github.com/mbostock/topojson/wiki) or [protobuf vector tiles](https://github.com/mapbox/vector-tile-spec)) in [Leaflet](http://www.leafletjs.com) 1.0.0



## Why

Because neither Leaflet.MapboxVectorTile nor Hoverboard will work on Leaflet 1.


## Demo

With sliced GeoJSON: http://ivansanchez.github.io/Leaflet.VectorGrid/dist/demo/demo-geojson.html

With sliced TopoJSON: http://ivansanchez.github.io/Leaflet.VectorGrid/dist/demo/demo-topojson.html (sorry for the antimeridian mess, topojson-to-geojson seems to not handle it properly)

With protobuf `VectorTile`s: http://ivansanchez.github.io/Leaflet.VectorGrid/dist/demo/demo-vectortiles.html


## Using

Install through `npm` with `npm install leaflet.vectorgrid`.

This will make available some browser-ready files, which include the bundled dependencies:

* [geojson-vt](https://github.com/mapbox/geojson-vt) (Under ISC license)
* [pbf](https://github.com/mapbox/pbf) (Under BSD license)
* [topojson](https://github.com/mbostock/topojson) (Under BSD license)
* [vector-tile](https://github.com/mapbox/vector-tile-js) (Under BSD license)

Use the file `dist/Leaflet.VectorGrid.js` if you are adding these dependencies yourself, or `dist/Leaflet.VectorGrid.bundled.js` for minimal fuss.

## Docs

This plugin exposes two new classes:

### `L.VectorGrid.Slicer`

Slices some GeoJSON data into tiles, via `geojson-vt`.

Instantiate through the factory method:

```js
var layer = L.vectorGrid.slicer(geojson, options);
```

Any options to `geojson-vt` can be passed in `options`.

Styling-wise, this will create an internal vector tile layer named `sliced`. This can be overridden with the `vectorTileLayerName` option.

The slicer also accepts [TopoJSON](https://github.com/mbostock/topojson) transparently:
```js
var layer = L.vectorGrid.slicer(topojson, options);
```

The TopoJSON format [implicitly groups features into "objects"](https://github.com/mbostock/topojson-specification/blob/master/README.md#215-objects). These will be transformed into vector tile layer names when styling (the `vectorTileLayerName` option is ignored when using TopoJSON).

### `L.VectorGrid.Protobuf`

Reads vector tiles in Protobuf (`.pbf`) format from the network.

Instantiate through the factory method:

```js
var layer = L.vectorGrid.protobuf(url, options);
```

`url` is a URL template for `.pbf` vector tiles, e.g.:

```js
var url = 'https://{s}.tiles.mapbox.com/v4/mapbox.mapbox-streets-v6/{z}/{x}/{y}.vector.pbf';
var layer = L.vectorGrid.protobuf(url, options);
```

`L.VectorGrid.Protobuf` can accept a `L.latLngBounds` option `bbox`, which defines the boundary box of the layer. If the `bbox` is specified, it won't send tile request to the server for the area outside the boundary box.

### Styling

Vector tiles have a concept of "layer" different from the Leaflet concept of "layer".

In Leaflet, a "layer" is something that can be atomically added or removed from the map. In vector tiles, a "layer" is a named set of features (points, lines or polygons) which share a common theme.

A vector tile layer¹ can have several layers². In the `mapbox-streets-v6` vector tiles layer¹ above, there are named layers² like `admin`, `water` or `roads`.

* ¹ In leaflet
* ² Groups of themed features

Styling is done via per-layer² sets of `L.Path` options in the `vectorTileLayerStyles` layer¹ option:

```js

var vectorTileOptions = {
	vectorTileLayerStyles: {

		water: {
			weight: 0,
			fillColor: '#9bc2c4',
			fillOpacity: 1,
			fill: true
		},

		admin: function(properties, zoom) {
			var level = properties.admin_level;
			var weight = 1;
			if (level == 2) {weight = 4;}
			return {
				weight: weight,
				color: '#cf52d3',
				dashArray: '2, 6',
				fillOpacity: 0
			}
		},

		road: []
	}
};

At this time, only polylines and polygons can be styled. There is no support (yet) for symbolizing points.


var pbfLayer = L.vectorGrid.protobuf(url, vectorTileOptions).addTo(map);
```

A layer² style can be either:
* A set of `L.Path` options
* An array of sets of `L.Path` options
* A function that returns a set of `L.Path` options
* A function that returns an array of sets of `L.Path` options

Layers² with no style specified will use the default `L.Path` options.


### SVG vs `<canvas>`

Leaflet.VectorGrid is able to render vector tiles with both SVG and `<canvas>`, in the same way that vanilla Leaflet can use SVG and `<canvas>` to draw lines and polygons.

To switch between the two, use the `rendererFactory` option for any `L.VectorGrid` layer, e.g.:

```js
var sliced = L.vectorGrid.slicer(geojson, {
	rendererFactory: L.svg.tile,
	attribution: 'Something',
	vectorTileLayerStyles: { ... }
});

var pbf = L.vectorGrid.protobuf(url, {
	rendererFactory: L.canvas.tile,
	attribution: 'Something',
	vectorTileLayerStyles: { ... }
});
```

Internally, Leaflet.VectorGrid uses two classes named `L.SVG.Tile` and `L.Canvas.Tile`, with factory methods `L.svg.tile` and `L.canvas.tile` - a `L.VectorGrid` needs to be passed one of those factory methods.


## Dependencies

`L.VectorGrid.Slicer` requires `geojson-vt`: the global variable `geojsonvt` must exist. If topojson data is used, then the `topojson` global variable must also exist.

`L.VectorGrid.Protobuf` requires `vector-tile` and `pbf`: the global variables `VectorTile` and `Pbf` must exist.

## Developing

Run `npm install`, then run the `aux/browserify-dependencies.sh` script. The dependencies do not provide browser-ready packages, see for example [mapbox/geojson-vt#52](https://github.com/mapbox/geojson-vt/pull/52).

## TODO

* Sub-panes for the tile renderers (to set the "z-index" of layers/features)
 * More `<g>`roups in SVG
 * Offscreen `<canvas>`es in Canvas
* `getBounds()` support for the slicer (inherit/extrapolate from geojson data)
* Symbolize points somehow

## Legalese

----------------------------------------------------------------------------

"THE BEER-WARE LICENSE":
<ivan@sanchezortega.es> wrote this file. As long as you retain this notice you
can do whatever you want with this stuff. If we meet some day, and you think
this stuff is worth it, you can buy me a beer in return.

----------------------------------------------------------------------------
