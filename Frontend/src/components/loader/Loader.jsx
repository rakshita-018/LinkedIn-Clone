import './Loader.css'

export function Loader({isInline}){

    if (isInline) {
        return (
          <div className="inline">
            <span></span>
            <span></span>
            <span></span>
          </div>
        );
    }

    return(
        <div className="loader-root">
            <img src="/logo.svg" alt="Loading..." />
            <div className="loader-container">
                <div className="loader-content"></div>
            </div>
        </div>
    )
}