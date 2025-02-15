import React from 'react';
// import PropTypes from 'prop-types';
import { Outlet } from 'react-router-dom';
import './Layout.css';

export function Layout({ children }) {
    return (
        <div className="layout-root">
            <header>
                <div className="container">
                    <a href="/">
                        <img src="/logo.svg" alt="Logo" className="logo" />
                    </a>
                </div>
            </header>
            <main className="container">
                <Outlet />
                {children}
            </main>
            <footer>
                <ul className="container">
                    <li>
                        <img src="/logo-dark.svg" alt="Logo" />
                        <span>© 2025</span>
                    </li>
                    <li><a href="#">Accessibility</a></li>
                    <li><a href="#">User Agreement</a></li>
                    <li><a href="#">Privacy Policy</a></li>
                    <li><a href="#">Cookie Policy</a></li>
                    <li><a href="#">Copyright Policy</a></li>
                    <li><a href="#">Brand Policy</a></li>
                    <li><a href="#">Guest Controls</a></li>
                    <li><a href="#">Community Guidelines</a></li>
                    <li><a href="#">Language</a></li>
                </ul>
            </footer>
        </div>
    );
}


// Layout.propTypes = {
//     children: PropTypes.node.isRequired,
// };
