import { describe, it, afterEach } from "vitest";
import config from '../../config/config.js';
import { createContext } from '../../tests/httpMocks.js';
import * as controller from '../controllers/authController.js';
import authService,{ AUTH_INVALID} from "../services/AuthService.js";
import sessionRepo from '../repos/sessionRepo.js';
import { ValidationError } from '../helpers/errors/errors.js';

afterEach(() => {
  vi.restoreAllMocks();
});

describe('authController',() => {
  describe('login', () => {

    it('returns 400 when username or password missing', async () => {
      const { req, res } = createContext({
        req: { body: { username: 'bob' } },
      });
  
      await controller.login(req, res);
  
      assert.equal(res.status.mock.calls[0][0], 400);
      assert.ok(res.json.mock.calls.length === 1);
    });
  
    it('returns 401 when credentials are invalid', async () => {
      vi.spyOn(authService, 'login').mockRejectedValue(AUTH_INVALID);
  
      const { req, res } = createContext({
        req: {
          body: { username: 'bob', password: 'wrong' },
          ip: '127.0.0.1',
          get: () => 'Mozilla',
        },
      });
  
      await controller.login(req, res);
  
      assert.equal(res.status.mock.calls[0][0], 401);
      assert.ok(res.json.mock.calls.length === 1);
    });
	it('throws on error other than AUTH_INVALID', async () => {
		vi.spyOn(authService, 'login').mockRejectedValue(new Error('Some other error'));
		const { req, res } = createContext({
		req: {
			body: { username: 'alice', password: 'badpassword' },
			ip: '127.0.0.1',
			get: () => 'Mozilla',
		},
		});
		await expect(controller.login(req, res)).rejects.toThrow('Some other error');
	});
  
    it('sets cookies and returns token + user on success', async () => {
      const fakeResult = {
        token: 'jwt123',
        person: { id: 42, email: 'test@test.com' },
        defaults: { theme: 'dark' },
      };
  
      vi.spyOn(authService, 'login').mockResolvedValue(fakeResult);
      vi.spyOn(authService, 'generateCSRFToken').mockReturnValue('csrf123');
  
      const { req, res } = createContext({
        req: {
          body: { username: 'bob', password: 'pw' },
          ip: '127.0.0.1',
          get: () => 'Mozilla',
        },
      });
  
      await controller.login(req, res);
  
      // Auth service called correctly
      assert.deepEqual(authService.login.mock.calls[0][0], 'bob');
      assert.deepEqual(authService.login.mock.calls[0][1], 'pw');
  
      // Auth cookie
      assert.ok(
        res.cookie.mock.calls.some(call => call[0] === config.COOKIE_NAME && call[1] === 'jwt123')
      );
  
      // CSRF cookie
      assert.ok(
        res.cookie.mock.calls.some(call => call[0] === config.CSRF.COOKIE_NAME && call[1] === 'csrf123')
      );
  
      // Response body
      const json = res.json.mock.calls[0][0];
      assert.equal(json.token, 'jwt123');
      assert.equal(json.person.id, 42);
      assert.equal(json.person.email, 'test@test.com');
    });
  
  });
    describe('logout',() => {
        it('returns 204 and deletes session when logged in', async () => {
            // Arrange
            const spy = vi
              .spyOn(sessionRepo, 'deleteSession');
      
            const { req, res, next } = createContext({
              req: {
                session: { id: 1 },
              },
            });
      

            // Act
            await controller.logout(req, res, next);
      
            // Assert
            expect(spy).toHaveBeenCalledOnce();
            expect(spy).toHaveBeenCalledWith(1);
      
            expect(res.clearCookie).toHaveBeenCalledWith(config.COOKIE_NAME,expect.any(Object));
            expect(res.clearCookie).toHaveBeenCalledWith(config.CSRF.COOKIE_NAME,expect.any(Object));

            expect(res.status).toHaveBeenCalledWith(204);
            expect(res.send).toHaveBeenCalled();
      
            expect(next).not.toHaveBeenCalled();
        });
        it('return 204 when no user logged in',async () => {
          // Arrange
          const spy = vi
            .spyOn(sessionRepo, 'deleteSession');
    
          const { req, res, next } = createContext();
    

          // Act
          await controller.logout(req, res, next);
    
          // Assert
          expect(spy).not.toHaveBeenCalled();
    
          expect(res.clearCookie).toHaveBeenCalledWith(config.COOKIE_NAME,expect.any(Object));
          expect(res.clearCookie).toHaveBeenCalledWith(config.CSRF.COOKIE_NAME,expect.any(Object));

          expect(res.status).toHaveBeenCalledWith(204);
          expect(res.send).toHaveBeenCalled();
    
          expect(next).not.toHaveBeenCalled();
        });
    });
	
	describe('register', () => {
		it('returns 201 and result on successful registration', async () => {
			const fakeResult = {
				token: 'jwt456',
				person: { id: 99, email: 'new@user.com' },
			};
			vi.spyOn(authService, 'register').mockResolvedValue(fakeResult);
			vi.spyOn(authService, 'generateCSRFToken').mockReturnValue('csrf456');

			const { req, res } = createContext({
				req: {
					body: { username: 'newuser', password: 'pw' },
					ip: '127.0.0.1',
					get: () => 'Mozilla',
				},
			});

			await controller.register(req, res);

			expect(authService.register).toHaveBeenCalledWith(
				req.body,
				{ ip: req.ip, agentData: 'Mozilla' }
			);
						expect(res.json).toHaveBeenCalledWith(fakeResult);
			expect(res.cookie).toHaveBeenCalledWith(config.COOKIE_NAME, 'jwt456', expect.any(Object));
			expect(res.cookie).toHaveBeenCalledWith(config.CSRF.COOKIE_NAME, 'csrf456', expect.any(Object));
		});

		it('returns 400 on ValidationError', async () => {
			vi.spyOn(authService, 'register').mockRejectedValue(new ValidationError('Invalid data'));

			const { req, res } = createContext({
				req: {
					body: { username: '', password: '' },
					ip: '127.0.0.1',
					get: () => 'Mozilla',
				},
			});

			await controller.register(req, res);

			expect(res.status).toHaveBeenCalledWith(400);
		});

		it('does not catch other errors', async () => {
			vi.spyOn(authService, 'register').mockRejectedValue(new Error('Unexpected error'));

			const { req, res } = createContext({
				req: {
					body: { username: 'fail', password: 'fail' },
					ip: '127.0.0.1',
					get: () => 'Mozilla',
				},
			});

			await expect(controller.register(req, res)).rejects.toThrow('Unexpected error');
		});
	});
});