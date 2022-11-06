import React, { useEffect } from 'react'
import Link from 'next/link';

const Header = ({ siteName, logo, user, logout }) => {
    const addEffect = () => {
        document.querySelector('.navbar').classList.add('navbar-scrolled');
    }
    const removeEffect = () => {
        document.querySelector('.navbar').classList.remove('navbar-scrolled');
    }

    const handleScroll = () => {
        (window.scrollY > 1) ? addEffect() : removeEffect();
    }
    useEffect(() => {
        window.addEventListener('scroll', handleScroll);
        return () => {
            window.removeEventListener('scroll', handleScroll);
        }
    }, []);

    return (
        <>
            <nav className="navbar navbar-expand-lg navbar-light fixed-top">
                <div className="container-fluid">
                    <Link href="/"><a className="navbar-brand">{logo ? <img src={logo} alt={"logo"} width="50" /> : siteName}</a></Link>
                    <button className="navbar-toggler" onClick={addEffect} type="button" data-bs-toggle="collapse" data-bs-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
                        <span className="navbar-toggler-icon"></span>
                    </button>
                    <div className="collapse navbar-collapse" id="navbarSupportedContent">
                        <ul className="navbar-nav me-auto mb-2 mb-lg-0">
                            {user.token && <>
                                <li className="nav-item me-2 mb-2">
                                    <a className="nav-link fw-bold text-ira" aria-current="page">Welcome, {user.name}</a>
                                </li>
                            </>}
                        </ul>
                        <ul className="navbar-nav ms-auto mb-2 mb-lg-0">
                            {user.token && <>
                                <li className="nav-item fw-bold">
                                    <Link href="/"><a className="nav-link active" aria-current="page">Home</a></Link>
                                </li>
                                <li className="nav-item fw-bold">
                                    <Link href="/detect"><a className="nav-link" aria-current="page">Detect Mood</a></Link>
                                </li>
                                <li className="nav-item fw-bold">
                                    <Link href="/report"><a className="nav-link" aria-current="page">Report</a></Link>
                                </li>
                                <li className="nav-item fw-bold mb-2 me-2">
                                    <Link href="/profile"><a className="nav-link" aria-current="page">Profile</a></Link>
                                </li>
                                <li className="nav-item me-2 mb-2">
                                    <a onClick={logout} className="btn btn-sm">Logout</a>
                                </li>
                            </>}
                            {!user.token && <li className="nav-item me-2 mb-2">
                                <Link href="/login"><a className="btn btn-sm">Login</a></Link>
                            </li>}
                        </ul>
                    </div>
                </div>
            </nav>

        </>
    )
}

export default Header