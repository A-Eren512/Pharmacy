import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Code from "./QRCode";
import NobetciEczaneler from "./Pharmacy";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Code />} />
        <Route path="/pharmacy" element={<NobetciEczaneler />} />
      </Routes>
    </Router>
  );
}
