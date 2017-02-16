import { Symbolizer } from './Symbolizer.js'
import { PolyBase } from './Symbolizer.PolyBase.js'

// 🍂class LineSymbolizer
// 🍂inherits Polyline
// A symbolizer for filled areas. Applies only to polygon features.

export var FillSymbolizer = L.Polygon.extend({
	includes: [Symbolizer.prototype, PolyBase],

	initialize: function(feature, pxPerExtent) {
		this.properties = feature.properties;
		this._makeFeatureParts(feature, pxPerExtent);
	},

	render: function(renderer, style) {
		Symbolizer.prototype.render.call(this, renderer, style);
		this._updatePath();
	}
});
