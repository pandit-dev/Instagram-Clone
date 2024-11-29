import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import SuggestedUsers from "./SuggestedUsers";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { MessageCircleMoreIcon, User2 } from "lucide-react";
import { setSelectedUser } from "./redux/authSlice";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import Messages from "./Messages";
import { setMessages } from "./redux/chatSlice";
import axios from "axios";

const ChatPage = () => {
  const [textMessage, setTextMessage] = useState("");
  const { user, suggestedUsers, selectedUser } = useSelector(
    (store) => store.auth
  );
  const { onlineUsers, messages } = useSelector((store) => store.chat);
  const { socket } = useSelector((store) => store.socketio);
  const dispatch = useDispatch();

  const sendMessageHandler = async () => {
    try {
      const res = await axios.post(
        `http://localhost:3000/api/v2/message/send/${selectedUser?._id}`,
        { textMessage },
        {
          headers: {
            "Content-Type": "application/json",
          },
          withCredentials: true,
        }
      );
      if (res.data.success) {
        dispatch(setMessages([...messages, res.data.newMessage]));
        setTextMessage("");
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    return () => {
      dispatch(setSelectedUser(null));
    };
  }, [dispatch]);

  return (
    <div className="flex ml-[16%] h-screen">
      {/* Leftside */}
      <section className="w-full md:w-1/4 my-8">
        <h1 className="font-bold mb-4 px-3 text-xl">{user?.username}</h1>
        <hr className="mb-4 border-gray-300" />
        <div className="overflow-y-auto h-[80vh]">
          {suggestedUsers.map((suggestedUser) => {
            const isOnline = onlineUsers.includes(suggestedUser?._id);
            return (
              <div
                key={suggestedUser?._id}
                onClick={() => dispatch(setSelecteduser(suggestedUser))}
                className="flex gap-3 items-center p-3 hover:bg-gray-50 cursor-pointer"
              >
                <Avatar>
                  <AvatarImage src={suggestedUser?.profilePicture} />
                  <AvatarFallback>
                    <User2 />
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col">
                  <span className="font-medium">{suggestedUser?.username}</span>
                  <span
                    className={`text-xs font-bold ${
                      isOnline ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {isOnline ? "Online" : "Offline"}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Rightside */}

      {selectedUser ? (
        <section className="flex-1 border-l border-l-gray-300 flex flex-col h-full">
          <div className="flex gap-3 items-center px-3 py-2 border-b border-gray-300 sticky top-0 bg-white z-10">
            <Avatar>
              <AvatarImage src={selectedUser?.profilePicture} />
              <AvatarFallback>
                <User2 />
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <span>{selectedUser?.username}</span>
            </div>
          </div>
          <Messages selectedUser={selectedUser._id} />
          <div className="flex items-center p-4 border-t border-t-gray-300">
            <Input
              value={textMessage}
              onChange={(e) => setTextMessage(e.target.value)}
              type="text"
              className="flex-1 mr-2 focus-visible:ring-transparent"
              placeholder="Messages..."
            ></Input>
            <Button
              onClick={sendMessageHandler}              
            >
              Send
            </Button>
          </div>
        </section>
      ) : (
        <div className="flex flex-col items-center justify-center mx-auto border-l border-l-gray-300 flex-1">
          <div className="flex justify-center items-center w-32 h-32 rounded-full border-2 border-black">
            <MessageCircleMoreIcon className="w-16 h-16 text-black-500" />
          </div>
          <h1 className="text-xl pb-1">Your messages</h1>
          <span className="text-sm text-gray-500">
            Send a message to start a chat
          </span>
        </div>
      )}
    </div>
  );
};

export default ChatPage;
