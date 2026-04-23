const localStrategy = require('passport-local').Strategy;
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/user');
const bcrypt = require('bcrypt');

const init = (passport) => {
  passport.use(
    new localStrategy({ usernameField: 'email' }, async (email, password, done) => {
      const user = await User.findOne({ email });
      if (!user) return done(null, false, { message: 'No user found' });
      if (!user.password) return done(null, false, { message: 'Please sign in with Google' });
      bcrypt
        .compare(password, user.password)
        .then((match) => {
          if (match) return done(null, user, { message: 'Logged in successfully' });
          return done(null, false, { message: 'Check your credentials again' });
        })
        .catch(() => done(null, false, { message: 'Something went wrong' }));
    })
  );

  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: `${process.env.APP_URL}/auth/google/callback`,
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          let user = await User.findOne({ googleId: profile.id });
          if (user) return done(null, user);

          user = await User.findOne({ email: profile.emails[0].value });
          if (user) {
            user.googleId = profile.id;
            await user.save();
            return done(null, user);
          }

          user = await User.create({
            username: profile.displayName,
            email: profile.emails[0].value,
            googleId: profile.id,
          });
          return done(null, user);
        } catch (err) {
          return done(err);
        }
      }
    )
  );

  passport.serializeUser((user, done) => {
    done(null, user._id);
  });

  passport.deserializeUser(async (id, done) => {
    try {
      const user = await User.findById(id);
      done(null, user);
    } catch (err) {
      done(err);
    }
  });
};

module.exports = init;
