import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar";
import LoginPage from "./pages/Auth/LoginPage";
import SignupPage from "./pages/Auth/SignupPage";
import TodoList from "./pages/TodoList/TodoList";
import MakeTodo from "./pages/MakeTodo/MakeTodo";
import SocialPage from "./pages/Social/SocialPage";
import ProfilePage from "./pages/Profile/ProfilePage";

const GLOBAL_KF = `
  @keyframes jellyFloat { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-10px)} }
  @keyframes tentSway   { 0%,100%{transform:rotate(-7deg)} 50%{transform:rotate(7deg)} }
  @keyframes bubbleRise { 0%{transform:translateY(0);opacity:.55} 100%{transform:translateY(-60px);opacity:0} }
  @keyframes fadeInUp   { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
  @keyframes flash      { 0%,100%{opacity:0} 30%{opacity:.85} }
  @keyframes spin       { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
`;

function App() {
  return (
    <BrowserRouter>
      <style>{GLOBAL_KF}</style>
      <div style={{ fontFamily: "'Noto Sans KR', sans-serif" }}>
        <Navbar />
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/goals" element={<TodoList />} />
          <Route path="/make" element={<MakeTodo />} />
          <Route path="/social" element={<SocialPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/home" element={<Navigate to="/goals" replace />} />
          <Route path="/list" element={<Navigate to="/goals" replace />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
