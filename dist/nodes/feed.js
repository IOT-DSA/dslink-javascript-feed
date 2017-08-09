"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const FeedParser = require("feedparser");
const rp = require("request-promise-native");
const link_1 = require("../link");
const structure_1 = require("../structure");
const crypto_1 = require("crypto");
const USER_AGENT = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_2) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/60.0.3112.78 Safari/537.36";
function Object_values(obj) {
    if (Object.values) {
        return Object.values(obj);
    }
    const values = [];
    for (const prop in obj) {
        if (obj.hasOwnProperty(prop)) {
            values.push(obj[prop]);
        }
    }
    return values;
}
class FeedNode extends link_1.DS.SimpleNode {
    constructor(path, provider) {
        super(path, provider);
    }
    getUrl() {
        return this.configs.$feed_url;
    }
    onCreated() {
        super.onCreated();
        const url = this.getUrl();
        if (!url) {
            return;
        }
        setInterval(() => {
            if (this._syncing || this._removed) {
                return;
            }
            try {
                this._syncing = true;
                this.update(url);
            }
            catch (e) {
                console.log(e);
            }
            finally {
                this._syncing = false;
            }
        }, 10 * 1000);
        return this.update(url);
    }
    fetch(uri) {
        return rp({
            uri,
            headers: {
                "User-Agent": USER_AGENT,
                "Accept": "text/html,application/xhtml+xml"
            },
            resolveWithFullResponse: true
        })
            .then((res) => {
            return new Promise((resolve, reject) => {
                const parser = new FeedParser();
                const articles = [];
                parser.on("error", err => reject(err));
                parser.on("end", () => resolve(articles));
                parser.on("readable", _ => {
                    let article;
                    while (article = parser.read()) {
                        articles.push(article);
                    }
                });
                parser.write(res.body);
                parser.push(null);
            });
        });
    }
    getHash(guid) {
        const hash = crypto_1.createHash("sha1");
        hash.update(guid);
        return hash.digest("hex");
    }
    update(uri) {
        return __awaiter(this, void 0, void 0, function* () {
            const articles = yield this.fetch(uri);
            Object_values(this.children)
                .forEach((child) => {
                if (child.configs.$invokable || !child.configs.$guid) {
                    return;
                }
                this.provider.removeNode(child.path);
            });
            articles.forEach(article => {
                const { guid } = article;
                const hash = this.getHash(guid);
                if (this.children.hash) {
                    return;
                }
                const node = this.provider.addNode(`${this.path}/${hash}`, structure_1.articleStructure(article));
                node.serializable = false;
            });
        });
    }
    onRemoving() {
        super.onRemoving();
        this._removed = true;
    }
}
exports.FeedNode = FeedNode;
