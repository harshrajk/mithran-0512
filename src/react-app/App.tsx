import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import NewList from "./pages/NewList";
import Maintenance from "./pages/Maintenance";
import Listing from "./pages/Listing";

export default function App() {
  console.log(import.meta.env.VITE_IS_MAINTENANCE_MODE === "true");
  
  return (
    <Router>
      <Routes>
        {
          // If maintenance mode is enabled, redirect to maintenance page
          import.meta.env.VITE_IS_MAINTENANCE_MODE === "true" ? (
            <Route path="/" element={<Maintenance />} />
          ) : <Route path="/" element={<Home />} />
        }
        
        <Route path="/maintenance" element={<Maintenance />} />
        <Route path="/new" element={<NewList />} />
        <Route path="/lists/:id" element={<Listing />} />
      </Routes>
    </Router>
  );
}
