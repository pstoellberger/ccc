/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * MetricXYAbstract is the base class of metric XY charts.
 * (Metric stands for:
 *   Measure, Continuous or Not-categorical base and ortho axis)
 */
def
.type('pvc.MetricXYAbstract', pvc.CartesianAbstract)
.add({
    _processOptionsCore: function(options) {
        
        this.base(options);
        
        // Has no meaning in this chart type
        // Only used by discrete scales
        options.panelSizeRatio = 1;
    },

    /**
     * Initializes each chart's specific roles.
     * @override
     */
    _initVisualRoles: function() {

        this.base();

        this._addVisualRole('x', {
            isMeasure:  true,
            isRequired: true,
            requireSingleDimension: true,
            requireIsDiscrete: false,
            defaultDimension: 'x',
            dimensionDefaults: {
                valueType: this.options.timeSeries ? Date : Number
            }
        });
        
        this._addVisualRole('y', {
            isMeasure:  true,
            isRequired: true,
            requireSingleDimension: true,
            requireIsDiscrete: false,
            defaultDimension: 'y',
            dimensionDefaults: {valueType: Number}
        });
    },
            
    _generateTrendsDataCellCore: function(newDatums, dataCell, trendInfo) {
        var serRole = this._serRole;
        var xRole   = this.visualRoles.x;
        var yRole   = dataCell.role;
        var trendOptions = dataCell.trend;
        
        this._warnSingleContinuousValueRole(yRole);
        
        var dataPartDimName = this._dataPartRole.firstDimensionName();
        var xDimName = xRole.firstDimensionName();
        var yDimName = yRole.firstDimensionName();
        
        // Visible part data, possibly grouped by series (if series is bound)
        var data = this.visibleData(dataCell.dataPartValue); // [ignoreNulls=true]
        
        // For each series...
        // Or data already only contains visible data
        // Or null series
        def
        .scope(function() { return serRole.isBound() ? data.children() : def.query([data]); })
        .each(genSeriesTrend, this);
        
        function genSeriesTrend(serData) {
            var funX    = function(datum) { return datum.atoms[xDimName].value; };
            var funY    = function(datum) { return datum.atoms[yDimName].value; };
            var datums  = serData.datums().sort(null, /* by */funX).array();
            var options = def.create(trendOptions, {rows: def.query(datums), x: funX, y: funY});

            var trendModel = trendInfo.model(options);
            if(trendModel) {
                // If a label has already been registered, it is preserved... (See BaseChart#_fixTrendsLabel)
                var dataPartAtom = 
                    data.owner
                        .dimensions(dataPartDimName)
                        .intern(this.root._firstTrendAtomProto);
                
                datums.forEach(function(datum, index) {
                    var trendX = funX(datum);
                    if(trendX) {
                        var trendY = trendModel.sample(trendX, funY(datum), index);
                        if(trendY != null) {
                            var atoms = 
                                def.set(
                                    Object.create(serData.atoms), // just common atoms
                                    xDimName, trendX,
                                    yDimName, trendY,
                                    dataPartDimName, dataPartAtom);
                            
                            newDatums.push(
                                def.set(
                                    new pvc.data.Datum(data.owner, atoms),
                                    'isVirtual', true,
                                    'isTrend',   true,
                                    'trendType', trendInfo.type));
                        }
                    }
                });
            }
        }
    }
});
