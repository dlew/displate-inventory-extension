import { LimitedEdition } from "./model/limited-edition";

export async function fetchAllLimitedEditionData(): Promise<LimitedEdition[]> {
  const response = await fetch("https://sapi.displate.com/artworks/limited");
  const json = await response.json();
  return json.data;
}
