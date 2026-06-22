import bcrypt from "bcrypt";
import { Types } from "mongoose";
import passport from "passport";
import {
  Strategy as GoogleStrategy,
  Profile,
  VerifyCallback,
} from "passport-google-oauth20";
import { Strategy as LocalStrategy } from "passport-local";
import { configs } from "./index";
import { IsActive, IUser, Role } from "../modules/user/user.interface";
import { User } from "../modules/user/user.model";

//  for credential login
passport.use(
  new LocalStrategy(
    {
      usernameField: "email",
      passwordField: "password",
    },
    async (email: string, password: string, done) => {
      try {
        const isUserExist = await User.findOne({ email }).select("+password");
        if (!isUserExist) {
          return done(null, false, { message: "User does not exist" });
        }

        // add some validation
        if (!isUserExist.isVerified) {
          // throw new AppError(httpStatus.BAD_REQUEST, "User is not verified")
          return done("User is not verified");
        }

        if (
          isUserExist.isActive === IsActive.BLOCKED ||
          isUserExist.isActive === IsActive.INACTIVE
        ) {
          // throw new AppError(httpStatus.BAD_REQUEST, `User is ${isUserExist.isActive}`)
          return done(`User is ${isUserExist.isActive}`);
        }

        if (isUserExist.isDeleted) {
          return done(null, false, {
            message: "This account has been deleted.",
          });
        }

        const isGoogleAuthenticated = isUserExist.auths.some(
          (providerObjects) => providerObjects.provider === "google",
        );

        if (isGoogleAuthenticated && !isUserExist.password) {
          return done(null, false, {
            message:
              "You authenticated through Google. Login with Google first, then set a password to use credentials.",
          });
        }

        if (!isUserExist.password) {
          return done(null, false, {
            message: "No password set. Please login with Google first.",
          });
        }

        const isPasswordMatched = await bcrypt.compare(
          password,
          isUserExist.password,
        );

        if (!isPasswordMatched) {
          return done(null, false, { message: "Password does not match" });
        }

        return done(null, isUserExist);
      } catch (error) {
        return done(error as Error);
      }
    },
  ),
);

//  for google login
passport.use(
  new GoogleStrategy(
    {
      clientID: configs.google_client_id,
      clientSecret: configs.google_client_secret,
      callbackURL: configs.google_callback_url,
    },
    async (
      accessToken: string,
      refreshToken: string,
      profile: Profile,
      done: VerifyCallback,
    ) => {
      try {
        const email = profile.emails?.[0]?.value;
        if (!email) {
          return done(null, false, { message: "No email found!" });
        }

        let isUserExist = await User.findOne({ email });

        // add some validation
        if (isUserExist && !isUserExist.isVerified) {
          return done(null, false, { message: "User is not verified" });
        }

        if (
          isUserExist &&
          (isUserExist.isActive === IsActive.BLOCKED ||
            isUserExist.isActive === IsActive.INACTIVE)
        ) {
          done(`User is ${isUserExist.isActive}`);
        }

        if (isUserExist && isUserExist.isDeleted) {
          return done(null, false, { message: "User is deleted" });
        }

        if (!isUserExist) {
          isUserExist = await User.create({
            email,
            name: profile.displayName,
            picture: profile.photos?.[0]?.value || "",
            role: Role.USER,
            isVerified: true,
            auths: [
              {
                provider: "google",
                providerId: profile.id,
              },
            ],
          });
        } else {
          if (isUserExist.isDeleted) {
            return done(null, false, { message: "Account has been deleted." });
          }

          // if user exists but didn't use Google before, link the provider
          const alreadyLinked = isUserExist.auths.some(
            (a) => a.provider === "google",
          );
          if (!alreadyLinked) {
            isUserExist.auths.push({
              provider: "google",
              providerId: profile.id,
            });
            await isUserExist.save();
          }
        }

        return done(null, isUserExist);
      } catch (error) {
        return done(error);
      }
    },
  ),
);

passport.serializeUser((user, done) => {
  const typedUser = user as IUser;
  if (!typedUser._id) {
    return done(new Error("User _id not found during serialization"));
  }
  done(null, typedUser._id);
});

passport.deserializeUser(async (id: Types.ObjectId, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error);
  }
});
