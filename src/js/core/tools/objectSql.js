// Generated by CoffeeScript 1.7.1
(function() {
  var _propertyIIFE;

  (_propertyIIFE = function(OJ) {
    var from, query, run, select;
    select = function() {
      var args, query, slice;
      query = this;
      slice = Array.prototype.slice;
      args = slice.call(arguments_, 0);
      query.columns = query.columns || [];
      OJ.each(args, function(argumentValue) {
        query.columns.push(argumentValue);
      });
      return query;
    };
    run = function() {
      var firstResult, query, results, ret, returnRows;
      query = this;
      ret = [];
      if (query.columns.length > 0) {
        results = [];
        OJ.each(query.columns, function(columnName) {
          OJ.each(query.tables, (function(tbl) {
            var res, val;
            if (Array.isArray(tbl)) {
              res = {};
              val = tbl._select(function(val) {
                return val[columnName];
              });
              if (val) {
                res[columnName] = val;
                results.push(res);
              }
            }
          }), true);
        });
        returnRows = [];
        if (results && results.length > 0) {
          firstResult = results[0];
          OJ.each(firstResult, (function(val, key) {
            OJ.each(val, (function(cell) {
              var row;
              row = {};
              row[key] = cell;
              OJ.each(results.slice(1), (function(result) {
                OJ.each(result, (function(v, k) {
                  OJ.each(v, function(c) {
                    row[k] = c;
                  });
                }), true);
              }), true);
              returnRows.push(row);
            }), true);
          }), true);
        }
      }
      return returnRows;
    };
    from = function(array) {
      var query;
      query = this;
      query.tables.push(array);
      return query;
    };
    Object.defineProperties(Array.prototype, {
      _where: {
        value: function(func) {
          return OJ.filter(func, this);
        }
      },
      _select: {
        value: function(func) {
          return OJ.map(func, this);
        }
      }
    });
    query = function(array) {
      var tables, _query;
      tables = [];
      tables.push(array);
      _query = {
        tables: tables,
        from: from,
        select: select,
        run: run
      };
      return _query;
    };
    OJ.register("objectSql", query);
  })((typeof global !== 'undefined' && global ? global : (typeof window !== 'undefined' ? window : this)).OJ);

}).call(this);

//# sourceMappingURL=objectSql.map
