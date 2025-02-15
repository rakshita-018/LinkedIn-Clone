import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { Feed } from './features/feed/Feed'
import {Login} from './features/authentication/pages/login/Login'
import {Signup} from './features/authentication/pages/signup/Signup'
import {ResetPassword} from './features/authentication/pages/resetPassword/ResetPassword'
import {VerifyEmail} from './features/authentication/pages/verifyEmail/VerifyEmail'
import { AuthenticationContextProvider } from './features/authentication/contexts/AuthenticationContextProvider'

const router = createBrowserRouter([

  {
    element: <AuthenticationContextProvider/>,
    children: [
      {
        path: '/',
        element: <Feed/>,
      },
      {
        path: '/login',
        element: <Login/>,
      },
      {
        path: '/signup',
        element: <Signup/>,
      },
      {
        path: '/request-password-reset',
        element: <ResetPassword/>,
      },
      {
        path: '/verify-email',
        element: <VerifyEmail/>,
      },
    ]
  }
]);

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <RouterProvider router={router}/>
  </StrictMode>,
)
