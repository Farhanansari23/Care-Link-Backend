module.exports = (requiredRole) => {
    return (req, res, next) => {
      try {
        if (!req.user) {
          return res.status(401).json({ error: 'Authentication required' });
        }
        if (req.user.user_type !== requiredRole) {
          return res.status(403).json({ error: `Access denied: ${requiredRole} role required` });
        }
        next();
      } catch (error) {
        res.status(403).json({ error: 'Authorization error' });
      }
    };
  };