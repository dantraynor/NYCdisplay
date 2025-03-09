import { FC } from 'react';

export interface ForceGraphProps {
  centerArtist: string;
  onSelectArtist: (artistName: string) => void;
}

declare const ForceGraph: FC<ForceGraphProps>;

export default ForceGraph;
