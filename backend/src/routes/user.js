const router = require('express').Router();
const { requireAuth, syncUser } = require('../middleware/auth');

router.get('/me', requireAuth(), syncUser, (req, res) => {
  res.json(req.dbUser);
});

module.exports = router;
