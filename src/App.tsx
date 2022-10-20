import Loader from './components/Loader.tsx';
import Navbar from './components/Navbar.tsx';

function App() {
  return (
    <div className="App">
      <Navbar></Navbar>
      {false &&
        <Loader></Loader>
      }
    </div>
  );
}

export default App;
