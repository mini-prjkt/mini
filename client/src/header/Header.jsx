import React from 'react';
import { Link } from 'react-router-dom';
import './header.css';

function Header() {
    return (
        <div className='header-outer-div'>
            
            <div className='header-home'><Link className='home' to="/welcome" >Home</Link></div>
            <div className='header-home'><Link className='home' to="/connections" >Connections</Link></div>
            <div className='header-home'><Link className='home' to="/chat" >Chat</Link></div>
            <div className='header-home'><Link className='home' to="/viewpost" >MyPost</Link></div>
            <div className='header-home'><Link className='home' to="/addpost" >Add Post</Link></div>
            <div className='header-home'><Link className='home' to="/profile" >profile</Link></div>
            <div className='header-home'><Link className='home' to="/" >logout</Link></div>
           

        </div>
    );
}

export default Header;
