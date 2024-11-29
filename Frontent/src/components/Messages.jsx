import React, { useEffect, useRef } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { User2 } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "./ui/button";
import { useSelector } from "react-redux";
import useGetAllMessage from "@/hooks/useGetAllMessage";
import useGetRTM from "@/hooks/useGetRTM";

const Messages = ({selectedUser}) => {
  console.log(selectedUser);
  
  useGetRTM()
  useGetAllMessage();
  const {messages} =useSelector(store=>store.chat)
  const {user} =useSelector(store=>store.auth)

  // Ref for auto-scrolling
  const messagesEndRef = useRef(null);

  // Scroll to the bottom whenever messages update
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  return (
    <div className="overflow-y-auto flex-1 p-4">
      <div className="flex justify-center">
        <div className="flex flex-col items-center justify-center">
            <Avatar className='h-20 w-20'>
                <AvatarImage src={selectedUser?.profilePicture} alt='profile'/>
                <AvatarFallback><User2/></AvatarFallback>
            </Avatar>
            <span className="font-medium">{selectedUser?.username}</span>
            <Link to={`/profile/${selectedUser}`}><Button className='h-8 my-2' variant='secondary'>View profile</Button></Link>
        </div>
      </div>

       {/* Message List */}
      <div className="flex flex-col gap-3">
        {
            messages && messages.map((msg)=>{
                return(
                    <div key={msg._id} className={`flex ${msg.senderId == user?._id ? 'justify-end' : 'justify-start'}`}>
                        <div className={`p-2 rounded-lg max-w-xs break-words ${msg.senderId == user?._id ? 'bg-blue-500 text-white': 'bg-gray-200'}`}>
                            {msg.message}
                        </div>
                    </div>
                )
            })
        }
        {/* Reference div for auto-scrolling */}
        <div ref={messagesEndRef} />
      </div>
    </div>
  );
};

export default Messages;
