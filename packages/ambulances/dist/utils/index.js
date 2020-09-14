"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var pcFormatter = /(\d{4})\s*(\w{2})/gm;
exports.formatPC = function (pc) {
    return pc && pcFormatter.test(pc) ? pc.replace(pcFormatter, '$1 $2').toUpperCase() : pc;
};
