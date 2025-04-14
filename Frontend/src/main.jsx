import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { createBrowserRouter, Navigate, RouterProvider } from 'react-router-dom'
import { Feed } from './features/feed/pages/Feed/Feed'
import {Login} from './features/authentication/pages/login/Login'
import {Signup} from './features/authentication/pages/signup/Signup'
import {ResetPassword} from './features/authentication/pages/resetPassword/ResetPassword'
import {VerifyEmail} from './features/authentication/pages/verifyEmail/VerifyEmail'
import { AuthenticationContextProvider } from './features/authentication/contexts/AuthenticationContextProvider'
import { AuthenticationLayout } from './features/authentication/components/authenticationLayout/AuthenticationLayout'
import { ApplicationLayout } from './components/applicationLayout/ApplicationLayout'
import { Profile as LoginProfile} from './features/authentication/pages/profile/Profile'
import { Notifications } from './features/feed/pages/Notifications/Notifications'
import { PostPage } from './features/feed/pages/Post/Post'
import { Messaging } from './features/messaging/pages/Messages/Messaging'
import { Conversation } from './features/messaging/pages/Conversations/Conversation'
import { Network } from './features/networking/pages/Network/Network'
import { Invitations } from './features/networking/pages/Invitations/Invitations'
import { Connections } from './features/networking/pages/Connections/Connections'
import { Posts } from './features/profile/pages/Posts/Posts'
import { Profile } from './features/profile/pages/Profile/Profile'


const router = createBrowserRouter([

  {
    element: <AuthenticationContextProvider/>,
    children: [
      {
        path: '/',
        element: <ApplicationLayout/>,
        children: [
          {
            index: true,
            element: <Feed/>,
          },
          {
            path: "posts/:id",
            element: <PostPage/>
          },
          {
            path: "network",
            element: <Network/>,
            children: [
              {
                index: true,
                element: <Navigate to="invitations"/>
              },
              {
                path: "invitations",
                element: <Invitations/>
              },
              {
                path: "connections",
                element: <Connections />
              }
            ]
          },
          {
            path: "messaging",
            element: <Messaging/>,
            children: [
              {
                path: "conversations/:id",
                element: <Conversation/>
              }
            ]
          },
          {
            path: "notifications",
            element: <Notifications/>
          },
          {
            path: "profile/:id",
            element: <Profile />,
          },
          {
            path: "profile/:id/posts",
            element: <Posts />,
          },
        ]
      },
      {
        path: "/authentication",
        element: <AuthenticationLayout/>,
        children: [
        {
          path: 'login',
          element: <Login/>,
        },
        {
          path: 'signup',
          element: <Signup/>,
        },
        {
          path: 'request-password-reset',
          element: <ResetPassword/>,
        },
        {
          path: 'verify-email',
          element: <VerifyEmail/>,
        },
        {
          path: 'profile/:id',
          element: <LoginProfile/>,
        }
        ]
      },
      {
        path: '*',
        element: <Navigate to="/"/>,
      }
    ]
  }
]);

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <RouterProvider router={router}/>
  </StrictMode>,
)

