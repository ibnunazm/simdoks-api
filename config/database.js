"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true,
});
exports.default = void 0;
// var _sequelize = require("sequelize");
// const db = new _sequelize.Sequelize("simd3533_simdoks", "simd3533_admin", "fakhriichsan", {
//   host: "localhost",
//   dialect: "mysql",
//   timezone: "+07:00"
// });
// var _default = exports.default = db;

var _sequelize = require("sequelize");
const db = new _sequelize.Sequelize("simdoks", "root", "", {
  host: "localhost",
  dialect: "mysql",
  timezone: "+07:00",
});
var _default = (exports.default = db);
