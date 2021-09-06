

L.Canvas.Tile = L.Canvas.extend({

	initialize: function (tileCoord, tileSize, options) {
		L.Canvas.prototype.initialize.call(this, options);
		this._tileCoord = tileCoord;
		this._size = tileSize;

		this._initContainer();
		this._container.setAttribute('width', this._size.x);
		this._container.setAttribute('height', this._size.y);
		this._layers = {};
		this._drawnLayers = {};
		this._drawing = true;

		if (options.interactive) {
			// By default, Leaflet tiles do not have pointer events
			this._container.style.pointerEvents = 'auto';
		}
	},

	getCoord: function() {
		return this._tileCoord;
	},

	getContainer: function() {
		return this._container;
	},

	getOffset: function() {
		return this._tileCoord
			.scaleBy(this._size)
			.multiplyBy(this.getOverZoomFactor())
			.subtract(this._map.getPixelOrigin())
			.divideBy(this.getOverZoomFactor());
	},

	getOverZoomFactor: function() {
		var numberOfZoomLevels = Math.max(0, this._map.getZoom() - this._tileCoord.z);
		return Math.pow(2, numberOfZoomLevels);
	},

	getPointFromMouseEvent: function(e) {
		return this._map
			.mouseEventToLayerPoint(e)
			.divideBy(this.getOverZoomFactor())
			.subtract(this.getOffset());
	},

	onAdd: L.Util.falseFn,

	addTo: function(map) {
		this._map = map;
	},

	removeFrom: function (map) {
		delete this._map;
	},

	_onClick: function (e) {
		var point = this.getPointFromMouseEvent(e), layer, clickedLayer;

		for (var id in this._layers) {
			layer = this._layers[id];
			if (layer.options.interactive && layer._containsPoint(point) && !this._map._draggableMoved(layer)) {
				clickedLayer = layer;
			}
		}
		if (clickedLayer)  {
			L.DomEvent.fakeStop(e);
			this._fireEvent([clickedLayer], e);
		}
	},

	_onMouseMove: function (e) {
		if (!this._map || this._map.dragging.moving() || this._map._animatingZoom) { return; }

		var point = this.getPointFromMouseEvent(e);
		this._handleMouseHover(e, point);
	},

	/// TODO: Modify _initPath to include an extra parameter, a group name
	/// to order symbolizers by z-index

	_updateIcon: function (layer) {
		if (!this._drawing) { return; }

		var icon = layer.options.icon,
		    options = icon.options,
		    size = L.point(options.iconSize),
		    anchor = options.iconAnchor ||
		        	 size && size.divideBy(2, true),
		    p = layer._point.subtract(anchor),
		    ctx = this._ctx,
		    img = layer._getImage();

		if (img.complete) {
			ctx.drawImage(img, p.x, p.y, size.x, size.y);
		} else {
			L.DomEvent.on(img, 'load', function() {
				ctx.drawImage(img, p.x, p.y, size.x, size.y);
			});
		}

		this._drawnLayers[layer._leaflet_id] = layer;
	}
});


L.canvas.tile = function(tileCoord, tileSize, opts){
	return new L.Canvas.Tile(tileCoord, tileSize, opts);
}

