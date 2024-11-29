import React from "react";
import { Link } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { User2 } from "lucide-react";
import { useSelector } from "react-redux";
import SuggestedUsers from "./SuggestedUsers";

const RightsideBar = () => {
  const { user } = useSelector((store) => store.auth);
  return (
    <div>
      <div className="w-fit my-10 pr-52">
        <div className="flex items-center gap-2">
          <Link to={`/profile/${user?._id}`}>
            <Avatar>
              <AvatarImage src={user?.profilePicture}/>
              <AvatarFallback>
                <User2 />
              </AvatarFallback>
            </Avatar>
          </Link>

          <div>
            <h1 className="font-semibold text-sm">
              <Link to={`/profile/${user?._id}`} >{user?.username}</Link >
              
            </h1>
            <span className="text-gray-600 text-sm">
              {user?.bio || "Bio here..."}
            </span>
          </div>
        </div>
      </div>
      <SuggestedUsers/>
      <p className="pt-6 text-xs text-gray-600">@2024 INSTAGRAM FROM ATANU</p>
    </div>
  );
};

export default RightsideBar;
