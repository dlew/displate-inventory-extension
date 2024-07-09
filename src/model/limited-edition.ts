export interface LimitedEdition {
  readonly itemCollectionId: number;
  readonly title: string;
  readonly edition: {
    available: number;
    size: number;
    type: "standard" | "ultra";
  };
}
