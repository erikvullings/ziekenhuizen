"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var path_1 = __importDefault(require("path"));
var papaparse_1 = __importDefault(require("papaparse"));
var file = path_1.default.join(process.cwd(), './data/ambulancestandplaatsen.csv');
papaparse_1.default.parse(file, {
    complete: function (results) {
        console.log('Finished:', results.data);
    },
});
