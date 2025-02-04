const userRoleResource = (userRole) => {
    return {
        name: userRole.name
    }
}

const userRoleCollection = (userRoles) => userRoles.map(userRoleResource);

export { userRoleResource, userRoleCollection };