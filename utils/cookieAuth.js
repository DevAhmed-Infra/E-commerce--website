

// CLAIMER THIS IS FROM MY OWN DOCs AND THOUGHTS

/**
 * Set authentication cookies after login
 */
function setAuthCookies(res, token) {
  // Access token cookie (short-lived, httpOnly)
  res.cookie('token', token, {
    httpOnly: true, // No JavaScript access
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict', // CSRF protection
    path: '/',
    maxAge: 15 * 60 * 1000 // 15 minutes
  });
}

/**
 * Clear cookies on logout
 */
function clearAuthCookies(res) {
  res.clearCookie('token', { path: '/' });
}

module.exports = { setAuthCookies, clearAuthCookies };
