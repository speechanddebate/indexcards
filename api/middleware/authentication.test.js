import { describe, it } from "vitest";
import config from "../../config/config.js";
import sessionRepo from '../repos/sessionRepo.js';
import personRepo from '../repos/personRepo.js';
import { Authenticate } from "./authentication.js";
import userData from '../../tests/testFixtures';
import { createContext } from "../../tests/httpMocks.js";

describe("Authentication Middleware", () => {

    describe("No Auth", () => {
        it("calls next() and no req.person when no auth provided", async () => {
            // Arrange
            const {req, res, next} = createContext();
            // Act
            await Authenticate(req, res, next);

            // Assert
            expect(next).toHaveBeenCalled();
            expect(req.person).not.toBeDefined();
        });
    });

    describe("Cookie Auth", () => {
        it('sets req.session and req.person when valid cookie', async () => {

            const { req, res, next } = createContext({
                req: {
                  cookies: {
                    [config.COOKIE_NAME]: userData.testUserSession.userkey
                  }
                }
              });
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

            vi.spyOn(personRepo, 'getPerson').mockImplementationOnce(async (id) => {
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
            expect(req.person).toBeDefined();
        });
        it('does not set req.session or req.person when invalid cookie', async () => {

            const { req, res, next } = createContext({
                req: {
                  cookies: {
                    [config.COOKIE_NAME]: 'invalidcookie'
                  }
                }
              });
            vi.spyOn(sessionRepo, 'findByUserKey').mockImplementationOnce(async (userkey) => {
                return null;
            });

            //Act
            await Authenticate(req, res, next);

            //Assert
            expect(next).toHaveBeenCalled();
            expect(req.session).not.toBeDefined();
            expect(req.person).not.toBeDefined();
        });
        it('calls next(err) on sessionRepo error', async () => {

            const { req, res, next } = createContext({
                req: {
                  cookies: {
                    [config.COOKIE_NAME]: 'somecookie'
                  }
                }
              });
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
        it("sets req.person with valid token", async () => {
            // base64("myuserkey:myapikey")
            const encoded = Buffer.from("username:myapikey").toString("base64");

            const { req, res, next } = createContext({
                req: {
                  headers: {
                    authorization: `Basic ${encoded}`
                  }
                }
              });
            vi.spyOn(personRepo, "getPersonByUsername").mockResolvedValue({
                id: 123,
                email: "example@test.com",
				settings: {
					api_key: "myapikey"
				},
            });

            await Authenticate(req, res, next);

            // Assertions
            expect(personRepo.getPersonByUsername).toHaveBeenCalledWith("username", {includeSettings: ['api_key']});

            expect(req.person).toBeDefined();
            expect(req.person.id).toBe(123);
            expect(next).toHaveBeenCalledOnce();
        });
        it("returns 401 when API key is invalid", async () => {
            // base64("myuserkey:invalidapikey")
            const encoded = Buffer.from("username:invalidapikey").toString("base64");

            const { req, res, next } = createContext({
                req: {
                  headers: {
                    authorization: `Basic ${encoded}`
                  }
                }
              });

            vi.spyOn(personRepo, "getPersonByUsername").mockResolvedValue(null);

            await Authenticate(req, res, next);

            // Assertions
            expect(personRepo.getPersonByUsername).toHaveBeenCalledWith("username", {includeSettings: ['api_key']});

            expect(res.status).toHaveBeenCalledWith(401);
            expect(next).not.toHaveBeenCalled();
        });
        it("returns 400 when Authorization header is malformed", async () => {
            //Arrange
            const { req, res, next } = createContext({
                req: {
                  headers: {
                    authorization: `Basic malformedheader`
                  }
                }
              });

            //Act
            await Authenticate(req, res, next);

            // Assertions
            expect(res.status).toHaveBeenCalledWith(400);
            expect(next).not.toHaveBeenCalled();
        });
        it("returns 400 when Authorization header uses unsupported scheme", async () => {
            //Arrange
            const { req, res, next } = createContext({
                req: {
                  headers: {
                    authorization: `NotBasic sometoken`
                  }
                }
              });
              
            //Act
            await Authenticate(req, res, next);

            // Assertions
            expect(res.status).toHaveBeenCalledWith(400);
            expect(next).not.toHaveBeenCalled();
        });
    });
	describe("Bearer Auth", () => {
        it('sets and req.person when valid token', async () => {

            const { req, res, next } = createContext({
                req: {
					headers: {
						authorization: `Bearer ${userData.testUserSession.userkey}`
					}
				}
			  });
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

            vi.spyOn(personRepo, 'getPerson').mockImplementationOnce(async (id) => {
                return {
                    id: 69,
                    email: '',
                };
            });
            //Act
            await Authenticate(req, res, next);

            //Assert
            expect(next).toHaveBeenCalled();
            expect(req.person).toBeDefined();
        });
        it('does not set req.person when invalid token', async () => {

            const { req, res, next } = createContext({
                req: {
					headers: {
						authorization: `Bearer badtoken`
					}
                }
              });
            vi.spyOn(sessionRepo, 'findByUserKey').mockImplementationOnce(async (userkey) => {
                return null;
            });

            //Act
            await Authenticate(req, res, next);

            //Assert
            expect(next).toHaveBeenCalled();
            expect(req.person).not.toBeDefined();
        });
        it('calls next(err) on sessionRepo error', async () => {

            const { req, res, next } = createContext({
                req: {
					headers: {
						authorization: `Bearer somecookie`
					}
                }
              });
            vi.spyOn(sessionRepo, 'findByUserKey').mockImplementationOnce(async (userkey) => {
                throw new Error('Database error');
            });

            //Act
            await Authenticate(req, res, next);

            //Assert
            expect(next).toHaveBeenCalledWith(expect.any(Error));
        });
    });
});