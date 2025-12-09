import { describe, it } from "vitest";
import config from "../../config/config.js";
import sessionRepo from '../repos/sessionRepo.js';
import personRepo from '../repos/personRepo.js';
import { Authenticate } from "./authentication.js";
import userData from '../../tests/testFixtures';
import { error } from "winston";

describe("Authentication Middleware", () => {
    let req, res, next;

    beforeEach(() => {
        req = {
            headers: {},
            cookies: {},
            config: {},
        };

        res = {
            status: vi.fn(() => res),
            json: vi.fn().mockReturnThis(),
            clearCookie: vi.fn(),
        };

        next = vi.fn();

        vi.restoreAllMocks();
    });

    describe("No Auth", () => {
        it("calls next() and no req.session when no auth provided", async () => {
            // Arrange

            // Act
            await Authenticate(req, res, next);

            // Assert
            expect(next).toHaveBeenCalled();
            expect(req.session).toBeNull();
        });
    });

    describe("Cookie Auth", () => {
        it('Ignores the database if there is already a session', async () => {
            //Arrange
            req.session = {
                id  : 69,
            };

            //Act
            await Authenticate(req, res, next);

            //Assert
            expect(next).toHaveBeenCalled();
            expect(req.session.id).toBe(69);

        });
        it('sets req.session when valid cookie', async () => {

            req.cookies[config.COOKIE_NAME] = userData.testUserSession.userkey;
            vi.spyOn(sessionRepo, 'findByUserKey').mockImplementationOnce(async (userkey) => {
                return {
                    id          : 1,
                    person      : {
                        id          : 69,
                        siteAdmin   : false,
                        email       : '',
                        first      : 'I',
                        middle     : 'Am',
                        last       : 'Test',
                    }
                };});

            vi.spyOn(personRepo, 'getById').mockImplementationOnce(async (id) => {
                return {
                    id: 69,
                    email: '',
                };
            });
            //Act
            await Authenticate(req, res, next);

            //Assert
            expect(next).toHaveBeenCalled();
            expect(req.session).toBeDefined();
            expect(req.session.person).toBe(69);
        });
        it('does not set req.session when invalid cookie', async () => {

            req.cookies[config.COOKIE_NAME] = 'invalidcookie';

            vi.spyOn(sessionRepo, 'findByUserKey').mockImplementationOnce(async (userkey) => {
                return null;
            });

            //Act
            await Authenticate(req, res, next);

            //Assert
            expect(next).toHaveBeenCalled();
            expect(req.session).toBeNull();
        });
        it('calls next(err) on sessionRepo error', async () => {

            req.cookies[config.COOKIE_NAME] = 'somecookie';

            vi.spyOn(sessionRepo, 'findByUserKey').mockImplementationOnce(async (userkey) => {
                throw new Error('Database error');
            });

            //Act
            await Authenticate(req, res, next);

            //Assert
            expect(next).toHaveBeenCalledWith(expect.any(Error));
        });
    });

    describe("Basic Auth", () => {
        it("sets req.user with valid token", async () => {
            // base64("myuserkey:myapikey")
            const encoded = Buffer.from("123:myapikey").toString("base64");

            req.headers.authorization = `Basic ${encoded}`;

            vi.spyOn(personRepo, "getPersonByApiKey").mockResolvedValue({
                id: 123,
                email: "example@test.com"
            });

            await Authenticate(req, res, next);

            // Assertions
            expect(personRepo.getPersonByApiKey).toHaveBeenCalledWith("123", "myapikey");

            expect(req.user).toBeDefined();
            expect(req.user.id).toBe(123);
            expect(next).toHaveBeenCalledOnce();
        });
        it("returns 401 when API key is invalid", async () => {
            // base64("myuserkey:invalidapikey")
            const encoded = Buffer.from("123:invalidapikey").toString("base64");

            req.headers.authorization = `Basic ${encoded}`;

            vi.spyOn(personRepo, "getPersonByApiKey").mockResolvedValue(null);

            await Authenticate(req, res, next);

            // Assertions
            expect(personRepo.getPersonByApiKey).toHaveBeenCalledWith("123", "invalidapikey");

            expect(res.status).toHaveBeenCalledWith(401);
            expect(next).not.toHaveBeenCalled();
        });
        it("returns 400 when Authorization header is malformed", async () => {
            req.headers.authorization = `Basic malformedheader`;

            await Authenticate(req, res, next);

            // Assertions
            expect(res.status).toHaveBeenCalledWith(400);
            expect(next).not.toHaveBeenCalled();
        });
        it("returns 400 when Authorization header uses unsupported scheme", async () => {
            req.headers.authorization = `NotBasic sometoken`;

            await Authenticate(req, res, next);

            // Assertions
            expect(res.status).toHaveBeenCalledWith(400);
            expect(next).not.toHaveBeenCalled();
        });
    });
});