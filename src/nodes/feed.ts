import FeedParser = require("feedparser");

import { Transform } from "stream";
import req = require("request");
import rp = require("request-promise-native");

import { DS } from "../link";
import { articleStructure, Article } from "../structure";

import { createHash } from "crypto";

// we have to include user agent for some feeds to give valid response
// this is from Chrome 60
const USER_AGENT = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_2) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/60.0.3112.78 Safari/537.36";

function Object_values(obj: object) {
  if ((<any>Object).values) {
    return (<any>Object).values(obj);
  }

  const values = [];
  for (const prop in obj) {
    if (obj.hasOwnProperty(prop)) {
      values.push(obj[prop]);
    }
  }

  return values;
}

export class FeedNode extends DS.SimpleNode {
  _syncing: boolean;
  _removed: boolean;

  constructor(path: string, provider: DS.SimpleNodeProvider) {
    super(path, provider);
  }

  getUrl(): string {
    return this.configs.$feed_url;
  }

  onCreated(): Promise<any> {
    super.onCreated();
    
    const url = this.getUrl();
    if (!url) {
      return;
    }

    // ten second update loop
    setInterval(() => {
      if (this._syncing || this._removed) {
        return;
      }

      try {
        this._syncing = true;
        this.update(url);
      } catch(e) {
        console.log(e);
      } finally {
        this._syncing = false;
      }
    }, 10 * 1000);

    return this.update(url);
  }

  fetch(uri: string): Promise<Article[]> {    
    return rp({
      uri,
      headers: {
        "User-Agent": USER_AGENT,
        "Accept": "text/html,application/xhtml+xml"
      },
      resolveWithFullResponse: true
    })
    .then((res: req.RequestResponse) => {
      return new Promise<Article[]>((resolve, reject) => {
        const parser: Transform = new FeedParser();
        const articles: Article[] = [];

        parser.on("error", err => reject(err));
        parser.on("end", () => resolve(articles));

        parser.on("readable", _ => {
          let article: Article;
          while (article = parser.read()) {
            articles.push(article);
          }
        });

        parser.write(res.body);
        parser.push(null);
      });
    });
  }

  getHash(guid: string) {
    const hash = createHash("sha1");
    hash.update(guid);
    return hash.digest("hex");
  }

  async update(uri: string): Promise<void> {
    const articles = await this.fetch(uri);

    Object_values(this.children)
      .forEach((child: DS.SimpleNode) => {
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

      const node: DS.SimpleNode = this.provider.addNode(`${this.path}/${hash}`, 
        articleStructure(article));

      node.serializable = false;
    });
  }

  onRemoving(): any {
    super.onRemoving();
    this._removed = true;
  }
} 