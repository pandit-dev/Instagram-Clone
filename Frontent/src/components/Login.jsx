import React, { useEffect, useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import axios from "axios";
import { toast } from "sonner";
import { Link, useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { setAuthUser } from "./redux/authSlice";

const Login = () => {
  const {user} = useSelector(store=>store.auth)
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const [loading, setLoading] = useState(false)
  const [input, setInput] = useState({
    email: "",
    password: "",
  });
  const changeEventHandler = (e) => {
    setInput({ ...input, [e.target.name]: e.target.value });
  };
  const signupHandler = async (e) => {
    e.preventDefault();
    // console.log(input)
    try {
      setLoading (true)
      const res = await axios.post('http://localhost:3000/api/v2/user/login',input,{
        headers:{
          'Content-Type':'application/json'
        },
        withCredentials:true
      })
      if(res.data.success){
        dispatch(setAuthUser(res.data.user))
        navigate("/");
        toast.success(res.data.message)

      }

    } catch (error) {
      toast.error(error.response.data.message)
    }
    finally{
      setLoading(false)
    }
  }

  useEffect(() => {
    if(user){
      navigate("/")
    }
    
  }, [])
  

  
  return (
    <div className="flex justify-center items-center h-screen w-screen ">
      <form onSubmit={signupHandler} className="shadow-lg flex flex-col gap-5 p-8">
        <div className="m-4">
          <h1 className="font-bold text-3xl text-center mb-5">Instagram</h1>
          <p className="text-sm text-center">
            Login to see photos and videos from your friends
          </p>
        </div>

        <div>
          <span className="font-medium">Email</span>
          <Input
            type="email"
            name="email"
            value={input.email}
            onChange={changeEventHandler}
            className="focus-visible:ring-transparent my-2"
          />
        </div>

        <div>
          <span className="font-medium">Password</span>
          <Input
            type="password"
            name="password"
            value={input.password}
            onChange={changeEventHandler}
            className="focus-visible:ring-transparent my-2"
          />
        </div>
        {loading ? (
          <Button>
            <Loader2 className="animate-spin"/>
          </Button>
        ):(<Button type="submit" >Login</Button>)}
        
        <span className="text-center">Doesn't have account ? <Link to="/signup" className="text-blue-600 underline">Signup</Link></span>
      </form>
    </div>
  );
};

export default Login;
