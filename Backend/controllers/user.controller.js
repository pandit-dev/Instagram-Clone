import {User} from "../models/user.model.js";
import { Post } from "../models/post.model.js";
import cloudinary from "../utils/cloudinary.js";
import getDataUri from "../utils/datauri.js";
import generateToken from "../utils/generateToken.js";
import bcrypt from "bcrypt";

export const signup = async (req, res)=>{
    try {
        const {username, email, password}= req.body;
        if(!username || !email || !password){
            return res.status(401).json({
                message:"Somethig is missing, please check !",
                success:false,
            })
        }
        const user = await User.findOne({email})
        if(user){
            return res.status(401).json({
                message:"Something went wrong !",
                success: false,
            })
        }
        bcrypt.hash(password, 12, async function (err, hash) {
            const createdUser = await User.create({
                username,
                email,
                password: hash
            })
            let token = generateToken(createdUser)
            res.cookie("token", token, {httpOnly:true, sameSite:'strict'})
            return res.status(200).json({
                message:"Account Created successfully !",
                success: true,
            })
        })
    } catch (error) {
        console.log(error);
        
    }
}

export const login = async (req, res)=>{
    try {
        const {email, password} = req.body;
        if(!email || !password){
            return res.status(401).json({
                message:"Something is missing, please check !",
                success:false,
            })
        }
        let user = await User.findOne({email})
        if(!user || !(await bcrypt.compare(password, user.password))){
            return res.status(401).json({
                message:'Username or password is incorrect',
                success: false,
            })
        }
        
        // const isPasswordMatch = await bcrypt.compare(password, user.password)
        // if(!isPasswordMatch) return res.status(401).json({message:'Username or password is incorrect', success:false});
              
        let token = generateToken(user)
        // populate each postid in the array
        const populatedPosts = await Promise.all(
            user.posts.map(async(postId)=>{
                const post = await Post.findById(postId)
                if(post.author.equals(user._id)){
                    return post;
                }
                return null;
            })
        )
        // const populatedBookmark = await Promise.all(
        //     user.bookmarks.map(async(postId)=>{
        //         const post = await Post.findById(postId)
        //         if(post.author.equals(user._id)){
        //             return post;
        //         }
        //         return null;
        //     })
        // )
        user = {
            _id: user._id,
            username:user.username,
            email:user.email,
            profilePicture:user.profilePicture,
            bio:user.bio,
            followers:user.followers,
            following:user.following,
            bookmarks:user.bookmarks,
            posts:populatedPosts
        }
        return res.cookie("token", token, {httpOnly:true, sameSite:'strict'})
        .status(200).json({
            message:`Welcome ${user.username}`,
            success: true,
            user
        })
            
              
    } catch (error) {
        console.log(error);        
    }
}

export const logout = async (req, res)=>{
    try {
        return res.cookie("token", "",).json({
            message:"Logout successful",
            success:true
        })
    } catch (error) {
        console.log(error);        
    }
}

export const getProfile = async (req, res)=>{
    try {
        const userId = req.params.id;
        let user = await User.findById(userId).populate({path:'posts', createdAt:-1}).populate('bookmarks')
        return res.status(200).json({
            user,
            success:true
        })
    } catch (error) {
        console.log(error);
        
    }
}

export const editProfile = async (req, res)=>{
    try {
        const userId = req.id;
        const {bio, gender} = req.body;
        const profilePicture = req.file;
        let cloudResponse;

        if(profilePicture){
            const fileUri = getDataUri(profilePicture)
            cloudResponse = await cloudinary.uploader.upload(fileUri)
        }
        const user = await User.findById(userId).select("-password")
        if(!user){
            return res.status(404).json({
                message:'User not found',
                success: false
            })
        }
        if(bio) user.bio = bio;
        if(gender) user.gender = gender;
        if(profilePicture) user.profilePicture = cloudResponse.secure_url;

        await user.save();

        return res.status(200).json({
            message:'Profile updated',
            success: true,
            user
        })
    } catch (error) {
        console.log(error);        
    }
}

export const getSuggestedUsers= async(req, res)=>{
    try {
        const suggestedUsers = await User.find({_id:{$ne:req.id},followers:{$ne:req.id}}).select("-password").select("-email")
        if(!suggestedUsers){
            return res.status(400).json({
                message:'Currently do not have any user'
            })
        }
        return res.status(200).json({
            success:true,
            users:suggestedUsers
        }) 
    } catch (error) {
        console.log(error);        
    }
}

export const followOrUnfollow = async (req, res) => {
    try {
        const loggedInUserId = req.id; // ID of the currently logged-in user
        const targetUserId = req.params.id; // ID of the target user to follow/unfollow

        if (loggedInUserId === targetUserId) {
            return res.status(400).json({
                message: 'You cannot follow or unfollow yourself.',
                success: false,
            });
        }

        const loggedInUser = await User.findById(loggedInUserId);
        const targetUser = await User.findById(targetUserId);

        if (!loggedInUser || !targetUser) {
            return res.status(404).json({
                message: 'User not found.',
                success: false,
            });
        }

        // Check if the logged-in user is already following the target user
        const isFollowing = loggedInUser.following.includes(targetUserId);

        if (isFollowing) {
            // Unfollow logic
            await Promise.all([
                User.updateOne(
                    { _id: loggedInUserId },
                    { $pull: { following: targetUserId } }
                ),
                User.updateOne(
                    { _id: targetUserId },
                    { $pull: { followers: loggedInUserId } }
                ),
            ]);

            return res.status(200).json({
                message: 'Unfollow successful.',
                success: true,
            });
        } else {
            // Follow logic
            await Promise.all([
                User.updateOne(
                    { _id: loggedInUserId },
                    { $push: { following: targetUserId } }
                ),
                User.updateOne(
                    { _id: targetUserId },
                    { $push: { followers: loggedInUserId } }
                ),
            ]);

            return res.status(200).json({
                message: 'Follow successful.',
                success: true,
            });
        }
    } catch (error) {
        console.error('Error in followOrUnfollow:', error);
        return res.status(500).json({
            message: 'An error occurred. Please try again later.',
            success: false,
        });
    }
};
