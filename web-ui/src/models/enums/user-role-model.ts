/* eslint no-unused-vars: OFF */

export enum UserRoleModel {
    admin = 1,
    operator = 2,
    guest = 3
}

export const UserRoles = [
    { id: UserRoleModel.admin, description: 'Администратор' },
    { id: UserRoleModel.operator, description: 'Оператор' },
    { id: UserRoleModel.guest, description: 'Гость' },
]
