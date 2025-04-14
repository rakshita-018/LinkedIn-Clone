import { Box } from '../../components/Box/Box'
import './VerifyEmail.css'
import { Input } from '../../../../components/input/Input'
import { Button } from '../../../../components/Button/Button'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthentication } from '../../contexts/AuthenticationContextProvider'


export function VerifyEmail(){
    const [errorMessage, setErrorMessage] = useState("");
    const [message, setMessage] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();
    const { user, setUser } = useAuthentication();

//     usePageTitle("Verify Email");

    const validateEmail = async (code) => {
        setMessage("");
        setIsLoading(true);

        await request({
            endpoint: `/api/v1/authentication/validate-email-verification-token?token=${code}`,
            method: "PUT",
            onSuccess: () => {
                setErrorMessage("");
                setUser((prevUser) => ({ ...prevUser, emailVerified: true }));
                navigate("/");
            },
            onFailure: (error) => {
                setErrorMessage(error);
            },
        });

        setIsLoading(false);
    };

    // const validateEmail = async (code) => {
    // setMessage("");
    // setIsLoading(true);
    // try{
    //     const response = await fetch(
    //         `${ import.meta.env.VITE_API_URL}/api/v1/authentication/validate-email-verification-token?token=${code}`,               
    //         {
    //             method: "PUT",
    //             headers: {
    //                 Authorization: `Bearer ${localStorage.getItem("token")}`,
    //             },
    //         }
    //     );
    //     if(response.ok){
    //         setErrorMessage("")
    //         setUser((prevUser) => ({ ...prevUser, emailVerified: true }));
    //         navigate("/")
    //     }
    //     const {message} = await response.json();
    //     setErrorMessage(message);
        
    //     }catch(e){
    //         console.log(e);
    //         setErrorMessage("Something went worng, please try again");
    //     }finally{
    //         setIsLoading(false)          
    //     }
    // };

    const sendEmailVerificationToken = async () => {
        setErrorMessage("");
        setIsLoading(true);

        await request({
            endpoint: `/api/v1/authentication/send-email-verification-token`,

            onSuccess: () => {
                setErrorMessage("");
                setMessage("Code sent successfully. Please check your email.");
            },
            onFailure: (error) => {
                setErrorMessage(error);
            },
        });

        setIsLoading(false);
        setErrorMessage("")
    };

    return(
        <div>
            <Box>
                <div className="verifyEmail-root">
                    <h1>Verify your Email</h1>

                    <form
                        onSubmit={async (e) => {
                            e.preventDefault();
                            setIsLoading(true);
                            const code = e.target.code.value;
                            await validateEmail(code);
                            setIsLoading(false);
                            // setMessage("")
                        }}
                    >
                        <p>Only one step left to complete your registration. Verify your email address.</p>
                        <Input type="text" label="Verification code" key="code" name="code" />
                        {message && <p className="success-message">{message}</p>}
                        {errorMessage && <p className="error-message">{errorMessage}</p>}
                        <Button type="submit" disabled={isLoading}>{isLoading ? "..." : "Validate email"}</Button>
                        <Button outline type="button" disabled={isLoading} onClick={() => {sendEmailVerificationToken()}}>Send again</Button>
                    </form>
                </div>
            </Box>
        </div>
        
    )
}







//     return (
//         <div className="root">
//             <Box>
//                 <h1>Verify your Email</h1>

//                 <form
//                     onSubmit={async (e) => {
//                         e.preventDefault();
//                         const code = e.target.code.value;
//                         await validateEmail(code);
//                     }}
//                 >
//                     <p>Only one step left to complete your registration. Verify your email address.</p>
//                     <Input type="text" label="Verification code" key="code" name="code" />
//                     {message && <p className="success-message">{message}</p>}
//                     {errorMessage && <p className="error-message">{errorMessage}</p>}
//                     <Button type="submit" disabled={isLoading}>
//                         {isLoading ? "..." : "Validate email"}
//                     </Button>
//                     <Button outline type="button" onClick={sendEmailVerificationToken} disabled={isLoading}>
//                         {isLoading ? "..." : "Send again"}
//                     </Button>
//                 </form>
//             </Box>
//         </div>
//     );
// } 