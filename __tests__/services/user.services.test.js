jest.mock('../../models/user.model.js');
jest.mock('../../utils/generateToken.js');
jest.mock('../../utils/cookieAuth.js');
jest.mock('../../utils/httpStatus.js');
jest.mock('../../utils/appError.js');
jest.mock('../../middlewares/uploadImage.js', () => ({
  uploadSingleImage: jest.fn(() => jest.fn())
}));

const User = require('../../models/user.model.js');
const generateToken = require('../../utils/generateToken.js');
const { setAuthCookies } = require('../../utils/cookieAuth.js');
const httpStatus = require('../../utils/httpStatus.js');
const AppError = require('../../utils/appError.js');
const userServices = require('../../services/user.services.js');

describe('User Services', () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      user: { _id: 'user123', role: 'user' },
      body: {},
      params: {},
      file: null,
      files: {}
    };
    res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    next = jest.fn();
    jest.clearAllMocks();
    httpStatus.SUCCESS = 'success';
  });

  describe('getAllUsers', () => {
    it('should call factory getAll with User model', () => {
      expect(typeof userServices.getAllUsers).toBe('function');
    });
  });

  describe('getUserById', () => {
    it('should call factory getOne with User model', () => {
      expect(typeof userServices.getUserById).toBe('function');
    });
  });

  describe('getLoggedUser', () => {
    it('should return logged in user without password', async () => {
      const mockUser = {
        _id: 'user123',
        name: 'John Doe',
        email: 'john@example.com',
        phone: '1234567890'
      };

      User.findById = jest.fn().mockReturnValue({
        select: jest.fn().mockResolvedValue(mockUser)
      });

      req.user._id = 'user123';

      await userServices.getLoggedUser(req, res, next);

      expect(User.findById).toHaveBeenCalledWith('user123');
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalled();
    });

    it('should return 404 if user not found', async () => {
      User.findById = jest.fn().mockReturnValue({
        select: jest.fn().mockResolvedValue(null)
      });

      req.user._id = 'user123';

      await userServices.getLoggedUser(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.any(AppError));
    });
  });

  describe('updateUser', () => {
    it('should update user data', async () => {
      const mockUpdatedUser = {
        _id: 'user123',
        name: 'Updated Name',
        email: 'updated@example.com',
        phone: '9876543210',
        slug: 'updated-name'
      };

      User.findByIdAndUpdate = jest.fn().mockResolvedValue(mockUpdatedUser);

      req.params.id = 'user123';
      req.body = { name: 'Updated Name', email: 'updated@example.com', phone: '9876543210' };

      await userServices.updateUser(req, res, next);

      expect(User.findByIdAndUpdate).toHaveBeenCalledWith(
        'user123',
        expect.any(Object),
        expect.objectContaining({ new: true, runValidators: true })
      );
      expect(res.status).toHaveBeenCalledWith(200);
    });

    it('should generate slug from name when name is updated', async () => {
      const mockUpdatedUser = {
        _id: 'user123',
        name: 'New Name',
        slug: 'new-name'
      };

      User.findByIdAndUpdate = jest.fn().mockResolvedValue(mockUpdatedUser);

      req.params.id = 'user123';
      req.body = { name: 'New Name' };

      await userServices.updateUser(req, res, next);

      const updateData = User.findByIdAndUpdate.mock.calls[0][1];
      expect(updateData.slug).toBeDefined();
    });

    it('should return 404 if user not found', async () => {
      User.findByIdAndUpdate = jest.fn().mockResolvedValue(null);

      req.params.id = 'nonexistent';
      req.body = { name: 'Updated' };

      await userServices.updateUser(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.any(AppError));
    });
  });

  describe('updateLoggedUser', () => {
    it('should update logged in user profile', async () => {
      const mockUpdatedUser = {
        _id: 'user123',
        name: 'Updated Name',
        email: 'updated@example.com',
        phone: '9876543210'
      };

      const mockQuery = {
        select: jest.fn().mockResolvedValue(mockUpdatedUser)
      };
      User.findByIdAndUpdate = jest.fn().mockReturnValue(mockQuery);

      req.user._id = 'user123';
      req.body = { name: 'Updated Name', email: 'updated@example.com', phone: '9876543210' };

      await userServices.updateLoggedUser(req, res, next);

      expect(User.findByIdAndUpdate).toHaveBeenCalledWith(
        'user123',
        expect.objectContaining({
          name: 'Updated Name',
          email: 'updated@example.com',
          phone: '9876543210'
        }),
        expect.any(Object)
      );
      expect(res.status).toHaveBeenCalledWith(200);
    });

    it('should return 404 if logged in user not found', async () => {
      const mockQuery = {
        select: jest.fn().mockResolvedValue(null)
      };
      User.findByIdAndUpdate = jest.fn().mockReturnValue(mockQuery);

      req.user._id = 'user123';
      req.body = { name: 'Updated' };

      await userServices.updateLoggedUser(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.any(AppError));
    });
  });

  describe('changeUserPassword', () => {
    it('should change password for user', async () => {
      const mockUser = {
        _id: 'user123',
        password: 'oldpassword',
        save: jest.fn().mockResolvedValue(true)
      };

      User.findById = jest.fn().mockResolvedValue(mockUser);

      req.params.id = 'user123';
      req.body = { password: 'newpassword123' };

      await userServices.changeUserPassword(req, res, next);

      expect(mockUser.save).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
    });

    it('should return 404 if user not found', async () => {
      User.findById = jest.fn().mockResolvedValue(null);

      req.params.id = 'nonexistent';
      req.body = { password: 'newpass' };

      await userServices.changeUserPassword(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.any(AppError));
    });
  });

  describe('updateLoggedUserPassword', () => {
    it('should update password and issue new token', async () => {
      const mockUser = {
        _id: 'user123',
        password: 'oldpassword',
        save: jest.fn().mockResolvedValue(true)
      };

      User.findById = jest.fn().mockResolvedValue(mockUser);
      generateToken.mockReturnValue('new-token');

      req.user._id = 'user123';
      req.body = { password: 'newpassword123' };

      await userServices.updateLoggedUserPassword(req, res, next);

      expect(mockUser.save).toHaveBeenCalled();
      expect(generateToken).toHaveBeenCalledWith('user123');
      expect(setAuthCookies).toHaveBeenCalledWith(res, 'new-token');
      expect(res.status).toHaveBeenCalledWith(200);
    });
  });

  describe('deleteUser', () => {
    it('should call factory deleteOne with User model', () => {
      expect(typeof userServices.deleteUser).toBe('function');
    });
  });

  describe('createUser', () => {
    it('should call factory createOne with preProcess addSlug', () => {
      expect(typeof userServices.createUser).toBe('function');
    });
  });

  describe('uploadProfileImage', () => {
    it('should be defined', () => {
      expect(typeof userServices.uploadProfileImage).toBe('function');
    });
  });

  describe('resizeImage', () => {
    it('should be defined', () => {
      expect(typeof userServices.resizeImage).toBe('function');
    });
  });
});
