import React from 'react';
import ReactDiffViewer, { DiffMethod } from 'react-diff-viewer-continued';

interface DiffViewerProps {
  originalText: string;
  formattedText: string;
}

export const DiffViewer: React.FC<DiffViewerProps> = ({ originalText, formattedText }) => {
  const customStyles = {
    variables: {
      dark: {
        color: '#edf2f7',
        background: 'transparent',
        addedBackground: '#044B53',
        addedColor: 'white',
        removedBackground: '#632F34',
        removedColor: 'white',
        wordAddedBackground: '#057D8B',
        wordRemovedBackground: '#9A3540',
        emptyLineBackground: 'transparent',
        gutterColor: '#4a5568',
      },
    },
    line: {
        padding: '10px 2px',
        '&:hover': {
          background: '#2d3748',
        },
    },
    marker: {
        width: '1em',
    }
  };

  return (
    <div className="animate-fade-in font-mono">
      <ReactDiffViewer
        oldValue={originalText}
        newValue={formattedText}
        splitView={true}
        compareMethod={DiffMethod.WORDS}
        styles={customStyles}
        useDarkTheme={true}
        leftTitle="Original"
        rightTitle="Formatted"
      />
    </div>
  );
};

export default DiffViewer;