const { browseValidation  } = require('../../../src/validations');
const Joi = require('@hapi/joi');

describe('playlist validations', () => {
  describe('getCategory - test', () => {
    it('shouldnot pass when id Passed isnot valid', async () => {
      const { error } = Joi.compile(browseValidation.getCategory).validate({
        params:{  id:'invalid' }
      });
      expect(error).toBeDefined();
    });
    it('should pass when id Passed is valid', async () => {
      const { error } = Joi.compile(browseValidation.getCategory).validate({
        params:{  id:'5e6a1b9e496be93758ac3e5b' }
      });
      expect(error).toBeUndefined();
    });
  });
  describe('getCategories - test', () => {
    it('shouldnot pass when offset Passed isnot number', async () => {
      const { error } = Joi.compile(browseValidation.getCategories).validate({
        query:{  offset:'invalid' }
      });
      expect(error).toBeDefined();
    });
    it('shouldnot pass when limit Passed isnot number', async () => {
      const { error } = Joi.compile(browseValidation.getCategories).validate({
        query:{  limit:'invalid' }
      });
      expect(error).toBeDefined();
    });
    it('shouldnot pass when limit Passed less than 1', async () => {
      const { error } = Joi.compile(browseValidation.getCategories).validate({
        query:{  limit:0 }
      });
      expect(error).toBeDefined();
    });
    it('shouldnot pass when limit Passed more than 50', async () => {
      const { error } = Joi.compile(browseValidation.getCategories).validate({
        query:{  limit:55 }
      });
      expect(error).toBeDefined();
    });
    it('should pass when offset and limit arenot Passed so they take default values', async () => {
      const { error } = Joi.compile(browseValidation.getCategories).validate({
      });
      expect(error).toBeUndefined();
    });
    it('should pass when offset and limit are Passed correctly', async () => {
      const { error } = Joi.compile(browseValidation.getCategories).validate({
        query:{
          offset: 1,  
          limit: 10 }
      });
      expect(error).toBeUndefined();
    });
  });
  describe('newReleases - test', () => {
    it('shouldnot pass when offset Passed isnot number', async () => {
      const { error } = Joi.compile(browseValidation.newRelease).validate({
        query:{  offset:'invalid' }
      });
      expect(error).toBeDefined();
    });
    it('shouldnot pass when limit Passed isnot number', async () => {
      const { error } = Joi.compile(browseValidation.newRelease).validate({
        query:{  limit:'invalid' }
      });
      expect(error).toBeDefined();
    });
    it('shouldnot pass when limit Passed less than 1', async () => {
      const { error } = Joi.compile(browseValidation.newRelease).validate({
        query:{  limit:0 }
      });
      expect(error).toBeDefined();
    });
    it('shouldnot pass when limit Passed more than 50', async () => {
      const { error } = Joi.compile(browseValidation.newRelease).validate({
        query:{  limit:55 }
      });
      expect(error).toBeDefined();
    });
    it('should pass when offset and limit arenot Passed so they take default values', async () => {
      const { error } = Joi.compile(browseValidation.newRelease).validate({
      });
      expect(error).toBeUndefined();
    });
    it('should pass when offset and limit are Passed correctly', async () => {
      const { error } = Joi.compile(browseValidation.newRelease).validate({
        query:{
          offset: 1,  
          limit: 10 }
      });
      expect(error).toBeUndefined();
    });
  });
  describe('categoryPlaylists - test', () => {
    it('shouldnot pass when id Passed isnot valid', async () => {
      const { error } = Joi.compile(browseValidation.categoryPlaylist).validate({
        params:{  id:'invalid' }
      });
      expect(error).toBeDefined();
    });
    it('shouldnot pass when offset Passed isnot number', async () => {
      const { error } = Joi.compile(browseValidation.categoryPlaylist).validate({
        params:{  id:'5e6a1b9e496be93758ac3e5b' },
        query:{  offset:'invalid' }
      });
      expect(error).toBeDefined();
    });
    it('shouldnot pass when limit Passed isnot number', async () => {
      const { error } = Joi.compile(browseValidation.categoryPlaylist).validate({
        params:{  id:'5e6a1b9e496be93758ac3e5b' },
        query:{  limit:'invalid' }
      });
      expect(error).toBeDefined();
    });
    it('shouldnot pass when limit Passed less than 1', async () => {
      const { error } = Joi.compile(browseValidation.categoryPlaylist).validate({
        params:{  id:'5e6a1b9e496be93758ac3e5b' },
        query:{  limit:0 }
      });
      expect(error).toBeDefined();
    });
    it('shouldnot pass when limit Passed more than 50', async () => {
      const { error } = Joi.compile(browseValidation.categoryPlaylist).validate({
        params:{  id:'5e6a1b9e496be93758ac3e5b' },
        query:{  limit:55 }
      });
      expect(error).toBeDefined();
    });
    it('should pass when id passed correctly and offset and limit arenot Passed so they take default values', async () => {
      const { error } = Joi.compile(browseValidation.categoryPlaylist).validate({
        params:{  id:'5e6a1b9e496be93758ac3e5b' }
      });
      expect(error).toBeUndefined();
    });
    it('should pass when id, offset and limit are Passed correctly', async () => {
      const { error } = Joi.compile(browseValidation.categoryPlaylist).validate({
        params:{  id:'5e6a1b9e496be93758ac3e5b' },
        query:{
          offset: 1,  
          limit: 10 }
      });
      expect(error).toBeUndefined();
    });
  });
});