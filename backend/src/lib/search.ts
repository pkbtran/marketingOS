import { BraveSearch } from 'brave-search';

const braveSearch = new BraveSearch(process.env.BRAVE_SEARCH_API_KEY!);

export async function searchWeb(query: string) {
  try {
    const response = await braveSearch.webSearch(query, { count: 5 });
    const results = response.web?.results?.map((result: any) => ({
      title: result.title,
      link: result.url,
      snippet: result.description
    })) || [];
    return results;
  } catch (error) {
    console.error('Brave Search failed:', error);
    return [];
  }
}
