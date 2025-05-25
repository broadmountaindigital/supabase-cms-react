import MultilineText from './components/MultilineText';

function App() {
  return (
    <div>
      <h1>
        <MultilineText
          defaultValue="hello world"
          onChange={() => {}}
          maxLines={2}
          maxCharacterCount={100}
        />
      </h1>
      <p>
        <MultilineText defaultValue="This is simply text" onChange={() => {}} />
      </p>
    </div>
  );
}

export default App;
