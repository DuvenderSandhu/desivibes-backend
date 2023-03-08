import jwt from 'jsonwebtoken'
let JWT_STRING="DSandhu@DesiVibes"

function fetchUser(req, res, next) {
  if (req.body.token) {
    try {
      let result = jwt.verify(req.body.token, JWT_SECRET);
      req.user = result.user;
    } catch (error) {
      res.status(401).json({ error: "Unauthorized Login" });
    }
  }
  next();
};
module.exports=fetchUser