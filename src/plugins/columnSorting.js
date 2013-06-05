/**
 * This plugin sorts the view by a column (but does not sort the data source!)
 * @constructor
 */
function HandsontableColumnSorting() {
  var plugin = this;
  var sortingEnabled;

  this.afterInit = function () {
    var instance = this;
    if (this.getSettings().columnSorting) {
      this.sortIndex = [];
      this.rootElement.on('click.handsontable', '.columnSorting', function (e) {
        var $target = $(e.target);
        if ($target.is('.columnSorting')) {
          var col = $target.closest('th').index();
          if (instance.getSettings().rowHeaders) {
            col--;
          }
          if (instance.sortColumn === col) {
            instance.sortOrder = !instance.sortOrder;
          }
          else {
            instance.sortColumn = col;
            instance.sortOrder = true;
          }
          plugin.sort.call(instance);
          instance.render();
        }
      });
    }
  };

  this.sort = function () {
    sortingEnabled = false;
    var instance = this;
    this.sortIndex.length = 0;
    //var data = this.getData();
    for (var i = 0, ilen = this.countRows(); i < ilen; i++) {
      //this.sortIndex.push([i, data[i][this.sortColumn]]);
      this.sortIndex.push([i, instance.getDataAtCell(i, this.sortColumn)]);
    }
    

    // NM: Replace with case-insensitive natural sort     
    /* https://github.com/overset/javascript-natural-sort
     * Natural Sort algorithm for Javascript - Version 0.7 - Released under MIT license
     * Author: Jim Palmer (based on chunking idea from Dave Koelle)
     */
    function naturalSort(a, b) {
      naturalSort.insensitive = true;

      var re = /(^-?[0-9]+(\.?[0-9]*)[df]?e?[0-9]?$|^0x[0-9a-f]+$|[0-9]+)/gi,
        sre = /(^[ ]*|[ ]*$)/g,
        dre = /(^([\w ]+,?[\w ]+)?[\w ]+,?[\w ]+\d+:\d+(:\d+)?[\w ]?|^\d{1,4}[\/\-]\d{1,4}[\/\-]\d{1,4}|^\w+, \w+ \d+, \d{4})/,
        hre = /^0x[0-9a-f]+$/i,
        ore = /^0/,
        i = function(s) { return naturalSort.insensitive && (''+s).toLowerCase() || ''+s },
        // convert all to strings strip whitespace
        x = i(a[1]).replace(sre, '') || '',
        y = i(b[1]).replace(sre, '') || '',
        // chunk/tokenize
        xN = x.replace(re, '\0$1\0').replace(/\0$/,'').replace(/^\0/,'').split('\0'),
        yN = y.replace(re, '\0$1\0').replace(/\0$/,'').replace(/^\0/,'').split('\0'),
        // numeric, hex or date detection
        xD = parseInt(x.match(hre)) || (xN.length != 1 && x.match(dre) && Date.parse(x)),
        yD = parseInt(y.match(hre)) || xD && y.match(dre) && Date.parse(y) || null,
        adjustment = (instance.sortOrder ? -1 : 1),
        oFxNcL, oFyNcL, raw;
      // // first try and sort Hex codes or Dates
      // if (yD)
      //   if ( xD < yD ) return -1;
      //   else if ( xD > yD ) return 1;
      // natural sorting through split numeric strings and default strings
      for(var cLoc=0, numS=Math.max(xN.length, yN.length); cLoc < numS; cLoc++) {
        // find floats not starting with '0', string or 0 if not defined (Clint Priest)
        oFxNcL = !(xN[cLoc] || '').match(ore) && parseFloat(xN[cLoc]) || xN[cLoc] || 0;
        oFyNcL = !(yN[cLoc] || '').match(ore) && parseFloat(yN[cLoc]) || yN[cLoc] || 0;
        // handle numeric vs string comparison - number < string - (Kyle Adams)
        // HM: multiply by instance sort state
        if (isNaN(oFxNcL) !== isNaN(oFyNcL)) { 
          raw = (isNaN(oFxNcL)) ? 1 : -1;
          return (raw * adjustment); 
        }
        // rely on string comparison if different types - i.e. '02' < 2 != '02' < '2'
        else if (typeof oFxNcL !== typeof oFyNcL) {
          oFxNcL += '';
          oFyNcL += '';
        }
        // NM: instance sort state
        if (oFxNcL < oFyNcL) return instance.sortOrder ? -1 : 1;
        if (oFxNcL > oFyNcL) return instance.sortOrder ? 1 : -1;
      }
      return 0;
    };

    this.sortIndex.sort(naturalSort);
    sortingEnabled = true;
  };

  this.translateRow = function (getVars) {
    if (sortingEnabled && this.sortIndex && this.sortIndex.length) {
      getVars.row = this.sortIndex[getVars.row][0];
    }
  };

  this.getColHeader = function (col, TH) {
    var _settings = this.getSettings();
    if (_settings.columnSorting) {

      // NM: Modfiy Col Sort Handler
      // if selectively sort columns && this col is sort=true
      if (_settings.selectiveSort && _settings.columns[col].sort) {
        $(TH).find('span.colHeader').append($('<span class="columnSorting columnActionBtn"></span>'));
      
      // If non-selective sorting, add trigger class to all headers
      } else if (!_settings.selectiveSort) {
        $(TH).find('span.colHeader')[0].className += ' columnSorting';
      }
    }
  };
}
var htSortColumn = new HandsontableColumnSorting();

Handsontable.PluginHooks.add('afterInit', htSortColumn.afterInit);
Handsontable.PluginHooks.add('beforeGet', htSortColumn.translateRow);
Handsontable.PluginHooks.add('beforeSet', htSortColumn.translateRow);
Handsontable.PluginHooks.add('afterGetColHeader', htSortColumn.getColHeader);