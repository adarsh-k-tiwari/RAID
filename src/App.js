import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import './App.css'
import MainDash from './components/MainDash/MainDash';
import RightSide from './components/RigtSide/RightSide';
import Sidebar from './components/Sidebar';
import Hotspots from './components/Hotspots/Hotspots';
import Home from "./components/Home/Home";
import Settings from "./components/Settings/Settings";

function App() {
  return (
    <Router>
      <div className="App">
        <div className="AppGlass">
          <Sidebar />
          <Routes>
          <Route path="/" element={<Navigate to="/home" replace />} />
            <Route path="/home" element={<Home />} />
            <Route path="/dashboard" element={<MainDash />} />
            <Route path="/Hotspots" element={<Hotspots />} />
            <Route path="/Settings" element={<Settings />} />
          </Routes>
          <RightSide />
        </div>
      </div>
    </Router>
  );
}

export default App;
