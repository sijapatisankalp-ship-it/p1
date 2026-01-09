import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/layout/Layout';
import Planner from './components/planner/Planner';
import DoubtRoom from './components/doubt-engine/DoubtRoom';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Navigate to="/planner" replace />} />
          <Route path="planner" element={<Planner />} />
          <Route path="doubt-room" element={<DoubtRoom />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
