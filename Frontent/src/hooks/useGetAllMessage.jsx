import { setMessages } from "@/components/redux/chatSlice";
import store from "@/components/redux/store";
import axios from "axios";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";

const useGetAllMessage = () => {
  const dispatch = useDispatch();
  const {selectedUser} = useSelector(store=> store.auth)

  useEffect(() => {
    const fetchAllMessages = async () => {
      try {
        const res = await axios.get(`http://localhost:3000/api/v2/message/all/${selectedUser?._id}`, {
          withCredentials: true,
        });
        if (res.data.success) {
          dispatch(setMessages(res.data.messages));
        }
      } catch (error) {
        console.log(error);
      }
    };
    fetchAllMessages();
  }, [selectedUser]);
};

export default useGetAllMessage;
