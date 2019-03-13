"use strict";
/**
 * 加载中间件
 * 包括默认的中间件和自定义中间件
 */
Object.defineProperty(exports, "__esModule", { value: true });
const validate_1 = require("./validate");
function createMiddleware(koaApp) {
    var defaultMiddlewares = require('./defaultMiddlewares').default;
    var middlewares = app.config.middlewares || {};
    var validators = app.config.validators || {};
    var customMiddlewares = [];
    Object.keys(middlewares).forEach(key => {
        if (middlewares[key]) {
            try {
                var module = app.middlewares[key];
                var middleware = module.default || module;
                customMiddlewares.push({
                    name: key,
                    func: middleware
                });
            }
            catch (e) {
                /* istanbul ignore next */
                console.log(`middleware ${key} not found.`);
            }
        }
        else {
            defaultMiddlewares = defaultMiddlewares.filter(item => item.name != key);
        }
    });
    Object.keys(validators).forEach(key => {
        var validator = validators[key];
        customMiddlewares.push({
            name: `validate_${key}`,
            func: validate_1.default,
            args: validator
        });
    });
    // 合并中间件
    var combineMiddlewares = [...defaultMiddlewares.filter(item => !customMiddlewares.find(item2 => item2.name == item.name)), ...customMiddlewares];
    var keys = combineMiddlewares.map(item => item.name);
    // 排序
    if (app.config.sort) {
        keys = app.config.sort(keys);
    }
    keys.forEach(key => {
        var middleware = combineMiddlewares.find(item => item.name == key);
        if (middleware && middleware.func) {
            console.log('mounting middleware : ' + key);
            koaApp.use(middleware.func(typeof middleware.args == 'function' ? middleware.args() : middleware.args));
        }
    });
}
exports.default = createMiddleware;
//# sourceMappingURL=mountMiddleware.js.map