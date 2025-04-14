import React from 'react';
import './Login.css'
import { Box } from "../../components/Box/Box";
import { Input } from "../../../../components/input/Input";
import { Seperator } from "../../components/seperator/Seperator";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useState } from 'react';
import { useAuthentication } from '../../contexts/AuthenticationContextProvider';
import { usePageTitle } from '../../../../hooks/usePageTitle';
import { Button } from '../../../../components/Button/Button';

export function Login() {
    const [errorMessage, setErrorMessage] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const { login } = useAuthentication();
    const location = useLocation();
    const navigate = useNavigate();
    // const { isOauthInProgress, oauthError, startOauth } = useOauth("login");
    
    usePageTitle("Login");

    const doLogin = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        const email = e.target.email.value;
        const password = e.target.password.value;

        try {
            await login(email, password);
            const destination = location.state?.from || "/";
            navigate(destination);
        } catch (error) {
            setErrorMessage(error instanceof Error ? error.message : "An unknown error occurred.");
        } finally {
            setIsLoading(false);
        }
    };

    // if (isOauthInProgress) {
    //     return <Loader isInline />;
    // }

    return (
        <div>
            <Box>
                <div className="login-root">
                    <h1>Sign in</h1>
                    <p>Stay updated on your professional world.</p>
                    <form onSubmit={doLogin}>
                    <Input label="Email" type="email" id="email" onFocus={() => setErrorMessage("")} />
                    <Input label="Password" type="password" id="password" onFocus={() => setErrorMessage("")} />

                        {errorMessage && <p className="error">{errorMessage}</p>}
                        <Button type="submit" disabled={isLoading}> {isLoading ? "..." : "Sign in"}</Button>
                        <Link to="/authentication/request-password-reset">Forgot password?</Link>
                    </form>
                    <Seperator>Or</Seperator>
                    <div className="register">
                        New to LinkedIn? <Link to="/authentication/signup">Join now</Link>
                    </div>
                    
                    {/* <form onSubmit={doLogin}>
                        <Input label="Email" type="email" id="email" onFocus={() => setErrorMessage("")} />
                        <Input label="Password" type="password" id="password" onFocus={() => setErrorMessage("")} />
                        {errorMessage && <p className="error">{errorMessage}</p>}

                        <Button type="submit" disabled={isLoading}>
                            {isLoading ? "..." : "Sign in"}
                        </Button>
                        <Link to="/authentication/request-password-reset">Forgot password?</Link>
                    </form>
                    <Seperator>Or</Seperator>
                    <div className="register">
                        {oauthError && <p className="error">{oauthError}</p>}
                        <Button outline onClick={startOauth}>
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512">
                                <path d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z" />
                            </svg>
                            Continue with Google
                        </Button>
                        New to LinkedIn? <Link to="/authentication/signup">Join now</Link>
                    </div> */}
                </div>
            </Box>
        </div>
    );
}
