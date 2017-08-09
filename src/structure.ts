export interface Article {
  title?: string;
  description?: string;
  author?: string;
  link?: string;
  guid?: string;
  pubdate?: Date;
}

export const defaultNodes: object = {
  //* @Action Add_Feed
  //* @Is addFeed
  //* @Parent root
  //*
  //* Adds an RSS feed to the link.
  //*
  //* @Param name Name of the link for 
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
}

export function feedStructure(url: string): object {
  return {
    //* @Node
    //* @MetaType ServiceNode
    //* @Is service
    //* @Parent services
    //*
    //* A service is the layer in HomeKit that provides functionality to accessories.
    //*
    //* A service is the layer in HomeKit that provides functionality to accessories.
    //* Services are responsible for what you'd most likely consider devices,
    //* like the ability to be a door, thermostat, etc.
    $is: "feed",
    $feed_url: url,
    Remove: {
      $is: "remove",
      $invokable: "write",
      $result: "values",
    },
  };
}

export function articleStructure(article: Article): object {
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