/*
* This extension allows highcharts to show a secondary legend for series has 'showInSecondaryLegend' option set to true.
* And secondaryLegend option of chart is used to make the position or style diffrence to the original legend.
*/
(function () {
  "use strict";
  var originalLegendPrototype = Highcharts.Legend.prototype,
    legendBase = $.extend({
      _superInit: originalLegendPrototype.init,
      _superRender: originalLegendPrototype.render,
      _superDestroy: originalLegendPrototype.destroy
    }, Highcharts.Legend.prototype);
 
  Highcharts.Legend.prototype = $.extend({}, legendBase, {
    // extend init to create secondary legend.
    init: function (chart) {
      var that = this;
 
      that._superInit(chart);
 
      // secondary legend options is required and there should be series uses secondary legend.
      if (chart.options.secondaryLegend && that._hasSecondaryLegendSeries(chart)) {
        chart.secondaryLegend = new Highcharts.SecondaryLegend(chart);
      }
    },
    // extend render to render secondary legend.
    render: function () {
      var that = this,
        chart = that.chart;
 
      // filter series uses secondary legend.
      if (chart.options.secondaryLegend) {
        that._filterSecondaryLegendSeries();
      }
 
      // render primary legend.
      that._superRender();
 
      // if chart has secondary legend, render it.
      if (chart.secondaryLegend) {
        chart.secondaryLegend.render();
      }
    },
    destroy: function () {
      if (this.chart.secondaryLegend) {
        this.chart.secondaryLegend.destroy();
      }
      this._superDestroy();
    },
    _hasSecondaryLegendSeries: function (chart) {
      var result = false;
      $(chart.series).each(function () {
        result = this.options.showInSecondaryLegend;
        return !result;
      });
      return result;
    },
    _filterSecondaryLegendSeries: function () {
      $(this.chart.series).each(function () {
        var filteringSeriesOptions = this.options;
        if (filteringSeriesOptions.showInSecondaryLegend === true) {
          filteringSeriesOptions.showInLegend = false;
        }
      });
    }
  });
 
  // secondary legend Class
  Highcharts.SecondaryLegend = function (chart) {
    this.init(chart);
  };
 
  Highcharts.SecondaryLegend.prototype = $.extend({}, legendBase, {
    defaultOptions: Highcharts.getOptions().legend,
    init: function (chart) {
      var that = this;
      that._switchSecondaryLegendOptions(chart);
      that._superInit(chart);
      if (that.primaryLegendOptionsBackup) {
        that._restorePrimaryLegendOptions(chart);
      }
    },
    render: function () {
      var that = this,
        chart = that.chart;
 
      that._filterPrimaryLegendSeries();
 
      if (!that.primaryLegendOptionsBackup) {
        that._switchSecondaryLegendOptions(chart);
      }
 
      that._superRender();
 
      that._restorePrimaryLegends();
 
      if (that.primaryLegendOptionsBackup) {
        that._restorePrimaryLegendOptions(chart);
      }
    },
    destroy: function () {
      this._superDestroy();
    },
    _filterPrimaryLegendSeries: function () {
      var that = this;
      that.primaryShowInLegendsBackup = [];
 
      $(that.chart.series).each(function () {
        var filteringSeriesOptions = this.options;
        that.primaryShowInLegendsBackup.push(filteringSeriesOptions.showInLegend);
        filteringSeriesOptions.showInLegend = filteringSeriesOptions.showInSecondaryLegend === true ? true : false;
      });
    },
    _restorePrimaryLegends: function () {
      var that = this;
      $(that.primaryShowInLegendsBackup).each(function (index, showInLegend) {
        that.chart.series[index].options.showInLegend = showInLegend;
      });
    },
    _switchSecondaryLegendOptions: function (chart) {
      var chartOptions = chart.options;
      this.primaryLegendOptionsBackup = chartOptions.legend;
      chartOptions.legend = $.extend(true, {}, this.defaultOptions, chartOptions.secondaryLegend);
    },
    _restorePrimaryLegendOptions: function (chart) {
      var chartOptions = chart.options;
      chartOptions.legend = this.primaryLegendOptionsBackup;
      delete this.primaryLegendOptionsBackup;
    }
  });
}());
