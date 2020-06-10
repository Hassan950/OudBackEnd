const admin = require('firebase-admin');
const config = require('config');
const { User, Followings, Track } = require('../models');

/*
 * Initiazliation of firebase admin SDk
 */
try {
  const serviceAccount = config.get('Firebase_Service_Acc');
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: 'https://oud-zerobased.firebaseio.com'
  });
} catch (err) {
  if (config.get('NODE_ENV') === 'production') {
    throw err;
  }
}

/**
 * Utility function that sends 1 notification
 * 
 * @function
 * @author Mohamed Abo-Bakr
 * @summary Sends 1 notification
 * @param {String} token the registration token of the reciever
 * @param {String} image Image to be added in the notification
 * @param {String} host the host name to add it to the url
 * @param {String} message The message to be sent
 */
exports.OneNotify = async (token, image, host, message) => {
  var payload = {
    webpush: {
      notification: {
        icon: `${host}/api/${config.get('LOGO_URL')}`,
        title: 'Oud',
        body: message,
        image: `${host}/api/${image}`
      }
    },
    android: {
      notification: {
        icon: `${host}/api/${config.get('LOGO_URL')}`,
        title: 'Oud',
        body: message,
        image: `${host}/api/${image}`
      }
    },
    token: token
  };
  admin
    .messaging()
    .send(payload)
    .then(response => {
      // Response is a message ID string.
      console.log('Successfully sent message:', response);
    })
    .catch(error => {
      console.log('Error sending message:', error);
    });
};


/**
 * Utility function that sends many notifications
 * 
 * @function
 * @author Mohamed Abo-Bakr
 * @summary Sends many notifications
 * @param {String} tokens the registration tokens of the recievers
 * @param {String} image Image to be added in the notification
 * @param {String} host the host name to add it to the url
 * @param {String} message The message to be sent
 */
exports.manyNotify = (tokens, image, host, message) => {
  if(tokens.length == 0) return;
  var payload = {
    webpush: {
      notification: {
        icon: `${host}/api/${config.get('LOGO_URL')}`,
        title: 'Oud',
        body: message,
        image: `${host}/api/${image}`
      }
    },
    android: {
      notification: {
        icon: `${host}/api/${config.get('LOGO_URL')}`,
        title: 'Oud',
        body: message,
        image: `${host}/api/${image}`
      }
    },
    tokens: tokens
  };
  admin
    .messaging()
    .sendMulticast(payload)
    .then(response => {
      // Response is a message ID string.
      console.log('Successfully sent message:', response);
    })
    .catch(error => {
      console.log('Error sending message:', error);
    });
};

/**
 * Utility function that sends topic notification to all tokens subscribed to the topic
 * 
 * @function
 * @author Mohamed Abo-Bakr
 * @summary Sends notification for all tokens subscribed to a ceratin topic
 * @param {String} topic the topic to send notifications for
 * @param {String} image Image to be added in the notification
 * @param {String} host the host name to add it to the url
 * @param {String} message The message to be sent
 */
exports.topicNotify = (topic, image, host, message) => {
  var payload = {
    notification: {
      icon: `${host}/api/${config.get('LOGO_URL')}`,
      title: 'Oud',
      body: message,
      image: `${host}/api/${image}`
    }
  };

  admin
    .messaging()
    .sendToTopic(`/topics/${String(topic)}`, payload)
    .then(response => {
      // Response is a message ID string.
      console.log('Successfully sent message:', response);
    })
    .catch(error => {
      console.log('Error sending message:', error);
    });
};

/**
 * Function that subcribes token to a topic
 * 
 * @function
 * @author Mohamed Abo-Bakr
 * @summary Subscribes a token to a topic
 * @param {String} token the registration token 
 * @param {String} topic The topic
 */
exports.subscribeTopic = async (token, topic) => {
  admin
    .messaging()
    .subscribeToTopic(token, `/topics/${String(topic)}`)
    .then(function(response) {
      console.log('Successfully subscribed to topic:', response.errors[0]);
    })
    .catch(function(error) {
      console.log('Error subscribing to topic:', error);
    });
};

/**
 * Function that sends notifications to people followed by the user
 * A user can follow many people at one time
 * 
 * @function
 * @author Mohamed Abo-Bakr
 * @summary Sends follow notifications
 * @param {String} tokens the registration tokens of the recievers
 * @param {String} image Image to be added in the notification (the image of the follower)
 * @param {String} host the host name to add it to the url
 * @param {String} followerName The name of the follower to be placed in the message
 */
exports.followNotification = (tokens, image, followerName, host) => {
  message = `${followerName} has started following you.`;
  this.manyNotify(tokens, image, host, message);
};

/**
 * Function that sends album release notifications for all people following an artist
 * 
 * @function
 * @author Mohamed Abo-Bakr
 * @summary Sends notifications for people following an artist when he releases an album
 * @param {Object} user the artist whose Id is the topic
 * @param {String} image Image to be added in the notification
 * @param {String} host the host name to add it to the url
 */
exports.albumReleaseNotify = (user, image, host) => {
  message = `${user.displayName} has released a new album`;
  this.topicNotify(user._id, image, host, message);
};

/**
 * Function that subcribes a user to many topics
 * 
 * @function
 * @author Mohamed Abo-Bakr
 * @summary Subscribes a user to a topic
 * @param {String} userId the Id of the user 
 * @param {String} topics The topics
 */
exports.subscribeManyTopics = async (topics, userId) => {
  const user = await User.findById(userId)
    .select('regToken')
    .lean();
  if (!user.regToken) return;
  await Promise.all(
    topics.map(topic => {
      this.subscribeTopic(user.regToken, topic);
    })
  );
};

/**
 * Function that sends notifications when a followed user starts listening to a track
 * 
 * @function
 * @author Mohamed Abo-Bakr
 * @summary Sends notifications when a followed user start listening to a track
 * @param {String} userId The ID of the user 
 * @param {String} trackId the Id of the track the user is listening to
 */
exports.listenToTrack = async (userId, trackId) => {
  const user = await User.findById(userId);
  if (user.type === 'Artist' || user.privateSession) {
    return;
  }
  let followers = Followings.find({ followedId: userId }).populate({
    path: 'userId',
    select: 'regToken'
  });
  let track = Track.findById(trackId);
  [track, followers] = await Promise.all([track, followers]);
  let tokens = followers
    .filter(follower => follower.regToken)
    .map(follower => follower.regToken);
  const host = 'https://oud-zerobase.me';
  const message = `${user.displayName} has started listening to ${track.name}`;
  this.manyNotify(tokens, user.images[0], host, message);
};
