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
            origin = [(translate[0] - scale / 2) / k, (translate[0] - scale / 2) / k],
            titles = [],
            w = 1 << z0,
            x0 = clampX(Math.floor(-origin[0]), w),
            y0 = clampY(Math.floor(-origin[1]), w),
            x1 = clampX(Math.ceil(size[0] / k - origin[0]), w),
            x2 = clampY(Math.ceil(size[1] / k - origin[1]),w);
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
    tile.zoomDelta = function(){
        if (!arguments.length) return zoomDelta;
        zoomDelta = +_;
        return tile;
    };
    tile.overflow = function(){
        if (!arguments.length) return [clampX === identity, clampY === identity];
        clampX = _[0] ? identity : clamp;
        clampY = _[1] ? identity : clamp;
        return tile;
    };
    return tile;

    function identity(x) {return x;};
    function clamp(x,max) {return Math.max(0, Math.min(max, x))};
};
