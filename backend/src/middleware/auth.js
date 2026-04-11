const { clerkMiddleware, requireAuth, getAuth } = require('@clerk/express');
const db = require('../db/db');

// Sync Clerk user to our DB and attach db user to req
async function syncUser(req, res, next) {
  try {
    const auth = getAuth(req);
    if (!auth || !auth.userId) {
      return next();
    }

    let user = await db('users').where({ clerk_id: auth.userId }).first();

    if (!user) {
      // Create user on first login
      [user] = await db('users')
        .insert({
          clerk_id: auth.userId,
          name: auth.sessionClaims?.name || '',
          email: auth.sessionClaims?.email || '',
          phone: auth.sessionClaims?.phone || '',
          role: 'customer',
        })
        .returning('*');
    }

    req.dbUser = user;
    next();
  } catch (err) {
    next(err);
  }
}

// Require a specific role
function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.dbUser) {
      return res.status(401).json({ error: 'Not authenticated' });
    }
    if (!roles.includes(req.dbUser.role)) {
      return res.status(403).json({ error: 'Forbidden: insufficient role' });
    }
    next();
  };
}

module.exports = { syncUser, requireRole, clerkMiddleware, requireAuth };
