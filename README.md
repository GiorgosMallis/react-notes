# React Note App

A modern, responsive web application for creating and managing notes built with React and TypeScript. Features a sleek dark theme with a grey color palette for comfortable use in low-light environments.

## Features

- Create, read, update, and delete notes
- Rich text editing with formatting options
- Search functionality to quickly find notes
- Color-code notes for better organization
- Tag system for flexible note categorization
- Predefined categories (Work, Personal, Ideas, To-Do, Important) with distinct icons
- Filter notes by tags, categories, or colors
- Dark theme with various shades of grey for comfortable viewing
- Responsive design that works on desktop and mobile devices
- Local storage persistence to save notes between sessions

## Getting Started

### Prerequisites

- Node.js (v14.0.0 or later)
- npm (v6.0.0 or later)

### Installation

1. Clone the repository or download the source code
2. Navigate to the project directory
3. Install dependencies:

```bash
npm install
```

### Running the App

To start the development server:

```bash
npm start
```

The app will open in your default browser at [http://localhost:3000](http://localhost:3000).

### Building for Production

To create a production build:

```bash
npm run build
```

The build files will be created in the `build` directory.

### Deployment

The app is deployed on GitHub Pages at [https://GiorgosMallis.github.io/react-notes](https://GiorgosMallis.github.io/react-notes)

To deploy your own version:

```bash
npm run deploy
```

## Project Structure

- `src/components/`: Contains all React components
  - `NoteItem.tsx`: Component for displaying individual notes
  - `NoteForm.tsx`: Form component for creating and editing notes
- `src/types.ts`: TypeScript interfaces and types
- `src/App.tsx`: Main application component
- `src/index.tsx`: Entry point of the application

## Technologies Used

- React 18
- TypeScript
- CSS3
- Local Storage API

## License

This project is licensed under the MIT License - see the LICENSE file for details.
