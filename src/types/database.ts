export interface Database {
  public: {
    Tables: {
      articles: {
        Row: {
          id: string;
          title: string;
          slug: string;
          summary: string | null;
          excerpt: string | null;
          source_url: string;
          image_url: string | null;
          publisher: string | null;
          category: string;
          keywords: string[];
          published_at: string | null;
          created_at: string;
          source_hash: string;
        };
        Insert: {
          id?: string;
          title: string;
          slug: string;
          summary?: string | null;
          excerpt?: string | null;
          source_url: string;
          image_url?: string | null;
          publisher?: string | null;
          category: string;
          keywords?: string[];
          published_at?: string | null;
          created_at?: string;
          source_hash: string;
        };
        Update: Partial<Database["public"]["Tables"]["articles"]["Insert"]>;
      };
    };
  };
}

export type Article = Database["public"]["Tables"]["articles"]["Row"];
