import { createSlice } from "@reduxjs/toolkit";

const postSlice = createSlice({
  name: "post",

  initialState: {
    posts: [],
    selectedPost: null,
    bookmarkedPost: [],
  },
  reducers: {
    //actions
    setPosts: (state, action) => {
      state.posts = action.payload;
    },
    setSelectedPost: (state, action) => {
      state.selectedPost = action.payload;
    },
    setBookmarkedPost: (state, action) => {
      state.bookmarkedPost = action.payload;
    },
  },
});
export const { setPosts, setSelectedPost, setBookmarkedPost } =
  postSlice.actions;
export default postSlice.reducer;
