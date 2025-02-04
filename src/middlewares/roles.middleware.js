const rolesMiddleware = (name) => {
    return (req, res, next) => {
        if(req.user.roles.some(role => role.name === name)){
            next();
        } else {
            res.error("Unauthorized - Role not allowed", 401);
        }
    }
}

export default rolesMiddleware;