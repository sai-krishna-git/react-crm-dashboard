const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const GitHubStrategy = require("passport-github2").Strategy;
const axios = require("axios"); // Needed for fetching GitHub emails
const User = require("./models/User");

// ==============================
// \u2705 Google Strategy Configuration
// ==============================
passport.use(
    new GoogleStrategy(
        {
            clientID: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            callbackURL: process.env.GOOGLE_CALLBACK_URL || "http://localhost:5000/auth/google/callback",
        },
        async (accessToken, refreshToken, profile, done) => {
            try {
                console.log("\u2705 Google Profile Received:", profile);

                const email = profile.emails?.[0]?.value;
                if (!email) return done(new Error("No email found"), null);

                let user = await User.findOne({ email });

                if (!user) {
                    user = await User.create({
                        name: profile.displayName || "No Name",
                        email: email,
                        googleId: profile.id,
                        role: "customer",
                        avatar: profile.photos?.[0]?.value || "",
                        password: "google-oauth",
                    });
                    console.log("\u2705 New User Created via Google:", user);
                } else if (!user.googleId) {
                    user.googleId = profile.id;
                    await user.save();
                    console.log("\u2705 Google ID Added to Existing User:", user);
                } else {
                    console.log("\u2705 Existing User Logged in via Google:", user);
                }

                return done(null, user);
            } catch (err) {
                console.error("\u274c Error in GoogleStrategy:", err);
                return done(err, null);
            }
        }
    )
);

// ==============================
// \u2705 GitHub Strategy Configuration
// ==============================
passport.use(
    new GitHubStrategy(
        {
            clientID: process.env.GITHUB_CLIENT_ID,
            clientSecret: process.env.GITHUB_CLIENT_SECRET,
            callbackURL: process.env.GITHUB_CALLBACK_URL || "http://localhost:5000/auth/github/callback",
        },
        async (accessToken, refreshToken, profile, done) => {
            try {
                console.log("\u2705 GitHub Profile Received:", profile);

                let email = profile.emails?.[0]?.value;

                // \U0001f539 Fetch verified emails from GitHub API if email is missing
                if (!email) {
                    const res = await axios.get("https://api.github.com/user/emails", {
                        headers: { Authorization: ⁠ Bearer ${accessToken} ⁠ },
                    });

                    // Find the primary and verified email
                    const verifiedEmail = res.data.find((email) => email.primary && email.verified);
                    email = verifiedEmail ? verifiedEmail.email : null;
                }

                if (!email) return done(new Error("No email found from GitHub"), null);

                let user = await User.findOne({ email });

                if (!user) {
                    user = await User.create({
                        name: profile.displayName || profile.username,
                        email: email,
                        githubId: profile.id,
                        role: "customer",
                        avatar: profile.photos?.[0]?.value || "",
                        password: "github-oauth",
                    });
                    console.log("\u2705 New User Created via GitHub:", user);
                } else if (!user.githubId) {
                    user.githubId = profile.id;
                    await user.save();
                    console.log("\u2705 GitHub ID Added to Existing User:", user);
                } else {
                    console.log("\u2705 Existing User Logged in via GitHub:", user);
                }

                return done(null, user);
            } catch (err) {
                console.error("\u274c Error in GitHubStrategy:", err);
                return done(err, null);
            }
        }
    )
);

// ==============================
// \u2705 Serialize & Deserialize User (Fixing session persistence)
// ==============================
passport.serializeUser((user, done) => {
    done(null, { id: user.id, role: user.role }); // Storing role for session validation
});

passport.deserializeUser(async (data, done) => {
    try {
        const user = await User.findById(data.id);
        if (!user) return done(new Error("User not found"), null);
        done(null, user);
    } catch (err) {
        done(err, null);
    }
});
