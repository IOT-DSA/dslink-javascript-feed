"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const link_1 = require("./link");
link_1.link.init();
link_1.link.connect().then(_ => {
    setInterval(_ => {
        link_1.link.save();
    }, 1000 * 2.5);
});
