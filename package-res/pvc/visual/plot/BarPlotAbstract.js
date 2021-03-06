/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * Initializes an abstract bar plot.
 *
 * @name pvc.visual.BarPlotAbstract
 * @class Represents an abstract bar plot.
 * @extends pvc.visual.CategoricalPlot
 */
def
.type('pvc.visual.BarPlotAbstract', pvc.visual.CategoricalPlot)
.add({
    _getOptionsDefinition: function(){
        return pvc.visual.BarPlotAbstract.optionsDef;
    }
});

pvc.visual.BarPlotAbstract.optionsDef = def.create(
    pvc.visual.CategoricalPlot.optionsDef, {

    BarSizeRatio: { // for grouped bars
        resolve: '_resolveFull',
        cast: function(value){
            value = pvc.castNumber(value);
            if(value == null){
                value = 1;
            } else if(value < 0.05){
                value = 0.05;
            } else if(value > 1){
                value = 1;
            }

            return value;
        },
        value: 0.9
    },

    BarSizeMax: {
        resolve: '_resolveFull',
        data: {
            resolveV1: function(optionInfo){
                // default to v1 option
                this._specifyChartOption(optionInfo, 'maxBarSize');
                return true;
            }
        },
        cast: function(value){
            value = pvc.castNumber(value);
            if(value == null){
                value = Infinity;
            } else if(value < 1){
                value = 1;
            }

            return value;
        },
        value: 2000
    },

    BarOrthoSizeMin: {
        resolve: '_resolveFull',
        cast:    pvc.castNonNegativeNumber,
        value:   1.5 // px
    },

    BarStackedMargin: { // for stacked bars
        resolve: '_resolveFull',
        cast: function(value){
            value = pvc.castNumber(value);
            if(value != null && value < 0){
                value = 0;
            }

            return value;
        },
        value: 0
    },

    OverflowMarkersVisible: {
        resolve: '_resolveFull',
        cast:    Boolean,
        value:   true
    },

    ValuesAnchor: { // override default value only
        value: 'center'
    }
});