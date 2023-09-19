exports.isAuthenticated = (req, res, next) => {
    if (req.session && req.session.userId) {
      // User is authenticated, allow access to the next middleware or route
      next();
    } else {
      // User is not authenticated, redirect to the login page or show an error message
      res.redirect('/login'); // You can customize the redirection URL
    }
  };