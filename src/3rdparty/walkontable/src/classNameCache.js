/**
 * WalkontableClassNameList
 * @constructor
 */
function WalkontableClassNameCache() {
  this.cache = [];
}

WalkontableClassNameCache.prototype.add = function (r, c, cls) {
  if (!this.cache[r]) {
    this.cache[r] = [];
  }
  if (!this.cache[r][c]) {
    this.cache[r][c] = [];
  }
  this.cache[r][c][cls] = true;
};

// NM: Removable cache names
WalkontableClassNameCache.prototype.remove = function (r, c, cls) {
  if (!this.cache[r]) {
  this.cache[r] = [];
  }
  if (!this.cache[r][c]) {
  this.cache[r][c] = [];
  }
  delete this.cache[r][c][cls];
};

WalkontableClassNameCache.prototype.test = function (r, c, cls) {
  return (this.cache[r] && this.cache[r][c] && this.cache[r][c][cls]);
};