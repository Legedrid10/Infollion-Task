import { Helmet } from 'react-helmet-async';
import TreeVisualizer from '@/components/tree/TreeVisualizer';

const Index = () => {
  return (
    <>
      <Helmet>
        <title>Tree View Visualizer | Interactive Hierarchical Data</title>
        <meta
          name="description"
          content="An interactive tree view visualizer with expand/collapse functionality, search, and smooth animations. Built with React Flow."
        />
      </Helmet>
      <main className="w-full h-screen">
        <TreeVisualizer />
      </main>
    </>
  );
};

export default Index;
