import axios from "axios";
import {
  Compass,
  Heart,
  Home,
  LogIn,
  LogOut,
  MessageCircle,
  PlusSquare,
  Search,
  User2,
  UserCircle2,
  UserPenIcon,
} from "lucide-react";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { useDispatch, useSelector } from "react-redux";
import store from "./redux/store";
import {
  setAuthUser,
  setSelectedUser,
  setSuggestedUsers,
  setUserProfile,
} from "./redux/authSlice.js";
import CreatePost from "./CreatePost";
import {
  setBookmarkedPost,
  setPosts,
  setSelectedPost,
} from "./redux/postSlice.js";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { Button } from "./ui/button";
import { setNewNotification } from "./redux/rtnSlice.js";

const LeftSidebar = () => {
  const [open, setOpen] = useState(false);
  const { user } = useSelector((store) => store.auth);
  const { newNotification } = useSelector(
    (store) => store.realTimeNotification
  );
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const logoutHandler = async () => {
    try {
      const res = await axios.get("http://localhost:3000/api/v2/user/logout", {
        withCredentials: true,
      });
      if (res.data.success) {
        dispatch(setAuthUser(null));
        dispatch(setSelectedPost(null));
        dispatch(setPosts([]));
        dispatch(setUserProfile(null));
        dispatch(setSuggestedUsers([]));
        dispatch(setSelectedUser(null));
        dispatch(setBookmarkedPost([]));
        dispatch(setNewNotification([]))

        navigate("/login");
        toast.success(res.data.message);
      }
    } catch (error) {
      toast.error(error.response.data.message);
    }
  };
  const sidebarHandler = (textType) => {
    switch (textType) {
      case "Home":
        navigate("/");
        break;
      case "Logout":
        logoutHandler();
        break;
      case "Login":
        navigate("/login");
        break;      
      case "Create":
        setOpen(true);
        break;
      case "Profile":
        navigate(`/profile/${user?._id}`);
        break;
      case "Messages":
        navigate("/chat");
        break;
      default:
        break;
    }
  };

  const sidebarItems = [
    { icon: <Home />, text: "Home" },
    { icon: <Search />, text: "Search" },
    { icon: <Compass />, text: "Explore" },
    { icon: <MessageCircle />, text: "Messages" },
    { icon: <Heart />, text: "Notification" },
    { icon: <PlusSquare />, text: "Create" },
    {
      icon: (
        <Avatar className="w-8 h-8">
          {user?.profilePicture ? (
            <AvatarImage src={user.profilePicture} alt="@shadcn" />
          ) : (
            <AvatarFallback>
              <UserCircle2 />
            </AvatarFallback>
          )}
        </Avatar>
      ),
      text: "Profile",
    },
    { icon: <LogOut />, text: "Logout" },
  ];

  return (
    <div className="fixed top-0 z-10  border-r border-gray-400 w-[16%] h-screen text-center bg-gray-50">
      <div className="flex flex-col">
        <h1 className="font-bold m-10 text-2xl">Instagram</h1>
        <div className="px-4">
          {sidebarItems.map((item, index) => {
            return (
              <div
                key={index}
                onClick={() => sidebarHandler(item.text)}
                className="flex items-center gap-4 relative hover:bg-gray-100 rounded-lg p-3 my-3 cursor-pointer"
              >
                {item.icon}
                <span>{item.text}</span>
                {item.text === "Notification" && newNotification.length > 0 && (
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        size="icon"
                        className="rounded-full h-6 w-6 absolute bottom-6 left-6 bg-red-600 hover:bg-red-600"
                      >
                        {newNotification.length}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent>
                      <div>
                        {newNotification.map((notification) => (
                          <div
                            key={notification.userId}
                            className="flex items-center gap-2 my-1"
                          >
                            <Avatar>
                              <AvatarImage
                                src={notification.userDetails?.profilePicture}
                              />
                              <AvatarFallback>
                                <User2 />
                              </AvatarFallback>
                            </Avatar>
                            <p className="text-sm">
                              <span className="font-bold">
                                {notification.userDetails?.username}
                              </span>{" "}
                              {notification.type} on your post
                            </p>
                          </div>
                        ))}
                      </div>
                    </PopoverContent>
                  </Popover>
                )}
              </div>
            );
          })}
        </div>
      </div>
      <CreatePost open={open} setOpen={setOpen} />
    </div>
  );
};

export default LeftSidebar;
