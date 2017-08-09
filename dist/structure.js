"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.defaultNodes = {
    "Add_Feed": {
        $is: "addFeed",
        $name: "Add Feed",
        $params: [
            {
                name: "name",
                type: "string"
            },
            {
                name: "url",
                type: "string"
            },
        ],
        $result: "values",
        $invokable: "write",
    },
};
function feedStructure(url) {
    return {
        $is: "feed",
        $feed_url: url,
        Remove: {
            $is: "remove",
            $invokable: "write",
            $result: "values",
        },
    };
}
exports.feedStructure = feedStructure;
function articleStructure(article) {
    const { title, description, author, pubdate, guid, link: articleLink } = article;
    return {
        $name: title,
        $guid: guid,
        Title: {
            $type: "string",
            "?value": title
        },
        Author: {
            $type: "string",
            "?value": author
        },
        Published: {
            $type: "string",
            "?value": pubdate != null ? pubdate.toISOString() : "Unknown"
        },
        Description: {
            $type: "string",
            "?value": description
        },
        Url: {
            $type: "string",
            "?value": articleLink
        },
    };
}
exports.articleStructure = articleStructure;
