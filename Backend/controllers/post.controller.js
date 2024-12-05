import sharp from 'sharp';
import cloudinary from '../utils/cloudinary.js';
import { Post } from '../models/post.model.js';
import { User } from '../models/user.model.js';
import { Comment } from '../models/comment.model.js';
import { getReciverSocketId, io } from '../socket/socket.js';

export const addNewPost = async (req, res)=>{
   try {
    const {caption} = req.body;
    const image = req.file;
    const authorId = req.id;

    if(!image) return res.status(400).json({message:'Image required'})

    //image upload
    const optimizedImageBuffer = await sharp(image.buffer)
    .resize({width:800, height:800, fit:'inside'})
    .toFormat('jpeg', {quality:80})
    .toBuffer();

    //buffer to data Uri
    const fileUri = `data:image/jpeg;base64,${optimizedImageBuffer.toString('base64')}` ;
    const cloudResponse = await cloudinary.uploader.upload(fileUri);
    const post = await Post.create({
        caption,
        image:cloudResponse.secure_url,
        author:authorId
    })
    const user = await User.findById(authorId)
    if (user){
        user.posts.push(post._id);
        await user.save();
    }
    await post.populate({path:'author', select:'-password'});

    return res.status(200).json({
        message:'New post added',
        success:true,
        post,
    })

   } catch (error) {
    console.log(error);    
   }

}

export const getAllPosts = async (req, res)=>{
    try {
        const posts = await Post.find().sort({createdAt:-1})
        .populate({
            path:'author',
            select:'username profilePicture'
        }).populate({
            path:'comments',
            sort:{createdAt:-1},
            populate:{
                path:'author',
                select:'username profilePicture'
            }
        })
        return res.status(200).json({
            posts,
            success:true
        })
    } catch (error) {
        console.log(error);        
    }
}

export const getPostsOfUser = async(req,res)=>{
    try {
        const authorId = req.id;
        const posts = await Post.find({author:authorId}).sort({createdAt:-1})
        .populate({
            path:'author',
            select:'username, profilePicture'
        }).populate({
            path:'comments',
            sort:{createdAt:-1},
            populate:{
                path:'author',
                select:'username, profilePicture'
            }
        })
        return res.status(200).json({
            posts,
            success:true
        })
    } catch (error) {
        console.log(error);        
    }
}

export const likePost = async (req, res)=>{
    try {
        const userWhoLiked = req.id;
        const postId = req.params.id;

        const post = await Post.findById(postId)
        if(!post) return res.status(404).json({message:'Post not found'});

        //like logic
        await post.updateOne({$addToSet:{likes:userWhoLiked}});
        await post.save();

        //socket io logic for real time notification
        const user = await User.findById(userWhoLiked).select('username profilePicture');
        const postOwnerId = post.author.toString()
        if(postOwnerId !== userWhoLiked){
            //emit a notification event
            const notification = {
                type:'like',
                userId:userWhoLiked,
                userDetails:user,
                postId,
                message:'Your post was liked'
            }
            const postOwnerSocketId = getReciverSocketId(postOwnerId);
            io.to(postOwnerSocketId).emit('notification', notification)
        }

        return res.status(200).json({message:'Post liked', success:true});
    } catch (error) {
        console.log(error);        
    }
}

export const unLikePost = async (req,res)=>{
    try {
        const userWhoUnliked = req.id;
        const postId = req.params.id;
        
        const post = await Post.findById(postId);
        if(!post) return res.status(404).json({message:'Post not found'});

        // unLike logic
        await post.updateOne({$pull:{likes:userWhoUnliked}});
        await post.save();

        //socket io logic for real time notification
        const user = await User.findById(userWhoUnliked).select('username profilePicture');
        const postOwnerId = post.author.toString()
        if(postOwnerId !== userWhoUnliked){
            //emit a notification event
            const notification = {
                type:'unlike',
                userId:userWhoUnliked,
                userDetails:user,
                postId,
                message:'Your post was unliked'
            }
            const postOwnerSocketId = getReciverSocketId(postOwnerId);
            io.to(postOwnerSocketId).emit('notification', notification)
        }
        return res.status(200).json({message:'Post Unliked', success:true});
    } catch (error) {
        console.log(error);        
    }
}

export const addComment = async(req, res)=>{
    try {
        const userWhoComment = req.id;
        const postId = req.params.id;
        const {text} = req.body;

        if(!text) return res.status(404).json({message:'Text required'});

        //find post from postSchema by postId
        const post = await Post.findById(postId);
        if (!post) return res.status(404).json({ message: 'Post not found' });

        //create comment
        const comment = await Comment.create({
            text,
            author:userWhoComment,
            post:postId
        })
        //populate the author field after creating the comment
        const populatedComment = await Comment.findById(comment._id).populate({
            path:'author',
            select:'username profilePicture'
        });

        //after creating the comment, save it to the postSchema's comments[]
        post.comments.push(populatedComment._id);
        await post.save();

        //socket io logic for real time notification
        const user = await User.findById(userWhoComment).select('username profilePicture');
        const postOwnerId = post.author.toString()
        if(postOwnerId !== userWhoComment){
            //emit a notification event
            const notification = {
               type:'comment',
                userId:userWhoComment,
                userDetails:user,
                postId,
                message:'You have new comment'
            }
            const postOwnerSocketId = getReciverSocketId(postOwnerId);
            if (postOwnerSocketId) {
                io.to(postOwnerSocketId).emit('notification', notification);
            }
        }

        return res.status(200).json({
            message:'Comment added',
            comment:populatedComment,
            success:true
        });
    } catch (error) {
        console.log(error);        
    }
}   

export const getCommentsOfPost = async(req,res)=>{
    try {
        const postId = req.params.id;
        const comments = await Comment.find({post:postId}).populate('author', 'username, profilePicture')

        if(!comments) return res.status(404).json({message:'No comment yet', success:false});

        return res.status(200).json({            
            success:true,
            comments
        });
    } catch (error) {
        console.log(error);        
    }
}

export const deletePost = async(req,res)=>{
    try {
        const postId = req.params.id;
        const authorId = req.id;

        const post = await Post.findById(postId);
        if(!post) return res.status(404).json({message:'Post not found'});

        //check if the loggedin user is the author of the post
        if(post.author.toString() !== authorId) return res.status(403).json({message:'User unauthorized'});

        //delete post
        await Post.findByIdAndDelete(postId);

        //remove the post id from the user's post
        let user = await User.findById(authorId)
        user.posts = user.posts.filter(id => id.toString() !== postId);
        await user.save();

        //delete associated comments
        await Comment.deleteMany({post:postId})

        return res.status(200).json({message:'Post deleted', success:true});

    } catch (error) {
        console.log(error);        
    }
}

export const bookmarkedPost = async(req,res)=>{
    try {
        const authorId = req.id;
        const postId = req.params.id;

        const post = await Post.findById(postId)
        if(!post) return res.status(404).json({message:'Post not found', success:false});

        const user = await User.findById(authorId)
        if(user.bookmarks.includes(post._id)){
            //already bookmarked -> remove from bookmarks
            await user.updateOne({$pull:{bookmarks:post._id}})
            await user.save();
            return res.status(200).json({type:'unsaved', message:'Removed from bookmark', success:true})
        }else{
            //save to bookmarks                      
            await user.updateOne({$addToSet:{bookmarks:post._id}})
            await user.save();
            return res.status(200).json({message:'Post bookmarked',type:'saved',success:true})
        }
    } catch (error) {
        console.log(error);        
    }
}