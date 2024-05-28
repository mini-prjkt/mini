import {BrowserRouter, Routes, Route} from 'react-router-dom'
import Signup from './Components/Signup'
import Login from './Components/Login'
import Home from './Components/Home'
import ForgotPassword from './Components/ForgotPassword'
import ResetPassword from './Components/ResetPassword'
import Dashboard from './Components/Dashboard'
import Interest from './Components/Interest'
import WelcomePage from './Components/WelcomePage'
import LandingPage from './Components/LandingPage'

function App() {

  return (
    <BrowserRouter>
      <Routes>
        <Route path='/' element={<Home />}></Route>
        <Route path = "/signup" element={<Signup />}></Route>
        <Route path = "/login" element={<Login />}></Route>
        <Route path = "/forgotPassword" element={<ForgotPassword />}></Route>
        <Route path = "/resetPassword/:token" element={<ResetPassword />}></Route>
        <Route path="/dashboard" element={<Dashboard />}></Route>
        <Route path="/interest" element={<Interest/>}></Route>
        <Route path="/welcome" element={<WelcomePage/>}></Route>
        <Route path="/home" element={<LandingPage/>}></Route>

      </Routes>
    </BrowserRouter>
  )
}

export default App
