const express = require('express');
const FollowingRouter = require('./following.route');

const router = express.Router();

// /playlists/:playlistId router
router.use('/:playlistId', FollowingRouter);

module.exports = router;
