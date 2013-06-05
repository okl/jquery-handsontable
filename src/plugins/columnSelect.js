/**
 * RL: This plugin selects all the cells in a column
 * @constructor
 */
function HandsontableColumnSelect() {
  var plugin = this;

  this.afterInit = function () {
    var instance = this;
    if (this.getSettings().columnSelect) {
      this.sortIndex = [];
      this.rootElement.on('click.handsontable', '.columnSelect', function (e) {
        var $target = $(e.target);
        if ($target.is('.columnSelect')) {

          var col = parseInt($target.attr('rel')) || parseInt($target.parent('div').attr('rel'));
          var totalRows = instance.countRows();
          instance.selectCell(0, col, totalRows - 1, col, false);

        }
      });
    }
  };

  this.getColHeader = function (col, TH) {
    if (this.getSettings().columnSelect) {
      $(TH).find('span.colHeader').addClass('columnSelect');
      $(TH).find('span.colHeader').parent().addClass('columnSelect');
      $(TH).children('div').attr('rel', col);
    }
  };
}
var htSelectColumn = new HandsontableColumnSelect();

Handsontable.PluginHooks.add('afterInit', htSelectColumn.afterInit);
Handsontable.PluginHooks.add('afterGetColHeader', htSelectColumn.getColHeader);