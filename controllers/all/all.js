const User = require("../../models/user");
const bcrypt = require("bcryptjs");
const Channel = require("../../models/channel");
const { passwordValidation,usernameValidation } = require("../../utils/inputValidation");
const { use } = require("../../routes/auth/auth");
exports.getUser = async(req,res,next)=>{
    try{
        
    
    var data;
   const username = req.username; 
    const user = await User.findOne({username : username});
    if(user.channels.length === 0){
        var channelOne = []
    }else{
        var channelOne = await Channel.findById(user.channels[0].channelId);
    }
    data = {
        username : user.username,
        channels: user.channels,
        firstChannel : channelOne
    }
    return res.status(200).json({"message": "resource has been fetched","data": data});
}catch(err){
    if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
}
}

exports.getChannel = async(req,res,next)=>{
    try{
    const channelId = req.params.channelId;
    const channel = await Channel.findById(channelId);
    if(!channel){
        return res.status(404).send("channel not found");
    }
    const user = await User.findOne({username : req.username});
    const findChannel = user.channels.find((chan)=> chan.channelId.toString()=== channel._id.toString());
    if(findChannel){
        return res.status(200).send(channel);
    }
    return res.status(401).send("Unauthorized to access this channel");
}
catch(err){
    if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
}
}

exports.searchChannel = async(req,res,next)=>{
    try{
    const channelName = req.body.channelName;
    const channel = await Channel.findOne({name : channelName});
    if(!channel){
        return res.status(404).send("channel not Found !");

    }
    console.log(channel);
    const user = await User.findOne({username:req.username});
    const findChannel = user.channels.find((chan)=> chan.name === channel.name);
    if(findChannel){
        return res.status(200).json({"channel": channel});
    }
    user.channels.push({
        channelId : channel._id,
        channelName: channel.name,
        channelDescription: channel.channelDescription
    });
    channel.users.push({
        username : user.username
    })

    var result = await user.save();
    result = await channel.save();
    return res.status(200).json({"channel": channel});
}catch(err){
    console.log(err)
    if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
}
}



exports.createChannel = async(req,res,next)=>{
    try{
    const channelName = req.body.channelName;
    const channelDesc = req.body.channelDescription||'Channel Descr';
    const username = req.username;
    if(username)
    var user = await User.findOne({username});
    const findChannel = user.channels.find((channel)=> channel.channelName === channelName);
    if(findChannel){
        return res.status(400).send("channel alerady exist !");
    }
    
    const channel = new Channel({
        name : channelName,
        channelDescription: channelDesc,
        users: [
            {   
                username: user.username
            }
        ],
        chat: []
    })
    await channel.save();
    user.channels.push({
        channelId : channel._id,
        channelName : channelName,
        channelDescription: channelDesc
    });
    var result = await user.save();
    // result = await channel.find();
    user = await User.findOne({username});
    return res.status(201).send(user.channels);
}
catch(err){
    if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
}
}

exports.sendMessage = async(req,res,next)=>{
    try{
    const channelId = req.body.channelId;
    const message = req.body.message;
    const username = req.username;
    const channel = await Channel.findById(channelId);
    const user = await User.findOne({username});
    channel.chat.push({
        senderId : user._id.toString(),
        senderUsername: user.username,
        message: message,
        date : new Date()
    })
    const result = await channel.save();
    return res.status(201).send("message created successfuly !");
}
catch(err){
    if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
}
}

exports.createUser = async(req,res,next)=>{
    try{
        const username = req.body.username;
        const password = req.body.password;
        const errors = [];
        if(req.username === 'admin'){
            if (!passwordValidation(password)) {
                errors.push({
                  field: "password",
                  message:
                    "password needs to be atleast 8 characters long and have one digit and letter",
                  value: password,
                });
              }
            if (!usernameValidation(username)) {
                errors.push({
                  field: "username",
                  message:
                    "username needs to be in letters only (space inluded) and at least 4 characters long",
                  value: username,
                });
              }
            var user = await User.findOne({username});
            if(user !=null){
                errors.push({
                    field: "username",
                    message:
                      "username already exists !",
                    value: username,
                  }); 
            }
            if (errors.length > 0) {
                console.log(errors);
                return res.status(400).send(errors);
            }
            const hashedPassword = await bcrypt.hash(password, 10);
            const newUser = new User({
                username:username,
                password :hashedPassword,
                channels:[],
                role:"user",
            });
            console.log(newUser)
            await newUser.save();
            console.log("passed Here")
            return res.status(201).send("User created !")
        }else{
            return res.status(400).send("Not Authorized To create User !");
        }
        

    }catch(err){
        if (!err.statusCode) {
            err.statusCode = 500;
          }
        next(err);
    }
}

exports.ManageUsers = async(req,res,next)=>{
    try{
        const channelName = req.body.channelname;
        const users = req.body.users;
        if(req.username === "admin"){
            const channel = await Channel.findOne({name : channelName});
            if(!channel){
                return res.status(400).send("No Channel Found !");
            }
            for(let username of users){
                let user = await User.findOne({username});
                user.channels.push({
                    channelId : channel._id,
                    channelName : channel.name,
                    channelDescription: channel.channelDescription
                    
                });
                await user.save();
            }
            channel.users = users;
            await channel.save();
            return res.status(200).send('Done !')
    
        }else{
            return res.status(400).send("Not Authorized To manage users !");
        }
    }catch(err){
        if (!err.statusCode) {
            err.statusCode = 500;
          }
        next(err);
    }
    
}
exports.getUsers = async(req,res,next)=>{
    try{
        const users = await User.find({}).select('-password');
        return res.status(200).json({users})
    }catch(err){
        if (!err.statusCode) {
            err.statusCode = 500;
          }
        next(err);
    }
}
exports.getContacts = async(req,res,next)=>{
    try{
        const channels = await Channel.find({});
        return res.status(200).json({channels})
    }catch(err){
        if (!err.statusCode) {
            err.statusCode = 500;
          }
        next(err);
    }
}