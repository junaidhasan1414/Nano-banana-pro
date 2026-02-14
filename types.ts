export enum ImageSize {
  Size1K = "1K",
  Size2K = "2K",
  Size4K = "4K"
}

export enum AspectRatio {
  Square = "1:1",
  Landscape = "16:9",
  Portrait = "9:16",
  StandardLandscape = "4:3",
  StandardPortrait = "3:4"
}

export interface ImageGenerationOptions {
  prompt: string;
  size: ImageSize;
  aspectRatio: AspectRatio;
}

export interface GeneratedImage {
  id: string;
  url: string;
  prompt: string;
  size: ImageSize;
  aspectRatio: AspectRatio;
  timestamp: number;
}

export interface GenerationState {
  isGenerating: boolean;
  error: string | null;
}