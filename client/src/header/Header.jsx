import React from 'react';
import { Link } from 'react-router-dom';
import logo from '../Assets/logo.jpeg';
import user from '../Assets/user.png'
import post from '../Assets/post.png'
import './header.css';

function Header() {
    return (
        <div className='header-outer-div'>
            <img src={logo} alt="Logo" />
            <div className='header-home'><Link className='home' to="/welcome" >Home</Link></div>
            <div className='header-home'><Link className='home' to="/" >Connections</Link></div>
            <div className='header-home'><Link className='home' to="/" >Features</Link></div>
            <div className='header-home'><Link className='home' to="/" >Chat</Link></div>
            <div className='header-home'><Link className='home' to="/viewpost" >MyPost</Link></div>
            <div className='header-home'><Link className='home' to="/notifications" >Notification</Link></div>
            <Link  className='user-logo' to="/addpost">
                <img src={post} alt="User" />
            </Link>
            <Link  className='post-logo' to="/profile">
                <img src={user} alt="User" />
            </Link>


        </div>
    );
}

export default Header;
