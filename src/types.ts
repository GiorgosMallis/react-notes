export interface Note {
  id: string;
  title: string;
  content: string | any; // Allow for Draft.js raw content object
  contentState?: string; // For storing Draft.js content state
  createdAt: Date;
  updatedAt: Date;
  color?: string;
  tags: string[];
  category?: string;
  pinned: boolean;
  userId?: string; // Add userId for Firebase
}

// User interface for Firebase authentication
export interface User {
  uid: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  preferences?: {
    theme?: 'light' | 'dark';
  };
}
