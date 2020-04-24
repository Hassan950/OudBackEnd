const admin = require('firebase-admin');
const config = require('config');
const { User, Followings, Track } = require('../models');

try {
  const serviceAccount = config.get('Firebase_Service_Acc');

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: 'https://trying-59532.firebaseio.com'
  });
} catch (err) {
  if (config.get('NODE_ENV') === 'production') {
    throw err;
  }
}

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

exports.manyNotify = (tokens, image, host, message) => {
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

exports.subscribeTopic = async (token, topic) => {
  admin
    .messaging()
    .subscribeToTopic(token, `/topics/${String(topic)}`)
    .then(function(response) {
      console.log('Successfully subscribed to topic:', response);
    })
    .catch(function(error) {
      console.log('Error subscribing to topic:', error);
    });
};

exports.followNotification = (tokens, image, followerName, host) => {
  message = `${followerName} has started following you.`;
  this.manyNotify(tokens, image, host, message);
};

exports.albumReleaseNotify = (user, image, host) => {
  message = `${user.displayName} has released a new album`;
  this.topicNotify(user._id, image, host, message);
};

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
