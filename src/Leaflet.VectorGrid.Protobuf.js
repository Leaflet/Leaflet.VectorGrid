
// Network & Protobuf powered!
// NOTE: Assumes the globals `VectorTile` and `Pbf` exist!!!
L.VectorGrid.Protobuf = L.VectorGrid.extend({

	options: {
		subdomains: 'abc',	// Like L.TileLayer
	},


	initialize: function(url, options) {
		// Inherits options from geojson-vt!
// 		this._slicer = geojsonvt(geojson, options);
		this._url = url;
		L.VectorGrid.prototype.initialize.call(this, options);
	},


	_getSubdomain: L.TileLayer.prototype._getSubdomain,


	_getVectorTilePromise: function(coords) {

		var promise;

		if (this.options.bbox) {
			var bboxCoords = this._merc.bbox(coords.x, coords.y, coords.z);
			var tileBbox = L.latLngBounds(L.latLng(bboxCoords[1], bboxCoords[0]), L.latLng(bboxCoords[3], bboxCoords[2]));

			if (!this.options.bbox.overlaps(tileBbox)) {
				promise = Promise.resolve({ layers:[] });
			}
		}

		if (!promise) {
			var tileUrl = L.Util.template(this._url, L.extend({
				s: this._getSubdomain(coords),
				x: coords.x,
				y: coords.y,
				z: coords.z
	// 			z: this._getZoomForUrl()	/// TODO: Maybe replicate TileLayer's maxNativeZoom
			}, this.options));

			promise = fetch(tileUrl).then(function(response){

				if (!response.ok) {
					return {layers:[]};
				}

				return response.blob().then( function (blob) {
	// 				console.log(blob);

					var reader = new FileReader();
					return new Promise(function(resolve){
						reader.addEventListener("loadend", function() {
							// reader.result contains the contents of blob as a typed array

							// blob.type === 'application/x-protobuf'
							var pbf = new Pbf( reader.result );
	// 						console.log(pbf);
							return resolve(new vectorTile.VectorTile( pbf ));

						});
						reader.readAsArrayBuffer(blob);
					});
				});
			})
		}

		return promise.then(function(json){

// 			console.log('Vector tile:', json.layers);
// 			console.log('Vector tile water:', json.layers.water);	// Instance of VectorTileLayer

			// Normalize feature getters into actual instanced features
			for (var layerName in json.layers) {
				var feats = [];

				for (var i=0; i<json.layers[layerName].length; i++) {
					var feat = json.layers[layerName].feature(i);
					feat.geometry = feat.loadGeometry();
					feats.push(feat);
				}

				json.layers[layerName].features = feats;
			}

			return json;
		});
	}
});


L.vectorGrid.protobuf = function (url, options) {
	return new L.VectorGrid.Protobuf(url, options);
};
