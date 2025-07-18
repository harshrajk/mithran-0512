interface EntitySearchResponse {
  results: EntitySearchResult[];
}

interface EntitySearchResult {
  "@type": "EntitySearchResult";
  resultScore: number;
  result: EntityResult;
}

interface EntityResult {
  'result' : {
      "@type": string[];
      description: string;
      "@id": string;
      name: string;
      detailedDescription?: DetailedDescription;
      image?: Image;
      url?: string;
  }  
}

interface DetailedDescription {
  url: string;
  articleBody: string;
  license: string;
}

interface Image {
  url: string;
  contentUrl: string;
}

export type { EntitySearchResponse, EntitySearchResult, EntityResult, DetailedDescription, Image };