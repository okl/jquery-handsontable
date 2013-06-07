function WalkontableSelection(instance, settings) {
  this.instance = instance;
  this.settings = settings;
  this.selected = [];
  if (settings.border) {
    this.border = new WalkontableBorder(instance, settings);
  }
}

WalkontableSelection.prototype.add = function (coords) {
  this.selected.push(coords);
};

WalkontableSelection.prototype.clear = function () {
  this.selected.length = 0; //http://jsperf.com/clear-arrayxxx
};

/**
 * Returns the top left (TL) and bottom right (BR) selection coordinates
 * @returns {Object}
 */
WalkontableSelection.prototype.getCorners = function () {
  var minRow
    , minColumn
    , maxRow
    , maxColumn
    , i
    , ilen = this.selected.length;

  if (ilen > 0) {
    minRow = maxRow = this.selected[0][0];
    minColumn = maxColumn = this.selected[0][1];

    if (ilen > 1) {
      for (i = 1; i < ilen; i++) {
        if (this.selected[i][0] < minRow) {
          minRow = this.selected[i][0];
        }
        else if (this.selected[i][0] > maxRow) {
          maxRow = this.selected[i][0];
        }

        if (this.selected[i][1] < minColumn) {
          minColumn = this.selected[i][1];
        }
        else if (this.selected[i][1] > maxColumn) {
          maxColumn = this.selected[i][1];
        }
      }
    }
  }

  return [minRow, minColumn, maxRow, maxColumn];
};

// NM: Selection Helpers start
WalkontableSelection.prototype.isColumn = function (corners) {
  corners = corners || this.getCorners();
  return corners[1] == corners[3];
};

WalkontableSelection.prototype.isRow = function (corners) {
  corners = corners || this.getCorners();
  return corners[0] == corners[2];
};

WalkontableSelection.prototype.isFullColumn = function (corners, totalRows) {
  corners = corners || this.getCorners();
  totalRows = totalRows || this.instance.getSetting('totalRows');
  return (this.isColumn(corners) && (corners[0] == 0) && (corners[2] == totalRows - 1));
};
// NM: Selection Helpers end

WalkontableSelection.prototype.draw = function () {
  // NM: additional vars
  var corners, r, c, source_r, source_c, isMultiCol, isMultiRow;

  var visibleRows = this.instance.wtTable.rowStrategy.countVisible()
    , visibleColumns = this.instance.wtTable.columnStrategy.countVisible();

  if (this.selected.length) {
    corners = this.getCorners();
    // NM: NEX-204 Column select handling 
    isMultiCol = !this.isColumn(corners);
    isMultiRow = !this.isRow(corners);

    for (r = 0; r < visibleRows; r++) {
      for (c = 0; c < visibleColumns; c++) {
        source_r = this.instance.wtTable.rowFilter.visibleToSource(r);
        source_c = this.instance.wtTable.columnFilter.visibleToSource(c);

        if (source_r >= corners[0] && source_r <= corners[2] && source_c >= corners[1] && source_c <= corners[3]) {
          //selected cell
          this.instance.wtTable.currentCellCache.add(r, c, this.settings.className);
        }
        else if (source_r >= corners[0] && source_r <= corners[2]) {
          //selection is in this row
          // NM: NEX-204 Multi-row handling
          if (isMultiRow) {
            this.instance.wtTable.currentCellCache.remove(r, c, this.settings.highlightRowClassName);
          } else {
            this.instance.wtTable.currentCellCache.add(r, c, this.settings.highlightRowClassName);
          }
          // this.instance.wtTable.currentCellCache.add(r, c, this.settings.highlightRowClassName);
        }
        else if (source_c >= corners[1] && source_c <= corners[3]) {
          //selection is in this column
          this.instance.wtTable.currentCellCache.add(r, c, this.settings.highlightColumnClassName);
        }
      }
    }

    this.border && this.border.appear(corners); //warning! border.appear modifies corners!
  }
  else {
    this.border && this.border.disappear();
  }
};
