import { BrowserRouter, Route, Routes } from 'react-router-dom'
import Navigation from './components/Navigation'
import ChatPage from './pages/ChatPage'
import HowItWorksPage from './pages/HowItWorksPage'

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-[#F6F1E7] text-[#1F1B16]">
        <Navigation />
        <Routes>
          <Route path="/" element={<ChatPage />} />
          <Route path="/how-it-works" element={<HowItWorksPage />} />
        </Routes>
      </div>
    </BrowserRouter>
  )
}
