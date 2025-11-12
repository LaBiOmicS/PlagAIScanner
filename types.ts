
export interface WebSource {
  uri: string;
  title: string;
}

export interface GroundingChunk {
  web?: WebSource;
  // Add other source types like 'maps' if needed in the future
}
