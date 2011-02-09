#!/usr/local/bin/node

require('goog').goog.init();

var fs_ = require('fs');
var path_ = require('path');

goog.require('goog.testing.jsunit');
goog.require('goog.testing.AsyncTestCase');
goog.require('goog.array');

goog.require('node.goog.tests');

var baseDir = '../';
var testsDirs = ['examples/simple/tests/'];

var testFiles = getAllTestFiles_();

setUpPage = function() { asyncTestCase.stepTimeout = 10000;};

function getAllTestFiles_() {
  var testFiles = [];

  var pattern = /test[\w_\d]+\.js/gi;
  goog.array.forEach(testsDirs, function(d) {
    var files = node.goog.tests.readDirRecursiveSync(
      node.goog.utils.getPath(
        node.goog.utils.getPath(__dirname, baseDir), d), pattern);
    testFiles = goog.array.concat(testFiles, files);
  });
  return testFiles;
}

function readFilesInDir(d, list) {
  var files = fs_.readdirSync(d);
  goog.array.forEach(files, function(f) {
    var path = node.goog.utils.getPath(d, f);
    if (fs_.statSync(path).isDirectory()) {
      return readFilesInDir(path, list);
    } else if (f.toLowerCase().indexOf('test') >= 0 && f.indexOf('.js') > 0) {
      list.push(path);
    }
  });
  return list;
};

testPassingTests = function() {
  assertEquals('Did not find all tests', 2, testFiles.length);
  console.log('testPassingTests:\n\t' + testFiles.join('\n\t'));
  runNextTest();
};

function runNextTest() {
    if (testFiles.length === 0) { return console.log('All tests finnished.'); }
    var test = testFiles.pop();
    runTestImpl(test, function() {
      runNextTest();
    });
};

function runTestImpl(file, callback) {
  console.log('running test ' + file);
  asyncTestCase.waitForAsync();
  require('child_process').exec(file,
      function(err, stdout, stderr) {
    var shortFile = file.substring(file.lastIndexOf('/') + 1);
    assertNull('There were errors trying to run test: ' + shortFile, err);

    assertTrue('Some tests in file[' + shortFile + '] failed.',
      stdout.indexOf(', 0 failed') > 0);
    asyncTestCase.continueTesting();
    callback();
  });
};

var asyncTestCase = goog.testing.AsyncTestCase.createAndInstall();