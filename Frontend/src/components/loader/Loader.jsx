import './Loader.css'

export function Loader(){
    return(
        <div className="loader-root">
            <img src="/logo.svg" alt="Loading..." />
            <div className="loader-container">
                <div className="loader-content"></div>
            </div>
        </div>
    )
}