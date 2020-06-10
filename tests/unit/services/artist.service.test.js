const artistService = require('../../../src/services/artist.service');
const mockingoose = require('mockingoose').default;
const requestMocks = require('../../utils/request.mock');
const {
  Artist,
  User,
  Track,
  Album,
  Request,
  Genre
} = require('../../../src/models');
let fs = require('fs').promises;
let { emailService } = require('../../../src/services');

trackIds = [
  { _id: '5e6c8ebb8b40fc5508fe8b32', album: { released: true } },
  { _id: '5e6f6a7fac1d6d06f40706f2', album: { released: true } },
  { _id: '5e6c8ebb8b40fc5518fe8b32', album: { released: true } }
];

describe('artist service', () => {
  let artist;
  let artists;
  beforeEach(() => {
    artist = new Artist({
      displayName: 'Test artist',
      password: '12341234',
      passwordConfirm: '12341234',
      email: 'testing@gmail.com',
      username: 'test-man',
      country: 'EG',
      genres: [{ _id: '5e6c8ebb8b40fc5518fe8b32' }],
      images: [
        'uploads\\users\\default-Profile.jpg',
        'uploads\\users\\default-Cover.jpg'
      ],
      popularSongs: trackIds,
      bio: 'I am not a real artist I am just here for testing.'
    });
    artist2 = new Artist({
      displayName: 'Test artist 2',
      password: '12341234',
      passwordConfirm: '12341234',
      email: 'testing2@gmail.com',
      username: 'test-man2',
      country: 'EG',
      genres: [{ _id: '5e6c8ebb8b40fc5518fe8b32' }],
      images: [
        'uploads\\users\\default-Profile.jpg',
        'uploads\\users\\default-Cover.jpg'
      ],
      popularSongs: trackIds,
      bio: 'I am here to support artist 1.'
    });

    artists = [artist, artist2];
    Artist.schema.path('popularSongs', Object);
    Artist.schema.path('genres', Object);
    Track.schema.path('album', Object);
  });

  describe('artistsExist', () => {
    it("Should return an error if the album's main artist is not the user", async () => {
      mockingoose(Artist).toReturn([artist], 'find');
      const result = await artistService.artistsExist(
        [artist._id],
        artist2._id
      );
      expect(result.statusCode).toBe(400);
    });
  });

  describe('Requests', () => {
    let request;
    beforeEach(() => {
      request = new Request({
        displayName: 'request',
        email: 'request@gmail.com',
        name: 'request',
        country: 'EG',
        genres: [{ _id: '5e6c8ebb8b40fc5518fe8b32' }],
        bio: 'I am here to support artist 1.'
      });
    });
    describe('acceptRequest', () => {
      it('Shouldn\'t crash if mailService threw any errors', async () => {
        mockingoose(Artist).toReturn(artist, 'save');
        mockingoose(Request).toReturn('', 'findOneAndDelete');
        emailService.sendEmail = jest.fn().mockImplementation(() => {
          return Promise.reject({ code: 'lol', message: 'loool' });
        });
        await artistService.acceptRequest(request, 'lolxD');
        expect(emailService.sendEmail).toBeCalled();
      });
    });
    describe('refuseRequest', () => {
      it('Shouldn\'t crash if mailService threw any errors', async () => {
        mockingoose(Request).toReturn('', 'findOneAndDelete');
        emailService.sendEmail = jest.fn().mockImplementation(() => {
          return Promise.reject({ code: 'lol', message: 'loool' });
        });
        await artistService.refuseRequest(request, 'lolxD');
        expect(emailService.sendEmail).toBeCalled();
      });
    });
  });
});
