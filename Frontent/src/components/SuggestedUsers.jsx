import React from "react";
import { useSelector, useDispatch } from "react-redux";
import { User2 } from "lucide-react";
import { Link } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import axios from "axios";
import { setSuggestedUsers } from "./redux/authSlice"; // Import an action to update the Redux state

const SuggestedUsers = () => {
  const dispatch = useDispatch();
  const { suggestedUsers, user: loggedInUser } = useSelector((store) => store.auth);

  const handleFollowOrUnfollow = async (userId) => {
    try {
      "http://localhost:3000/api/v2/user/profile/edit"
      const response = await axios.post(`http://localhost:3000/api/v2/user/followorunfollow/${userId}`, null, {
        // headers: { Authorization: `Bearer ${loggedInUser.token}` }, // Adjust token usage if needed
        withCredentials: true,
      });

      if (response.data.success) {
        // Update the local Redux store by refetching or modifying suggestedUsers
        const updatedSuggestedUsers = suggestedUsers.map((user) =>
          user._id === userId
            ? { ...user, isFollowing: !user.isFollowing } // Toggle the isFollowing property
            : user
        );
        dispatch(setSuggestedUsers(updatedSuggestedUsers)); // Update Redux store
      }
    } catch (error) {
      console.error("Error following/unfollowing user:", error);
    }
  };

  return (
    <div className="my-2">
      <div className="flex items-center justify-between pr-10">
        <h1 className="font-semibold text-gray-600">Suggested for you</h1>
        <span className="font-medium cursor-pointer">See All</span>
      </div>
      {suggestedUsers?.map((user) => {
        return (
          <div key={user._id} className="flex items-center justify-between my-5 pr-10">
            <div className="flex items-center gap-2">
              <Link to={`/profile/${user?._id}`}>
                <Avatar>
                  <AvatarImage src={user?.profilePicture} />
                  <AvatarFallback>
                    <User2 />
                  </AvatarFallback>
                </Avatar>
              </Link>

              <div>
                <h1 className="font-semibold text-sm">
                  <Link to={`/profile/${user?._id}`}>{user?.username}</Link>
                </h1>
                <span className="text-gray-600 text-sm">
                  {user?.bio || "Bio here..."}
                </span>
              </div>
            </div>
            <span
              className={`text-xs font-bold cursor-pointer ${
                user?.isFollowing ? "text-red-400" : "text-blue-400"
              }`}
              onClick={() => handleFollowOrUnfollow(user._id)}
            >
              {user?.isFollowing ? "Unfollow" : "Follow"}
            </span>
          </div>
        );
      })}
    </div>
  );
};

export default SuggestedUsers;
