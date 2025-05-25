import MultilineEditor from './components/MultilineEditor';

function App() {
  return (
    <div>
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
}

export default App;
