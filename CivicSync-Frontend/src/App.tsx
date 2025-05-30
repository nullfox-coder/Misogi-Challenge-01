import { Routes, Route } from 'react-router-dom';
import Navbar from './components/layout/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import MapView from './pages/MapView';
import Profile from './pages/Profile';
import ReportIssue from './pages/ReportIssue';
import MyIssues from './pages/MyIssues';
import PublicFeed from './pages/PublicFeed';
import Analytics from './pages/Analytics';
import IssueDetailsPage from './pages/IssueDetailsPage';
import { AuthProvider } from './context/AuthContext';
import './App.css'

function App() {
  return (
    <AuthProvider>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/map" element={<MapView />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/report-issue" element={<ReportIssue />} />
        <Route path="/my-issues" element={<MyIssues />} />
        <Route path="/feed" element={<PublicFeed />} />
        <Route path="/issues/:id" element={<IssueDetailsPage />} />
        <Route path="/analytics" element={<Analytics />} />
      </Routes>
    </AuthProvider>
  );
}

export default App;
