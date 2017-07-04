"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const controllerDecorators = require("controller-decorators");
// import * as mongooseDecorators from 'mongoose-decorators';
const reduxConnect = require("redux-connect");
try {
    var mongooseDecorators = require('mongoose-decorators');
}
catch (e) { }
exports.default = {
    controller: controllerDecorators,
    model: mongooseDecorators,
    view: Object.assign(reduxConnect, { store: require('redux-connect/lib/store') })
};
