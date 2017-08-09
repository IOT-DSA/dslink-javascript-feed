import * as DS from "dslink";
import { FeedNode } from "./nodes/feed";

import { feedStructure, defaultNodes } from "./structure";

export { DS };

export const link: DS.LinkProvider = new DS.LinkProvider(process.argv.slice(2), 'Feed-', {
  defaultNodes: defaultNodes,
  profiles: {
    feed(path: string, provider: DS.SimpleNodeProvider) {
      return new FeedNode(path, provider);
    },
    addFeed(path: string, provider: DS.SimpleNodeProvider) {
      return new DS.SimpleActionNode(path, provider, params => {
        if (!params.name || !params.url) {
          return;
        }

        const { name, url } = params;

        link.addNode(`/${name}`, feedStructure(url));
        link.save();
      });
    },
    remove(path: string, provider?: DS.SimpleNodeProvider) {
      return new DS.SimpleActionNode(path, provider, (params, node: DS.SimpleNode) => {
        node.parent.remove();
      });
    }
  }
});