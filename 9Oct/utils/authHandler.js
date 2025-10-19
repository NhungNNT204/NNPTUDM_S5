let { Response } = require('./responseHandler')
let jwt = require("jsonwebtoken")
let users = require('../schemas/users')

module.exports = {
    Authentication: async function (req, res, next) {
        try {
            let token = req.headers.authorization ? req.headers.authorization : req.cookies.token;
            if (!token) {
                return Response(res, 403, false, "user chua dang nhap");
            }
            if (token.startsWith("Bearer ")) token = token.split(" ")[1];
            // jwt.verify will throw if invalid or expired
            const decoded = jwt.verify(token, "NNPTUD");
            req.userId = decoded._id;
            next();
        } catch (err) {
            return Response(res, 403, false, "user chua dang nhap");
        }
    },
    Authorization: function (...roleRequire) {
        return async function (req, res, next) {
            let userId = req.userId;
            let user = await users.findById(userId).populate({
                path: 'role',
                select: 'name'
            });
            let role = user.role.name;
            if(roleRequire.includes(role)){
                next();
            }else{
                Response(res, 403, false, "ban khong du quyen");
            }
        }
    }
}