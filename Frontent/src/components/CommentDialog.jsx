import React, { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogTrigger } from "./ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Link } from "react-router-dom";
import { MoreHorizontal, UserCircle2 } from "lucide-react";
import { Button } from "./ui/button";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import { toast } from "sonner";
import { setPosts } from "./redux/postSlice";
import Comment from "./comment";

const CommentDialog = ({ open, setOpen }) => {
  const [text, setText] = useState("");
  const [comment, setComment] = useState("")
  const { selectedPost, posts } = useSelector((store) => store.post);
  const dispatch = useDispatch();

  useEffect(() => {
    if(selectedPost){
      setComment(selectedPost.comments)
    }
  }, [selectedPost])
  

  const changeEventHandler = (e) => {
    setText(e.target.value);
  };

  const sendMessageHandler = async () => {
    try {
      const res = await axios.post(
        `http://localhost:3000/api/v2/post/${selectedPost._id}/comment`,
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
        setComment(updatedCommentData);

        const updatedPostData = posts.map((p) =>
          p._id === selectedPost._id ? { ...p, comments: updatedCommentData } : p
        );
        dispatch(setPosts(updatedPostData));
        toast.success(res.data.message);
        setText("");
      }
    } catch (error) {
      console.log(error);
      toast.error(error.response.data.error);
    }
  };

  return (
    <Dialog open={open}>
      <DialogContent
        onInteractOutside={() => setOpen(false)}
        className="max-w-5xl p-0 flex flex-col"
      >
        <div className="flex flex-1">
          <div className="w-1/2">
            <img
              src={selectedPost?.image}
              alt="Post"
              className="w-full max-h-screen object-cover rounded-l-lg"
            />
          </div>
          <div className="w-1/2 flex flex-col justify-between">
          <div className="flex flex-col">
            <div className="flex items-center justify-between p-4">

              <div className="flex gap-3 items-center">
                <Link>
                  <Avatar >
                    <AvatarImage src={selectedPost?.author?.profilePicture} />
                    <AvatarFallback>
                      <UserCircle2 />
                    </AvatarFallback>
                  </Avatar>
                </Link>
                <div>
                  <Link className="font-bold">{selectedPost?.author?.username}</Link>
                </div>
              </div>

              <Dialog>
                <DialogTrigger asChild>
                  <MoreHorizontal className="cursor-pointer" />
                </DialogTrigger>
                <DialogContent className="flex flex-col items-center text-sm text-center">
                  <div className="cursor-pointer w-full text-red-400 font-bold">Unfollow</div>
                  <div className="cursor-pointer w-full">Add to favorite</div>
                </DialogContent>
              </Dialog>
            </div>
            

            <hr />
            
            <div className="flex-1 overflow-y-auto max-h-96 px-4">
              {selectedPost?.comments.map((comment) => (
                <Comment key={comment._id} comment={comment} />
              ))}
            </div>
            </div>


            <div className="p-4">
              <div className="flex">
                <input
                  type="text"
                  value={text}
                  onChange={changeEventHandler}
                  placeholder="Add a comment..."
                  className="w-full outline-none border-gray-200"
                />
                <Button
                  disabled={!text.trim()}
                  onClick={sendMessageHandler}
                  variant="outline"
                >
                  Send
                </Button>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CommentDialog;
