import userRoleSchema from '../../modules/user_role/user_role.model.js';
import { UserRoles } from '../../modules/user/user.enum.js';

const userRoleSeeder = async () => {
  const roles = [
    { name: UserRoles.ADMIN },
    { name: UserRoles.ORGANISER },
    { name: UserRoles.PARTICIPANT },
  ];

  try {
    for (const role of roles) {
      const foundRole = await userRoleSchema.findOne({ name: role.name });
      if (!foundRole) {
        await userRoleSchema.create(role);
      }
    }
  } catch (error) {
    console.error('Error seeding user roles:', error);
  }
}

export default userRoleSeeder;