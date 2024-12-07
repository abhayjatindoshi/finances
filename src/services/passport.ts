import { Application, RequestHandler } from "express";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import ApiError, { ApiErrorCode } from "../api-error";
import path from "path";
import passport from "passport";
import session from "express-session";
import SessionStore from "session-file-store";
import UserService from "../dao/user-service";

const userService = new UserService();

export function setupAuthentication(prefix: string, app: Application) {
  initializePassport();
  const sessionFileStoreLocation = path.join(path.resolve('dist'), 'session-store');
  const SessionFileStore = SessionStore(session)
  app.use(prefix, session({
    store: new SessionFileStore({
      path: sessionFileStoreLocation,
    }),
    secret: process.env.SESSION_SECRET!,
    resave: true,
    saveUninitialized: true
  }))
  app.use(prefix, passport.initialize());
  app.use(prefix, passport.session());
}

function initializePassport() {
  passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID!,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    callbackURL: process.env.GOOGLE_CALLBACK_URL!,
    scope: ['profile', 'email'],
  }, async (_accessToken, _refreshToken, profile, callback) => {
    try {
      const user = await userService.createUserIfNotExists(profile);
      callback(null, user);
    } catch (e) {
      callback(e);
    }
  }))

  passport.serializeUser((user: any, callback) => {
    process.nextTick(() => {
      callback(null, user)
    })
  })

  passport.deserializeUser((user: any, callback) => {
    process.nextTick(() => {
      callback(null, user);
    })
  })
}

export const authenticated: RequestHandler = (req, res, next) => {
  if (req.isAuthenticated()) {
    next();
    return;
  }

  new ApiError(400, ApiErrorCode.UNAUTHORIZED, 'You are not logged in.').respond(res);
}