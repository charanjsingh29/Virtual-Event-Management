import { userRoleCollection } from "../user_role/user_role.resource.js";

const userResource = (user) => {
    let res = {
        "id": user._id,
        "name": user.name,
        "email": user.email
    };
    if(user.populated('roles')){
        res.roles = userRoleCollection(user.roles);
    }
    return res;
}

const userCollection = (users) => users.map(userResource);

export { userResource, userCollection };