import { Box } from '../../components/Box/Box'
import './ResetPassword.css'
import { Input } from '../../../../components/input/Input'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { usePageTitle } from '../../../../hooks/usePageTitle'
import { Button } from '../../../../components/Button/Button'


export function ResetPassword(){
    const [emailSent, setEmailSent] = useState(false);
    const [email, setEmail] = useState("");
    const [errorMessage, setErrorMessage] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();
    
    usePageTitle("Reset Password");

    const sendPasswordResetToken = async (email) => {
        setIsLoading(true);
        await request({
            endpoint: `/api/v1/authentication/send-password-reset-token?email=${email}`,
            method: "PUT",
            onSuccess: () => {
                setErrorMessage("");
                setEmailSent(true);
            },
            onFailure: (error) => {
                setErrorMessage(error);
            },
        });
        setIsLoading(false);
    };


  
    const resetPassword = async (email, code, password) => {
        setIsLoading(true);
        await request({
            endpoint: `/api/v1/authentication/reset-password?email=${email}&token=${code}&newPassword=${password}`,
            method: "PUT",
            onSuccess: () => {
                setErrorMessage("");
                navigate("/login");
            },
            onFailure: (error) => {
                setErrorMessage(error);
            },
        });
        setIsLoading(false);
    };
  
    return(
        <div>
            <Box>
                <div className="reset-password-root">
                    <h1>Reset Password</h1>
                    {!emailSent ? (
                        <form
                            onSubmit={async (e) => {
                                e.preventDefault();
                                setIsLoading(true);
                                const email = e.target.email.value;
                                await sendPasswordResetToken(email);
                                setEmail(email);
                                setIsLoading(false);
                                }}
                        >
                            <p>Enter your email and we’ll send a verification code if it matches an existing account.</p>
                            <Input name="email" type="email" label="Email"/>
                            
                            {errorMessage && <p className="error-message">{errorMessage}</p>}
                            
                            <Button type="submit" disabled={isLoading} >{isLoading? "..." : "Next"}</Button>
                            <Button outline onClick={() => navigate("/authentication/login")} disabled={isLoading}>{isLoading? "..." : "Back"}</Button>
                        </form>
                    ):( 
                        <form
                            onSubmit={async (e) => {
                                e.preventDefault();
                                setIsLoading(true);
                                const code = e.target.code.value;
                                const password = e.target.password.value;
                                await resetPassword(email, code, password);
                                setIsLoading(false);
                            }}
                        >
                            <p>Enter the verification code we sent to your email and your new password.</p>
                            <Input type="text" label="Verification code" key="code" name="code" />
                            <Input label="New password" name="password" key="password" type="password" id="password" />
                        
                            {errorMessage && <p className="error-message">{errorMessage}</p>}
                            <Button type="submit" disabled ={isLoading} >{isLoading ? "..." : "Reset Password"}</Button>
                            <Button outline type="button"
                                onClick={() => {
                                setEmailSent(false);
                                setErrorMessage("");
                            }}
                            disabled ={isLoading}
                            >{isLoading ? "..." : "Back"}</Button>
                        </form>
                        
                    )
                    }
                </div>
            </Box>
        </div>     
    )
}
