var Mapa = React.createClass({
    render: function(){
        return(
                <div id = "mapa"></div>
        );
    },
    componentDidMount: function(){
        var width = Math.max(960, window.innerWidth),
            height = Math.max(600, window.innerHeight),
            prefijo = prefixMatch(["webkit", "ms", "Moz", "0"]);
        d3.geo.tile = function(){
            var size = [960, 500],
                scale = 256,
                translate = [size[0]/2, size[1]/2],
                zoomDelta = 0,
                clampX = clamp,
                clampY = clamp;
            function tile(){
                var z = Math.max(Math.log(scale)/Math.LN2 - 8, 0),
                    z0 = Math.round(z + zoomDelta),
                    k = Math.pow(2, z - z0 + 8),
                    origin = [(translate[0] - scale / 2) / k, (translate[1] - scale / 2) / k],
                    tiles = [],
                    w = 1 << z0,
                    x0 = clampX(Math.floor(-origin[0]), w),
                    y0 = clampY(Math.floor(-origin[1]), w),
                    x1 = clampX(Math.ceil(size[0] / k - origin[0]), w),
                    y1 = clampY(Math.ceil(size[1] / k - origin[1]), w);
                for(var y = y0; y < y1; ++y){
                    for(var x = x0; x < x1; ++x){
                        tiles.push([x, y, z0]);
                    }
                }
                tiles.translate = origin;
                tiles.scale = k;

                return tiles;
            }
            tile.size = function(_){
                if (!arguments.length) return size;
                size = _;
                return tile;
            };
            tile.scale = function(_){
                if (!arguments.length) return scale;
                scale = _;
                return tile;
            };
            tile.translate = function(_){
                if(!arguments.length) return translate;
                translate = _;
                return tile;
            };
            tile.zoomDelta = function(_){
                if (!arguments.length) return zoomDelta;
                zoomDelta = +_;
                return tile;
            };
            tile.overflow = function(_){
                if (!arguments.length) return [clampX === identity, clampY === identity];
                clampX = _[0] ? identity : clamp;
                clampY = _[1] ? identity : clamp;
                return tile;
            };
            return tile;

            function identity(x) {return x;};
            function clamp(x,max) {return Math.max(0, Math.min(max, x))};
        };
        var tile = d3.geo.tile().size([width, height]).overflow([true, false]);

        var projection = d3.geo.mercator().center([0, 0]);

        var zoom = d3.behavior.zoom()
            .scale(1 << 23)
            .scaleExtent([1 << 10, 1 << 24])
            .translate([width / 2, height / 2])
            .on("zoom", zoomed);

        var map = d3.select("#mapa").append("div")
            .attr("class","map")
            .style("width", width + "px")
            .style("height", height + "px")
            .call(zoom)
            .on("mousemove", mousemoved);

        var layer = map.append("div")
            .attr("class","layer");

        var info = map.append("div")
            .attr("class","info");
        zoomed();
        function zoomed(){
            var tiles = tile
                .scale(zoom.scale())
                .translate(zoom.translate())();
            projection
                .scale(zoom.scale() / 2 / Math.PI)
                .translate(zoom.translate());
            var image = layer
                .style(prefijo + "transform", matrix3d(tiles.scale, tiles.translate))
                .selectAll(".tile")
                .data(tiles, function(d){ return d; });
            image.exit()
                .remove();
            image.enter().append("img")
                .attr("class", "tile")
                .attr("src", function(d){
                    var z = d[2],
                        k = 1 << z,
                        x = (d[0] % k + k) % k,
                        y = d[1];
                    return "http://" + ["a", "b", "c", "d"][Math.random() * 4 | 0] + ".tiles.mapbox.com/v3/examples.map-i86nkdio/" + z + "/" + x + "/" + y + ".png";
                })
                .style("left", function(d){ return (d[0] << 8) + "px"; })
                .style("top", function(d){ return (d[1] << 8) + "px"; });
        };
        function prefixMatch(p){
            var i = -1, n = p.length, s = document.body.style;
            while (++i < n)
                if (p[i] + "Transform" in s)
                    return "-" + p[i].toLowerCase() + "-";
            return "";
        };
        function mousemoved(){
            info.text(formatLocation(projection.invert(d3.mouse(this)), zoom.scale()));
        };
        function matrix3d(scale, translate){
            var k = scale / 256, r = scale % 1 ? Number : Math.round;
            return "matrix3d(" + [k, 0, 0, 0, 0, k, 0, 0, 0, 0, k, 0, r(translate[0] * scale), r(translate[1] * scale), 0, 1] + ")";
        };
        function formatLocation(p, k){
            var format = d3.format("." + Math.floor(Math.log(k) / 2 - 2) + "f");
            return (p[1] < 0 ? format(-p[1]) + "°S" : format(p[1]) + "°N") + " " + (p[0] < 0 ? format(-p[0]) + "°W" : format(p[0]) + "°E");
        };
    }
});

module.exports = Mapa;
