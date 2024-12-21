import React, { useState } from "react";
import { Dialog, DialogContent, DialogTrigger } from "./ui/dialog";
import {
  Bookmark,
  BookmarkCheck,
  HeartIcon,
  MessageCircleIcon,
  MoreHorizontal,
  Send,
  UserCircle2,
} from "lucide-react";

import { Button } from "./ui/button";
import CommentDialog from "./CommentDialog";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { useDispatch, useSelector } from "react-redux";
import store from "./redux/store";
import axios from "axios";
import { toast } from "sonner";
import {
  setBookmarkedPost,
  setPosts,
  setSelectedPost,
} from "./redux/postSlice";
import { FaHeart, FaRegHeart } from "react-icons/fa";

const Post = ({ post }) => {
  const [text, setText] = useState("");
  const [open, setOpen] = useState(false);
  const { user } = useSelector((store) => store.auth);
  const { selectedPost } = useSelector((store) => store.post);
  const { posts, bookmarkedPost } = useSelector((store) => store.post);
  const [liked, setLiked] = useState(post.likes.includes(user?._id) || false);
  const [bookmarked, setBookmarked] = useState(
    user?.bookmarks?.includes(post._id) || false
  );
  const [postLike, setPostLike] = useState(post.likes.length);
  const [comment, setComment] = useState(post.comments);
 
  const dispatch = useDispatch();

  const onchangeHandler = (e) => {
    const inputText = e.target.value;
    if (inputText.trim()) {
      setText(inputText);
    } else {
      setText("");
    }
  };

  const likeOrUnlikeHandler = async () => {
    try {
      const action = liked ? "unlike" : "like";
      const res = await axios.get(
        `http://localhost:3000/api/v2/post/${post?._id}/${action}`,
        { withCredentials: true }
      );
      if (res.data.success) {
        const updatedLikes = liked ? postLike - 1 : postLike + 1;
        setPostLike(updatedLikes);
        setLiked(!liked);

        // update post in redux
        const updatedPostData = posts.map((p) =>
          p._id == post._id
            ? {
                ...p,
                likes: liked
                  ? p.likes.filter((id) => id !== user._id)
                  : [...p.likes, user._id],
              }
            : p
        );
        dispatch(setPosts(updatedPostData));
      }
      toast.success(res.data.message);
    } catch (error) {
      toast.error(error.response.data.message);
    }
  };

  const commentHandler = async () => {
    try {
      const res = await axios.post(
        `http://localhost:3000/api/v2/post/${post._id}/comment`,
        { text },
        {
          headers: {
            "Content-Type": "application/json",
          },
          withCredentials: true,
        }
      );
      if (res.data.success) {
        const updatedCommentData = [...comment, res.data.comment];
        // setComment(updatedCommentData);

        const updatedPostData = posts.map((p) =>
          p._id === post._id ? { ...p, comments: updatedCommentData } : p
        );
        dispatch(setPosts(updatedPostData));
        toast.success(res.data.message);
        setComment(updatedCommentData)
        setText("");
      }
    } catch (error) {
      console.log(error);
      toast.error(error.response.data.error);
    }
  };

  const deletePostHandler = async () => {
    try {
      const res = await axios.delete(
        `http://localhost:3000/api/v2/post/delete/${post?._id}`,
        { withCredentials: true }
      );
      if (res.data.success) {
        const updatedPostData = posts.filter(
          (postItem) => postItem?._id !== post?._id
        );
        dispatch(setPosts(updatedPostData));
        toast.success(res.data.message);
      }
    } catch (error) {
      toast.error(error.response.data.message);
    }
  };

  const bookmarkHandler = async () => {
    try {
      const res = await axios.get(
        `http://localhost:3000/api/v2/post/${post?._id}/bookmark`,
        {
          withCredentials: true,
        }
      );
      if (res.data.success) {
        setBookmarked(!bookmarked);
        toast.success(res.data.message);

        const updatedBookmarks = bookmarked
          ? user.bookmarks.filter((id) => id !== post._id)
          : [...user.bookmarks, post._id];

        dispatch(setBookmarkedPost(updatedBookmarks));
      }
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="flex flex-col w-full max-w-sm mx-auto">
      <div className="flex items-center  justify-between">
        <div className="flex items-center gap-2">
          <Avatar>
            <AvatarImage src={post.author?.profilePicture} alt="image" />
            <AvatarFallback>
              <UserCircle2 />
            </AvatarFallback>
          </Avatar>
          <h1>{post.author?.username}</h1>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <MoreHorizontal className="cursor-pointer" />
          </DialogTrigger>
          <DialogContent className="flex flex-col items-center text-sm text-center">
            <Button
              variant="ghost"
              className="cursor-pointer w-fit font-bold text-red-400"
            >
              Unfollow
            </Button>
            <Button variant="ghost" className="cursor-pointer w-fit ">
              Add to favorites
            </Button>
            {user && user?._id === post?.author._id && (
              <Button
                variant="ghost"
                className="cursor-pointer w-fit "
                onClick={deletePostHandler}
              >
                Delete
              </Button>
            )}
          </DialogContent>
        </Dialog>
      </div>
      {/* main posted image */}
      <img
        className="rounded-sm my-2 w-full max-h-[550px] object-cover"
        src={post.image}
        alt="imagePost"
      />
      {/* like comment button under image */}
      <div className="flex justify-between">
        <div className="flex gap-4 m-2">
          {liked ? (
            <FaHeart
              size={22}
              onClick={likeOrUnlikeHandler}
              className="cursor-pointer text-red-600 "
            />
          ) : (
            <FaRegHeart
              size={22}
              onClick={likeOrUnlikeHandler}
              className="cursor-pointer hover:text-gray-600"
            />
          )}

          <MessageCircleIcon
            onClick={() => {
              dispatch(setSelectedPost(post));
              setOpen(true);
            }}
            className="cursor-pointer hover:text-gray-600"
          />
          <Send className="cursor-pointer hover:text-gray-600" />
        </div>
        <div>
          {bookmarked ? (
            <BookmarkCheck
            onClick={bookmarkHandler}
              className="cursor-pointer hover:text-gray-600"
            />
          ) : (
            <Bookmark
            onClick={bookmarkHandler}
              className="cursor-pointer hover:text-gray-600"
            />
          )}
        </div>
      </div>
      <span className="font-medium block mb-2">{postLike} likes</span>
      <p>
        <span className="font-medium mr-2">{post.author?.username}</span>
        {post.caption}
      </p>
      {comment.length > 0 && (
        <span
          onClick={() => {
            dispatch(setSelectedPost(post));
            setOpen(true);
          }}
          className="cursor-pointer text-gray-400"
        >
          View all {comment.length} comments
        </span>
      )}

      <CommentDialog open={open} setOpen={setOpen} />
      <div className="flex items-center justify-between">
        <input
          type="text"
          placeholder="Add a comment"
          className="outline-none text-sm w-full"
          value={text}
          onChange={onchangeHandler}
        />
        {text && (
          <span
            onClick={commentHandler}
            className="text-blue-600 cursor-pointer hover:bg-slate-100 px-3 py-1 rounded-md"
          >
            Post
          </span>
        )}
      </div>
    </div>
  );
};

export default Post;
