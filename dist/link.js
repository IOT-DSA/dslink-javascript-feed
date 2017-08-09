"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const DS = require("dslink");
exports.DS = DS;
const feed_1 = require("./nodes/feed");
const structure_1 = require("./structure");
exports.link = new DS.LinkProvider(process.argv.slice(2), 'Feed-', {
    defaultNodes: structure_1.defaultNodes,
    profiles: {
        feed(path, provider) {
            return new feed_1.FeedNode(path, provider);
        },
        addFeed(path, provider) {
            return new DS.SimpleActionNode(path, provider, params => {
                if (!params.name || !params.url) {
                    return;
                }
                const { name, url } = params;
                exports.link.addNode(`/${name}`, structure_1.feedStructure(url));
                exports.link.save();
            });
        },
        remove(path, provider) {
            return new DS.SimpleActionNode(path, provider, (params, node) => {
                node.parent.remove();
            });
        }
    }
});
