var CacheEntry = require('../models/cacheEntry');
var co = require('co');

describe('CacheEntry', function() {

  describe('getOrGenerate', function() {

    before(function*() {
      yield CacheEntry.destroy({});
    });

    var value = Math.random();

    var called = 0;

    function* generateLong() {
      yield function(callback) {
        setTimeout(callback, 150);
      };

      called++;

      return value;
    }

    it("Inserts the new value instantly", function*() {
      var result = yield CacheEntry.getOrGenerate({ key: 'test' }, generateLong);
      called.should.be.eql(1);
      result.should.be.eql(value);
    });

    it("Can find it", function*() {
      var result = yield CacheEntry.getOrGenerate({ key: 'test' }, generateLong);
      called.should.be.eql(1);
      result.should.be.eql(value);
    });


  });


  describe('getOrGenerate', function() {

    beforeEach(function*() {
      yield CacheEntry.destroy({});
    });

    var value = Math.random();

    var called = 0;

    function* generateLong() {
      yield function(callback) {
        setTimeout(callback, 150);
      };

      called++;

      return value;
    }

    describe("when many cache requests", function() {
      it("Should run the generator only once", function*() {

        var results = yield [
          CacheEntry.getOrGenerate({ key: 'test' }, generateLong),
          CacheEntry.getOrGenerate({ key: 'test' }, generateLong),
          CacheEntry.getOrGenerate({ key: 'test' }, generateLong)
        ];
        called.should.be.eql(1);
        results.forEach(function(result) {
          result.should.be.eql(value);
        });

      });
    });

    describe("when set while generating", function() {
      it("Should use the latest (generated) value", function*() {
        var result = yield [
          CacheEntry.getOrGenerate({key: 'test'}, generateLong),
          co(function*() {
            yield function(callback) {
              setTimeout(callback, 50);
            };

            yield* CacheEntry.set({key: 'test', value: 'set'});
          })
        ];
        result[0].should.be.eql('set');
      });
    });

  });


});
