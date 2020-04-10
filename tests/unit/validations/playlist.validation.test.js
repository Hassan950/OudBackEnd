const { playlistValidation  } = require('../../../src/validations');

describe('playlist validations', () => {
  let req;
  let next;
  beforeEach(() => {
    req = { params: {}, query: {}, body: {} };
    next = jest.fn();
  });
  describe('getPlaylist - test', () => {
    it('should throw error when invalid id is passed', async () => {
      req.params.id = 'invalid';
      const result = (playlistValidation.getPlaylist.params.validate(req.params));
      expect(result).toHaveProperty('error');
    });
    it('should pass when idPassed is valid', async () => {
      req.params = {
        id:'5e6a1b9e496be93758ac3e5b'
      }
      const result = (playlistValidation.getPlaylist.params.validate(req.params));
      expect(result.value.id).toBe(req.params.id);
    });
  });
  describe('uploadImage - test', () => {
    it('should throw error when invalid id is passed', async () => {
      req.params.id = 'invalid';
      const result = (playlistValidation.uploadImage.params.validate(req.params));
      expect(result).toHaveProperty('error');
    });
    it('should pass when idPassed is valid', async () => {
      req.params = {
        id:'5e6a1b9e496be93758ac3e5b'
      }
      const result = (playlistValidation.uploadImage.params.validate(req.params));
      expect(result.value.id).toBe(req.params.id);
    });
  });
  describe('uploadImage - test', () => {
    it('should throw error when invalid id is passed', async () => {
      req.params.id = 'invalid';
      const result = (playlistValidation.uploadImage.params.validate(req.params));
      expect(result).toHaveProperty('error');
    });
    it('should pass when idPassed is valid', async () => {
      req.params = {
        id:'5e6a1b9e496be93758ac3e5b'
      }
      const result = (playlistValidation.uploadImage.params.validate(req.params));
      expect(result.value.id).toBe(req.params.id);
    });
  });
  describe('getImage - test', () => {
    it('should throw error when invalid id is passed', async () => {
      req.params.id = 'invalid';
      const result = (playlistValidation.getImage.params.validate(req.params));
      expect(result).toHaveProperty('error');
    });
    it('should pass when idPassed is valid', async () => {
      req.params = {
        id:'5e6a1b9e496be93758ac3e5b'
      }
      const result = (playlistValidation.getImage.params.validate(req.params));
      expect(result.value.id).toBe(req.params.id);
    });
  });
  describe('AddTracks - test', () => {
    it('should throw error when invalid id is passed', async () => {
      req.params.id = 'invalid';
      const result = (playlistValidation.addTracks.params.validate(req.params));
      expect(result).toHaveProperty('error');
    });
    it('should throw error when uris not passed is passed', async () => {
      req.body = {
        uris: null
      }
      const result = (playlistValidation.addTracks.body.validate(req.body));
      expect(result).toHaveProperty('error');
    });
    it('should throw error when uris passed isnot strings is passed', async () => {
      req.body = {
        uris: [1,2]
      }
      const result = (playlistValidation.addTracks.body.validate(req.body));
      expect(result).toHaveProperty('error');
    });
    it('should pass when id Passed is valid', async () => {
      req.params = {
        id:'5e6a1b9e496be93758ac3e5b'
      }
      const result = (playlistValidation.addTracks.params.validate(req.params));
      expect(result.value.id).toBe(req.params.id);
    });
    it('should pass when uris passed is array of strings is passed', async () => {
      req.body = {
        uris: ['1','2']
      }
      const result = (playlistValidation.addTracks.body.validate(req.body));
      expect(result.value).toHaveProperty('uris');
    });
  });
  describe('replaceTracks - test', () => {
    it('should throw error when invalid id is passed', async () => {
      req.params.id = 'invalid';
      const result = (playlistValidation.replaceTracks.params.validate(req.params));
      expect(result).toHaveProperty('error');
    });
    it('should throw error when uris not passed is passed', async () => {
      req.body = {
        uris: null
      }
      const result = (playlistValidation.replaceTracks.body.validate(req.body));
      expect(result).toHaveProperty('error');
    });
    it('should throw error when uris passed isnot strings is passed', async () => {
      req.body = {
        uris: [1,2]
      }
      const result = (playlistValidation.replaceTracks.body.validate(req.body));
      expect(result).toHaveProperty('error');
    });
    it('should pass when id Passed is valid', async () => {
      req.params = {
        id:'5e6a1b9e496be93758ac3e5b'
      }
      const result = (playlistValidation.replaceTracks.params.validate(req.params));
      expect(result.value.id).toBe(req.params.id);
    });
    it('should pass when uris passed is array of strings is passed', async () => {
      req.body = {
        uris: ['1','2']
      }
      const result = (playlistValidation.replaceTracks.body.validate(req.body));
      expect(result.value).toHaveProperty('uris');
    });
  });
  describe('deleteTracks - test', () => {
    it('should throw error when invalid id is passed', async () => {
      req.params.id = 'invalid';
      const result = (playlistValidation.deleteTracks.params.validate(req.params));
      expect(result).toHaveProperty('error');
    });
    it('should throw error when uris not passed is passed', async () => {
      req.body = {
        uris: null
      }
      const result = (playlistValidation.deleteTracks.body.validate(req.body));
      expect(result).toHaveProperty('error');
    });
    it('should throw error when uris passed isnot strings is passed', async () => {
      req.body = {
        uris: [1,2]
      }
      const result = (playlistValidation.deleteTracks.body.validate(req.body));
      expect(result).toHaveProperty('error');
    });
    it('should pass when id Passed is valid', async () => {
      req.params = {
        id:'5e6a1b9e496be93758ac3e5b'
      }
      const result = (playlistValidation.deleteTracks.params.validate(req.params));
      expect(result.value.id).toBe(req.params.id);
    });
    it('should pass when uris passed is array of strings is passed', async () => {
      req.body = {
        uris: ['1','2']
      }
      const result = (playlistValidation.deleteTracks.body.validate(req.body));
      expect(result.value).toHaveProperty('uris');
    });
  });
  describe('getTracks - test', () => {
    it('should throw error when invalid id is passed', async () => {
      req.params.id = 'invalid';
      const result = (playlistValidation.getTracks.params.validate(req.params));
      expect(result).toHaveProperty('error');
    });
    it('should throw error when offset passed not a number is passed', async () => {
      req.query = {
        offset: 'a'
      }
      const result = (playlistValidation.getTracks.query.validate(req.query));
      expect(result).toHaveProperty('error');
    });
    it('should throw error when limit passed isnot number is passed', async () => {
      req.query = {
        limit: 'a'
      }
      const result = (playlistValidation.getTracks.query.validate(req.query));
      expect(result).toHaveProperty('error');
    });
    it('should throw error when limit passed isnot more than 0  is passed', async () => {
      req.query = {
        limit: 0
      }
      const result = (playlistValidation.getTracks.query.validate(req.query));
      expect(result).toHaveProperty('error');
    });
    it('should throw error when limit passed isnot less than 50 is passed', async () => {
      req.query = {
        limit: 60
      }
      const result = (playlistValidation.getTracks.query.validate(req.query));
      expect(result).toHaveProperty('error');
    });
    it('should pass when id Passed is valid', async () => {
      req.params = {
        id:'5e6a1b9e496be93758ac3e5b'
      }
      const result = (playlistValidation.getTracks.params.validate(req.params));
      expect(result.value.id).toBe(req.params.id);
    });
    it('should pass when limit passed is number within limits is passed', async () => {
      req.query = {
        limit: 2
      }
      const result = (playlistValidation.getTracks.query.validate(req.query));
      expect(result.value).toHaveProperty('limit');
    });
  });
  describe('getUserPlaylistss - test', () => {
    it('should throw error when invalid id is passed', async () => {
      req.params.id = 'invalid';
      const result = (playlistValidation.getUserPlaylists.params.validate(req.params));
      expect(result).toHaveProperty('error');
    });
    it('should throw error when offset passed not a number is passed', async () => {
      req.query = {
        offset: 'a'
      }
      const result = (playlistValidation.getUserPlaylists.query.validate(req.query));
      expect(result).toHaveProperty('error');
    });
    it('should throw error when limit passed isnot number is passed', async () => {
      req.query = {
        limit: 'a'
      }
      const result = (playlistValidation.getUserPlaylists.query.validate(req.query));
      expect(result).toHaveProperty('error');
    });
    it('should throw error when limit passed isnot more than 0  is passed', async () => {
      req.query = {
        limit: 0
      }
      const result = (playlistValidation.getUserPlaylists.query.validate(req.query));
      expect(result).toHaveProperty('error');
    });
    it('should throw error when limit passed isnot less than 50 is passed', async () => {
      req.query = {
        limit: 60
      }
      const result = (playlistValidation.getUserPlaylists.query.validate(req.query));
      expect(result).toHaveProperty('error');
    });
    it('should pass when id Passed is valid', async () => {
      req.params = {
        id:'5e6a1b9e496be93758ac3e5b'
      }
      const result = (playlistValidation.getUserPlaylists.params.validate(req.params));
      expect(result.value.id).toBe(req.params.id);
    });
    it('should pass when limit passed is number within limits is passed', async () => {
      req.query = {
        limit: 2
      }
      const result = (playlistValidation.getUserPlaylists.query.validate(req.query));
      expect(result.value).toHaveProperty('limit');
    });
  });
  describe('reorderTracks - test', () => {
    it('should throw error when invalid id is passed', async () => {
      req.params.id = 'invalid';
      const result = (playlistValidation.reorderTracks.params.validate(req.params));
      expect(result).toHaveProperty('error');
    });
    it('should throw error when rangeLength passed not a number is passed', async () => {
      req.body = {
        rangeLength: 'a'
      }
      const result = (playlistValidation.reorderTracks.body.validate(req.body));
      expect(result).toHaveProperty('error');
    });
    it('should throw error when rangeStart passed not a number is passed', async () => {
      req.body = {
        rangeStart: 'a'
      }
      const result = (playlistValidation.reorderTracks.body.validate(req.body));
      expect(result).toHaveProperty('error');
    });
    it('should throw error when insertBefore passed not a number is passed', async () => {
      req.body = {
        insertBefore: 'a'
      }
      const result = (playlistValidation.reorderTracks.body.validate(req.body));
      expect(result).toHaveProperty('error');
    });
    it('should throw error when StartRange passed isnot +ve is passed', async () => {
      req.body = {
        rangeStart: -1
      }
      const result = (playlistValidation.reorderTracks.body.validate(req.body));
      expect(result).toHaveProperty('error');
    });
    it('should throw error when insertBefore passed isnot +ve is passed', async () => {
      req.body = {
        insertBefore: -1
      }
      const result = (playlistValidation.reorderTracks.body.validate(req.body));
      expect(result).toHaveProperty('error');
    });
    it('should throw error when insertBefore notpassed', async () => {
      req.body = {
        insertBefore: null
      }
      const result = (playlistValidation.reorderTracks.body.validate(req.body));
      expect(result).toHaveProperty('error');
    });
    it('should throw error when StartRange passed isnot passed', async () => {
      req.body = {
        rangeStart: -1
      }
      const result = (playlistValidation.reorderTracks.body.validate(req.body));
      expect(result).toHaveProperty('error');
    });
    it('should pass when id Passed is valid', async () => {
      req.params = {
        id:'5e6a1b9e496be93758ac3e5b'
      }
      const result = (playlistValidation.reorderTracks.params.validate(req.params));
      expect(result.value.id).toBe(req.params.id);
    });
    it('should pass when rangeStart passed is number within limits is passed', async () => {
      req.body = {
        rangeStart: 2
      }
      const result = (playlistValidation.reorderTracks.body.validate(req.body));
      expect(result.value).toHaveProperty('rangeStart');
    });
    it('should pass when insertBefore passed is number within limits is passed', async () => {
      req.body = {
        insertBefore: 2
      }
      const result = (playlistValidation.reorderTracks.body.validate(req.body));
      expect(result.value).toHaveProperty('insertBefore');
    });
  });
  describe('changePlaylist - test', () => {
    it('should throw error when invalid id is passed', async () => {
      req.params.id = 'invalid';
      const result = (playlistValidation.changePlaylist.params.validate(req.params));
      expect(result).toHaveProperty('error');
    });
    it('should throw error when name passed not a string', async () => {
      req.body = {
        name: 1
      }
      const result = (playlistValidation.changePlaylist.body.validate(req.body));
      expect(result).toHaveProperty('error');
    });
    it('should throw error when name passed a string with less than 3 char', async () => {
      req.body = {
        name: 'a'
      }
      const result = (playlistValidation.changePlaylist.body.validate(req.body));
      expect(result).toHaveProperty('error');
    });
    it('should throw error when name passed a string with more than 20 char', async () => {
      req.body = {
        name: '1234567890qwertyuiopasdfghjkl'
      }
      const result = (playlistValidation.changePlaylist.body.validate(req.body));
      expect(result).toHaveProperty('error');
    });
    it('should throw error when name not passed', async () => {
      req.body = {
        name: null
      }
      const result = (playlistValidation.changePlaylist.body.validate(req.body));
      expect(result).toHaveProperty('error');
    });
    it('should throw error when description passed not a string', async () => {
      req.body = {
        description: 1
      }
      const result = (playlistValidation.changePlaylist.body.validate(req.body));
      expect(result).toHaveProperty('error');
    });
    it('should throw error when description passed a string with less than 3 char', async () => {
      req.body = {
        description: 'a'
      }
      const result = (playlistValidation.changePlaylist.body.validate(req.body));
      expect(result).toHaveProperty('error');
    });
    it('should throw error when description passed a string with more than 20 char', async () => {
      req.body = {
        description: '1234567890qwertyuiopasdfghjkl'
      }
      const result = (playlistValidation.changePlaylist.body.validate(req.body));
      expect(result).toHaveProperty('error');
    });
    it('should throw error when public passed not a boolean', async () => {
      req.body = {
        public: 1
      }
      const result = (playlistValidation.changePlaylist.body.validate(req.body));
      expect(result).toHaveProperty('error');
    });
    it('should throw error when public passed not a boolean', async () => {
      req.body = {
        collabrative: 1
      }
      const result = (playlistValidation.changePlaylist.body.validate(req.body));
      expect(result).toHaveProperty('error');
    });
    it('should pass when id Passed is valid', async () => {
      req.params = {
        id:'5e6a1b9e496be93758ac3e5b'
      }
      const result = (playlistValidation.changePlaylist.params.validate(req.params));
      expect(result.value.id).toBe(req.params.id);
    });
    it('should pass when body passed is correct', async () => {
      req.body = {
        name: 'TheBest'
      }
      const result = (playlistValidation.changePlaylist.body.validate(req.body));
      expect(result.value).toHaveProperty('name');
    });
  });
  describe('createPlaylist - test', () => {
    it('should throw error when invalid id is passed', async () => {
      req.params.id = 'invalid';
      const result = (playlistValidation.createUserPlaylist.params.validate(req.params));
      expect(result).toHaveProperty('error');
    });
    it('should throw error when name passed not a string', async () => {
      req.body = {
        name: 1
      }
      const result = (playlistValidation.createUserPlaylist.body.validate(req.body));
      expect(result).toHaveProperty('error');
    });
    it('should throw error when name passed a string with less than 3 char', async () => {
      req.body = {
        name: 'a'
      }
      const result = (playlistValidation.createUserPlaylist.body.validate(req.body));
      expect(result).toHaveProperty('error');
    });
    it('should throw error when name passed a string with more than 20 char', async () => {
      req.body = {
        name: '1234567890qwertyuiopasdfghjkl'
      }
      const result = (playlistValidation.createUserPlaylist.body.validate(req.body));
      expect(result).toHaveProperty('error');
    });
    it('should throw error when name not passed', async () => {
      req.body = {
        name: null
      }
      const result = (playlistValidation.createUserPlaylist.body.validate(req.body));
      expect(result).toHaveProperty('error');
    });
    it('should throw error when description passed not a string', async () => {
      req.body = {
        description: 1
      }
      const result = (playlistValidation.createUserPlaylist.body.validate(req.body));
      expect(result).toHaveProperty('error');
    });
    it('should throw error when description passed a string with less than 3 char', async () => {
      req.body = {
        description: 'a'
      }
      const result = (playlistValidation.createUserPlaylist.body.validate(req.body));
      expect(result).toHaveProperty('error');
    });
    it('should throw error when description passed a string with more than 20 char', async () => {
      req.body = {
        description: '1234567890qwertyuiopasdfghjkl'
      }
      const result = (playlistValidation.createUserPlaylist.body.validate(req.body));
      expect(result).toHaveProperty('error');
    });
    it('should throw error when public passed not a boolean', async () => {
      req.body = {
        public: 1
      }
      const result = (playlistValidation.createUserPlaylist.body.validate(req.body));
      expect(result).toHaveProperty('error');
    });
    it('should throw error when public passed not a boolean', async () => {
      req.body = {
        collabrative: 1
      }
      const result = (playlistValidation.createUserPlaylist.body.validate(req.body));
      expect(result).toHaveProperty('error');
    });
    it('should pass when id Passed is valid', async () => {
      req.params = {
        id:'5e6a1b9e496be93758ac3e5b'
      }
      const result = (playlistValidation.createUserPlaylist.params.validate(req.params));
      expect(result.value.id).toBe(req.params.id);
    });
    it('should pass when body passed is correct', async () => {
      req.body = {
        name: 'TheBest'
      }
      const result = (playlistValidation.createUserPlaylist.body.validate(req.body));
      expect(result.value).toHaveProperty('name');
    });
  });  
});