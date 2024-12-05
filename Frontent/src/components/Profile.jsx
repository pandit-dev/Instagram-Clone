import React, { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { AtSign, Heart, MessageCircle, User2 } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import useGetUserProfile from "@/hooks/useGetUserProfile";
import { Button } from "./ui/button";
import { Badge } from "@/components/ui/badge";
import axios from "axios";
import { setUserProfile } from "./redux/authSlice.js";

const Profile = () => {
  const params = useParams();
  const userId = params.id;

  useGetUserProfile(userId);

  const dispatch = useDispatch();
  const { userProfile, user } = useSelector((store) => store.auth);

  const isLoggedInUserProfile = user?._id === userProfile?._id;
  const [isFollowing, setIsFollowing] = useState(
    userProfile?.followers?.includes(user?._id)
  );

  const [activeTab, setActiveTab] = useState("posts");

  const handleTabChange = (tab) => setActiveTab(tab);

  const displayPost =
    (activeTab === "posts" && userProfile?.posts) ||
    (activeTab === "saved" && userProfile?.bookmarks) ||
    (activeTab === "reels" && userProfile?.reels) ||
    (activeTab === "tags" && userProfile?.tags);

  const handleFollowOrUnfollow = async () => {
    try {
      const response = await axios.post(
        `http://localhost:3000/api/v2/user/followorunfollow/${userId}`,
        null,
        {
          withCredentials: true,
        }
      );

      if (response.data.success) {
        setIsFollowing((prev) => !prev); // Toggle the follow state
        // Optionally update the Redux store
        const updatedFollowers = isFollowing
          ? userProfile.followers.filter((id) => id !== user._id)
          : [...userProfile.followers, user._id];
        dispatch(
          setUserProfile({ ...userProfile, followers: updatedFollowers })
        );
      }
    } catch (error) {
      console.error("Error following/unfollowing user:", error);
    }
  };

  return (
    <div className="flex mx-w-4xl justify-center mx-auto pl-10">
      <div className="flex flex-col gap-20 p-8">
        <div className="grid grid-cols-2">
          <section className="flex items-center justify-center ">
            <Avatar className="h-32 w-32">
              <AvatarImage src={userProfile?.profilePicture} />
              <AvatarFallback>
                <User2 />
              </AvatarFallback>
            </Avatar>
          </section>
          <section>
            <div className="flex flex-col gap-5">
              <div className="flex items-center gap-4">
                <span>{userProfile?.username}</span>
                {isLoggedInUserProfile ? (
                  <>
                    <Link to="/account/edit">
                      <Button
                        variant="secondary"
                        className="hover:bg-gray-200 h-8"
                      >
                        Edit Profile
                      </Button>
                    </Link>
                    <Button
                      variant="secondary"
                      className="hover:bg-gray-200 h-8"
                    >
                      View archive
                    </Button>
                    <Button
                      variant="secondary"
                      className="hover:bg-gray-200 h-8"
                    >
                      Add tools
                    </Button>
                  </>
                ) : isFollowing ? (
                  <>
                    <Button
                      variant="secondary"
                      className="hover:bg-gray-200 h-8"
                    >
                      Message
                    </Button>
                    <Button
                      variant="secondary"
                      className="hover:bg-gray-200 h-8"
                      onClick={handleFollowOrUnfollow}
                    >
                      Unfollow
                    </Button>
                  </>
                ) : (
                  <Button
                    className="bg-blue-600 hover:bg-blue-400 h-8"
                    onClick={handleFollowOrUnfollow}
                  >
                    Follow
                  </Button>
                )}
              </div>
              <div className="flex items-center gap-10">
                <p>{userProfile?.posts.length} Posts</p>
                <Button variant="ghost" className="cursor-pointer">
                  {userProfile?.followers.length} followers
                </Button>
                <Button variant="ghost" className="cursor-pointer">
                  {userProfile?.following.length} following
                </Button>
              </div>
              <div className="flex flex-col gap-1">
                <span className="font-semibold">
                  {userProfile?.bio || "bio here"}
                </span>
                <Badge variant="secondary" className="w-fit">
                  <AtSign />
                  <span className="pl-1">{userProfile?.username}</span>
                </Badge>
              </div>
            </div>
          </section>
        </div>
        <div className="border-t border-t-gray-300 ">
          <div className="flex items-center justify-center gap-10 text-sm">
            <span
              className={`py-3 cursor-pointer ${
                activeTab === "posts" ? "font-bold" : ""
              }`}
              onClick={() => handleTabChange("posts")}
            >
              POSTS
            </span>
            <span
              className={`py-3 cursor-pointer ${
                activeTab === "saved" ? "font-bold" : ""
              }`}
              onClick={() => handleTabChange("saved")}
            >
              SAVED
            </span>
            <span
              className={`py-3 cursor-pointer ${
                activeTab === "reels" ? "font-bold" : ""
              }`}
              onClick={() => handleTabChange("reels")}
            >
              REELS
            </span>
            <span
              className={`py-3 cursor-pointer ${
                activeTab === "tags" ? "font-bold" : ""
              }`}
              onClick={() => handleTabChange("tags")}
            >
              TAGS
            </span>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {displayPost &&
              displayPost?.map((post) => {
                return (
                  <div key={post._id} className="relative group cursor-pointer">
                    <img
                      src={post.image}
                      alt="post image"
                      className="rounded-sm w-80 aspect-square object-cover"
                    />
                    <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity duration-3000">
                      <div className="flex items-center justify-between text-white gap-4 space-x-4">
                        <button className="flex items-center gap-1 hover:text-gray-300">
                          <Heart />
                          <span>{post?.likes.length}</span>
                        </button>
                        <button className="flex items-center  gap-1 hover:text-gray-300">
                          <MessageCircle />
                          <span>{post?.comments.length}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
