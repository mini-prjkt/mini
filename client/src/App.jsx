import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Signup from './Components/Signup'
import Login from './Components/Login'
import Home from './Components/Home'
import ForgotPassword from './Components/ForgotPassword'
import ResetPassword from './Components/ResetPassword'
import Dashboard from './Components/Dashboard'
import Interest from './Components/Interest'
import WelcomePage from './Components/WelcomePage'

import UserProfile from './Components/UserProfile'
import AddPost from './Components/AddPost'
import MyPost from './Components/MyPost'
import Notification from './Components/Notification'
import Connections from './Components/Connections'
import Chat from './Components/Chat'
import useActivityTracker from './hooks/useActivitytracker';

function App() {
  const { averageTypingSpeed, averageScrollSpeed } = useActivityTracker();
  
  return (  
    <BrowserRouter>
      <Routes>
        <Route path='/' element={<Home />}></Route>
        <Route path="/signup" element={<Signup />}></Route>
        <Route path="/login" element={<Login />}></Route>
        <Route path="/forgotPassword" element={<ForgotPassword />}></Route>
        <Route path="/resetPassword/:token" element={<ResetPassword />}></Route>
        <Route path="/dashboard" element={<Dashboard />}></Route>
        <Route path="/interest" element={<Interest />}></Route>
        <Route path="/welcome" element={<WelcomePage />}></Route>
        
        <Route path="/profile" element={<UserProfile/>}></Route>
        <Route path="/addpost" element={<AddPost/>}></Route>
        <Route path="/viewpost" element={<MyPost/>}></Route>
        <Route path="/notification" element={<Notification/>}></Route>
        <Route path="/connections" element={<Connections/>}></Route>
        <Route path='/chat' element={<Chat/>}></Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
