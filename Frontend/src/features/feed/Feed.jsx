import { useAuthentication } from '../authentication/contexts/AuthenticationContextProvider';
import './Feed.css'
 export function Feed(){
    const {user, logout} = useAuthentication()

    return(
        <div className='feed-root' >
            <header className='header'>
                <div>Hello {user?.email}</div>
                <span>|</span>
                <button onClick={logout}>logout</button>
            </header>
            <main className='content'>
                <div className="left"></div>
                <div className="center">
                    <div className="posting"></div>
                    <div className="feed"></div>
                </div>
                <div className="right"></div>
            </main>
        </div>
    );
 }