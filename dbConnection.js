const mongoose = require('mongoose');
const Channel = require("./models/channel");
const User = require("./models/user");
const { v4: uuidv4 } = require('uuid');
const connectToDatabase = async (server) => {
  try {
    await mongoose.connect(`mongodb+srv://${process.env.DBUSERNAME}:${process.env.DBPASSWORD}@chat-app.xvurvda.mongodb.net/`);
    console.log('Database connected!');

    

    const io = require('socket.io')(server, {
      cors: {
        origin: '*',
        methods: ['GET', 'POST'],
        allowedHeaders: ['my-custom-header'],
        credentials: true,
      },
    });
    io.on('connection', (socket) => {
        console.log('a user connected');
        socket.on('send message', async(data) => {
            console.log('message: ' );
            console.log(data);
            const channel = await Channel.findOne({ _id: data.channelId });
            if (!channel) {
              // Handle error if channel is not found
              console.log("tesh")
              return;
            }
            const user = await User.findOne({username:data.username});
            const msg = {
              senderId: user._id.toString(),
              senderUsername: data.username,
              message: data.message,
              date: new Date(),
              id:uuidv4(),
            };

            channel.chat.push(msg);
            io.emit('new message', {
                ...msg,
                channelId:data.channelId
            });
            await channel.save();
          });
        socket.on('disconnect', () => {
          console.log('user disconnected');
        });
      });
    // io.on('connection', (socket) => {
    //   console.log('HEEYE');

    // //   socket.on('join', (data) => {
    // //     console.log('hsh');
    // //     socket.join(data.channelId, () => {
    //     //   socket.to(data.channelId).broadcast.emit('user-connected', data.un);

    //     //   socket.on('disconnect', () => {
    //     //     console.log('zebi')
    //     //     socket.to(data.channelId).broadcast.emit('user-disconnected', data.un);
    //     //   });

    //       socket.on('send message', async (data) => {
    //         console.log(data);
    //         const channel = await Channel.findOne({ _id: data.channelId });
    //         if (!channel) {
    //           // Handle error if channel is not found
    //           return;
    //         }
    //         const user = await User.findOne({username:data.username});
    //         const msg = {
    //           senderId: user._id.toString(),
    //           senderUsername: data.username,
    //           message: data.message,
    //           date: new Date(),
    //         };

    //         channel.chat.push(msg);
    //         io.to(data.channelId).emit('new message', {
    //             ...msg,
    //             channelId:data.channelId
    //         });
    //         await channel.save();
    //       });
    // //     });
    // //   });
    // });
  } catch (err) {
    console.log(err);
  }
};

module.exports = connectToDatabase;