/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Peter Flannery. All rights reserved.
 *  Licensed under the MIT License. See LICENSE in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { ExpiryCacheMap } from 'common/expiryCacheMap';

const assert = require('assert');

let testCacheMap

export const ExpiryCacheMapTests = {

  beforeEach: () => {
    // setup the client cache
    testCacheMap = new ExpiryCacheMap(60000)
  },

  "hasExpired(key)": {

    "returns true when no key exists": () => {
      const testKey = 'missing';
      assert.ok(testCacheMap.hasExpired(testKey), 'ExpiryCacheMap.hasExpired(key): A missing key should be expired');
    },

    "returns false when the a cache entry is still within the cache duration": () => {
      const testKey = 'key1';
      testCacheMap.set(testKey, {});
      const actual = testCacheMap.hasExpired(testKey);
      assert.ok(actual === false, 'ExpiryCacheMap.hasExpired(key): A cache entry within the cache duration should NOT be expired');
    },

    "returns true when the cache entry is beyond the cache duration": () => {
      const testKey = 'key1';

      testCacheMap = new ExpiryCacheMap(-1);
      testCacheMap.set(testKey, {});
      const actual = testCacheMap.hasExpired(testKey);
      assert.ok(actual, 'ExpiryCacheMap.hasExpired(key): A cache entry beyond the cache duration should be expired');
    }

  },

  "get(key)": {

    "returns undefined if the key does not exist": () => {
      const testKey = 'missing';
      const actual = testCacheMap.get(testKey);
      assert.equal(actual, undefined, 'ExpiryCacheMap.get(key): Should return undefined when the key doesnt exist');
    },

    "returns the data by the key": () => {
      const testKey = 'key1';
      const testData = {};

      testCacheMap = new ExpiryCacheMap(-1);
      testCacheMap.set(testKey, testData);
      const actual = testCacheMap.get(testKey);
      assert.equal(actual, testData, 'ExpiryCacheMap.set(key, data): Should store the data by the key');
    }

  },

  "set(key, data)": {

    "stores the data by the key": () => {
      const testKey = 'key1';
      const testData = {};
      testCacheMap.set(testKey, testData);
      const actual = testCacheMap.get(testKey);
      assert.equal(actual, testData, 'ExpiryCacheMap.set(key, data): Should store the data by the key');
    },

    "returns the data that was set": () => {
      const testKey = 'key1';
      const testData = {};
      const actual = testCacheMap.set(testKey, testData);
      assert.equal(actual, testData, 'ExpiryCacheMap.set(key, data): Should return the data');
    }

  },

  "expire(key)": {

    "expires items in the cache": () => {
      const testKey = 'key1';
      const testData = "initial data";
      
      testCacheMap.set(testKey, testData);
      testCacheMap.expire(testKey);
      assert.ok( testCacheMap.hasExpired(testKey), true, 'ExpiryCacheMap.expire(key): Should expiry the item');

      testCacheMap.set(testKey, "new data"); 
      assert.ok( testCacheMap.get(testKey), "new data", 'ExpiryCacheMap.get(key): Should contain new data');
    }

  }

}