const express = require("express");
const allControllers = require("../../controllers/all/all");
const authMiddleware = require("../../utils/auth.midellware");
const router = express.Router();

//Get methods
router.get("/get-home",authMiddleware,allControllers.getUser);
router.get("/get-channel/:channelId",authMiddleware,allControllers.getChannel);
router.get('/users',authMiddleware,allControllers.getUsers);
router.get('/channels',authMiddleware,allControllers.getContacts);
// //Post methods
router.post("/search-channel",authMiddleware,allControllers.searchChannel);
router.post("/create-channel",authMiddleware,allControllers.createChannel);
router.post("/send-message",authMiddleware,allControllers.sendMessage);
router.post("/create-user",authMiddleware,allControllers.createUser);
router.post("/manage-users",authMiddleware,allControllers.ManageUsers);

module.exports = router;
