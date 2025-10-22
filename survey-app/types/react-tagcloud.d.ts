declare module 'react-tagcloud' {
  import { ComponentType } from 'react';

  interface Tag {
    value: string;
    count: number;
  }

  interface ColorOptions {
    luminosity?: 'bright' | 'light' | 'dark' | 'random';
    hue?: string;
  }

  interface TagCloudProps {
    tags: Tag[];
    minSize?: number;
    maxSize?: number;
    className?: string;
    colorOptions?: ColorOptions;
    onClick?: (tag: Tag) => void;
  }

  export const TagCloud: ComponentType<TagCloudProps>;
}
