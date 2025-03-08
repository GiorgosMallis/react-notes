export interface Note {
  id: string;
  title: string;
  content: string;
  contentState?: string; // For storing Draft.js content state
  createdAt: Date;
  updatedAt: Date;
  color?: string;
  tags: string[];
  category?: string;
  pinned: boolean;
}
