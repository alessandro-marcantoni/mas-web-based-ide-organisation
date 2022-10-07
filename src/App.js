import './App.css';
import Loader from './components/Loader';
import Navbar from './components/Navbar';

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
