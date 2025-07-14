import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import NewList from "./pages/NewList";
import Maintenance from "./pages/Maintenance";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/maintenance" element={<Maintenance />} />
        <Route path="/new" element={<NewList />} />
      </Routes>
    </Router>
  );
}
