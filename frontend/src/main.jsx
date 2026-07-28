import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import Evidence from './pages/Evidence.jsx';
import './assets/sass/App.scss';
import './assets/sass/Evidence.scss';
import { BrowserRouter, Routes, Route } from 'react-router-dom';


createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path='/' element={<App/>}/>
        <Route path='/evidence' element={<Evidence/>}/>
      </Routes>
      </BrowserRouter>
  </StrictMode>,
)