import React from 'react';
import MultilineEditor from './MultilineEditor';

const Home: React.FC = () => {
  return (
    <div style={{ maxWidth: 600, margin: '2rem auto', textAlign: 'center' }}>
      <h1>
        <MultilineEditor
          defaultValue="hello world"
          onChange={() => {}}
          maxLines={2}
          maxCharacterCount={100}
        />
      </h1>
      <p>
        <MultilineEditor
          defaultValue="This is simply text"
          onChange={() => {}}
        />
      </p>
    </div>
  );
};

export default Home;
