# Tree Visualizer

A modern, interactive hierarchical data visualizer built with React Flow. This application allows users to visualize, explore, and modify tree structures with a sleek, minimalist interface.


## Deployment

The application is deployed and accessible at: [https://glowtree-visualizer-main-2.vercel.app](https://glowtree-visualizer-main-2.vercel.app)

## Features

-   **Interactive Visualization**: Vertical tree layout with smooth animations.
-   **Node Management**:
    -   **Add**: Dynamically add new child nodes.
    -   **Edit**: Rename nodes via a dialog interface.
    -   **Delete**: Remove nodes and their descendants.
-   **Navigation**:
    -   **Search**: Find nodes by name with auto-focus and path expansion.
    -   **Zoom & Pan**: Full control over the canvas.
    -   **Minimap**: Quick navigation aid for large trees.
-   **Rich UI**:
    -   Context menus for quick actions.
    -   Child count badges.
    -   Dark mode optimized aesthetics.

## Technology Stack

-   **Frontend**: React, TypeScript, Vite
-   **Visualization**: React Flow, Dagre (for layout)
-   **Styling**: Tailwind CSS, Framer Motion
-   **UI Components**: Radix UI, Lucide React

## Getting Started

### Prerequisites

-   Node.js (v16 or higher)
-   npm or yarn

### Installation

1.  Clone the repository:
    ```bash
    git clone https://github.com/Legedrid10/Infollion-Task.git
    cd Infollion-Task
    ```

2.  Install dependencies:
    ```bash
    npm install
    ```

3.  Start the development server:
    ```bash
    npm run dev
    ```

4.  Open your browser and navigate to `http://localhost:5173` (or the port shown in your terminal).

## Usage

-   **Expand/Collapse**: Click on the chevron arrows on nodes.
-   **Context Menu**: Right-click on any node to access Add, Rename, or Delete options.
-   **Search**: Use the search bar on the top left to find specific nodes.


