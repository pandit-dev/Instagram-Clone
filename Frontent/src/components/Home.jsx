import React from "react";
import Feed from "./Feed";
import { Outlet } from "react-router-dom";
import RightsideBar from "./RightsideBar";
import useGetAllPost from "@/hooks/useGetAllPost";
import useGetSuggestedUsers from "@/hooks/useGetSuggestedUsers";

const Home = () => {
  useGetAllPost();
  useGetSuggestedUsers();
  return (
    <div className="flex flex-grow">
      <div className="flex-grow">
        <Feed />
        <Outlet />
      </div>
      <RightsideBar/>
    </div>
  );
};

export default Home;
