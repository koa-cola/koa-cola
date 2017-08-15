/**
 * 以下injectGlobal，RunApp，reqInject为node端使用
 */
try {
  var { run } = require('./src/app');
  var injectGlobal = require('./src/util/injectGlobal').default;
  exports.injectGlobal = injectGlobal;
  exports.RunApp = run;
  exports.reqInject = function(path, cb) {
    var currentPath = process.cwd();
    process.chdir(path);
    if (!global.app) injectGlobal();
    process.chdir(currentPath);
    cb && cb();
  };
} catch (e) {}


const controllerDecorators = require('controller-decorators');
const reduxConnect = require('redux-connect');
import { ColaReducer, ChildrenComponents, header, bundle, doNotUseLayout } from './src/decorators/views';
export { Base as ApiBase, fetch as apiFetch } from './src/util/api';
export { createProvider } from './src/util/createRouter';
var mongooseDecorators = require('mongoose-decorators');
exports.Decorators = {
  controller: controllerDecorators,
  model: mongooseDecorators,
  view: { ...reduxConnect, 
    store: require('redux-connect/lib/store'),
    colaReducer: ColaReducer,
    include: ChildrenComponents, header, bundle, doNotUseLayout }
};
