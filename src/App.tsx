import Navbar from './components/Navbar.tsx';
import {BrowserRouter} from "react-router-dom";

function App() {
    return (
        <div className="App">
            <BrowserRouter>
                <Navbar></Navbar>
            </BrowserRouter>
        </div>
    );
}

export default App;
