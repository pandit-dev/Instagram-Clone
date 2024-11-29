import React, { useEffect } from "react";
import Login from "./components/login";
import Signup from "./components/signup";

import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Profile from "./components/Profile";
import Home from "./components/Home";
import MainLayout from "./components/MainLayout";
import EditProfile from "./components/EditProfile";
import ChatPage from "./components/ChatPage";
import { io } from "socket.io-client";
import { useDispatch, useSelector } from "react-redux";
import { setSocket } from "./components/redux/socketSlice";
import { setOnlineUsers } from "./components/redux/chatSlice";
import { setNewNotification } from "./components/redux/rtnSlice";
import ProtectedRoutes from "./components/protectedRoutes";

const browserRouter = createBrowserRouter([ 
  {
    path: "/",
    element: <ProtectedRoutes><MainLayout /></ProtectedRoutes>,
    children: [
      {
        path: "/",
        element: <ProtectedRoutes><Home /></ProtectedRoutes>,
      },
      {
        path: "/profile/:id",
        element: <ProtectedRoutes><Profile /></ProtectedRoutes>,
      },
      {
        path: "/account/edit",
        element: <ProtectedRoutes><EditProfile /></ProtectedRoutes>,
      },
      {
        path: "/chat",
        element: <ProtectedRoutes><ChatPage /></ProtectedRoutes>,
      },
    ],
  },
  {
    path: "/signup",
    element: <Signup />,
  },
  {
    path: "/login",
    element: <Login />,
  },
]);

const App = () => {
  const { user } = useSelector((store) => store.auth);
  const dispatch = useDispatch();
  const { socket } = useSelector((store) => store.socketio);

  useEffect(() => {
    if (user && !socket) {
      const socketio = io("http://localhost:3000", {
        query: {
          userId: user?._id,
        },
        transports: ["websocket"],
      });
      dispatch(setSocket(socketio));

      //listen all the events
      socketio.on("getOnlineUsers", (onlineUsers) => {
        dispatch(setOnlineUsers(onlineUsers));
      });

      socketio.on("notification", (notification)=>{
        dispatch(setNewNotification(notification))
      })

      
      return () => {
        socketio?.close();
        dispatch(setSocket(null));
        // dispatch(setOnlineUsers(null))
      };
    } else if(!user && socket) {
      socket?.close();
      dispatch(setSocket(null));
      // dispatch(setOnlineUsers(null))
    }
  }, [dispatch, user]);

  return (
    <>
      <RouterProvider router={browserRouter} />
    </>
  );
};

export default App;
