import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { AclDetailScreen } from '@screens/acl/AclDetailScreen';
import { AclListScreen } from '@screens/acl/AclListScreen';
import { CreateAclScreen } from '@screens/acl/CreateAclScreen';
import { EditAclScreen } from '@screens/acl/EditAclScreen';
import { CreateDepartmentScreen } from '@screens/departments/CreateDepartmentScreen';
import { DepartmentDetailScreen } from '@screens/departments/DepartmentDetailScreen';
import { DepartmentListScreen } from '@screens/departments/DepartmentListScreen';
import { EditDepartmentScreen } from '@screens/departments/EditDepartmentScreen';
import { CreateDocumentScreen } from '@screens/documents/CreateDocumentScreen';
import { EditDocumentScreen } from '@screens/documents/EditDocumentScreen';
import { CreateEmployeeScreen } from '@screens/employees/CreateEmployeeScreen';
import { CreateTeamScreen } from '@screens/teams/CreateTeamScreen';
import { EditTeamScreen } from '@screens/teams/EditTeamScreen';
import { TeamDetailScreen } from '@screens/teams/TeamDetailScreen';
import { TeamListScreen } from '@screens/teams/TeamListScreen';
import { EditEmployeeScreen } from '@screens/employees/EditEmployeeScreen';
import { EmployeeDetailScreen } from '@screens/employees/EmployeeDetailScreen';
import { EmployeeListScreen } from '@screens/employees/EmployeeListScreen';
import { HomeScreen } from '@screens/home/HomeScreen';
import { CreatePermissionScreen } from '@screens/permissions/CreatePermissionScreen';
import { EditPermissionScreen } from '@screens/permissions/EditPermissionScreen';
import { PermissionDetailScreen } from '@screens/permissions/PermissionDetailScreen';
import { PermissionListScreen } from '@screens/permissions/PermissionListScreen';
import { CreateRolePermissionScreen } from '@screens/rolePermissions/CreateRolePermissionScreen';
import { EditRolePermissionScreen } from '@screens/rolePermissions/EditRolePermissionScreen';
import { RolePermissionDetailScreen } from '@screens/rolePermissions/RolePermissionDetailScreen';
import { RolePermissionListScreen } from '@screens/rolePermissions/RolePermissionListScreen';
import { UserDetailScreen } from '@screens/users/UserDetailScreen';
import { UserListScreen } from '@screens/users/UserListScreen';
import { MySubmissionsScreen } from '@screens/workflow/MySubmissionsScreen';
import { PendingApprovalsScreen } from '@screens/workflow/PendingApprovalsScreen';
import { PublishedDocumentsScreen } from '@screens/workflow/PublishedDocumentsScreen';
import { WorkflowDetailScreen } from '@screens/workflow/WorkflowDetailScreen';

import { ROUTES } from './routes';

const Stack = createNativeStackNavigator();

export function MainNavigator() {
  return (
    <Stack.Navigator
      initialRouteName={ROUTES.MAIN.HOME}
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
        // Let the app-root painted canvas show through.
        contentStyle: { backgroundColor: 'transparent' },
      }}
    >
      <Stack.Screen name={ROUTES.MAIN.HOME} component={HomeScreen} />
      <Stack.Screen
        name={ROUTES.MAIN.EMPLOYEES}
        component={EmployeeListScreen}
      />
      <Stack.Screen
        name={ROUTES.MAIN.CREATE_EMPLOYEE}
        component={CreateEmployeeScreen}
      />
      <Stack.Screen
        name={ROUTES.MAIN.EMPLOYEE_DETAIL}
        component={EmployeeDetailScreen}
      />
      <Stack.Screen
        name={ROUTES.MAIN.EDIT_EMPLOYEE}
        component={EditEmployeeScreen}
      />
      <Stack.Screen name={ROUTES.MAIN.ACCOUNTS} component={UserListScreen} />
      <Stack.Screen
        name={ROUTES.MAIN.ACCOUNT_DETAIL}
        component={UserDetailScreen}
      />
      <Stack.Screen
        name={ROUTES.MAIN.DEPARTMENTS}
        component={DepartmentListScreen}
      />
      <Stack.Screen
        name={ROUTES.MAIN.CREATE_DEPARTMENT}
        component={CreateDepartmentScreen}
      />
      <Stack.Screen
        name={ROUTES.MAIN.DEPARTMENT_DETAIL}
        component={DepartmentDetailScreen}
      />
      <Stack.Screen
        name={ROUTES.MAIN.EDIT_DEPARTMENT}
        component={EditDepartmentScreen}
      />
      <Stack.Screen name={ROUTES.MAIN.TEAMS} component={TeamListScreen} />
      <Stack.Screen
        name={ROUTES.MAIN.CREATE_TEAM}
        component={CreateTeamScreen}
      />
      <Stack.Screen
        name={ROUTES.MAIN.TEAM_DETAIL}
        component={TeamDetailScreen}
      />
      <Stack.Screen name={ROUTES.MAIN.EDIT_TEAM} component={EditTeamScreen} />
      <Stack.Screen
        name={ROUTES.MAIN.PERMISSIONS}
        component={PermissionListScreen}
      />
      <Stack.Screen
        name={ROUTES.MAIN.CREATE_PERMISSION}
        component={CreatePermissionScreen}
      />
      <Stack.Screen
        name={ROUTES.MAIN.PERMISSION_DETAIL}
        component={PermissionDetailScreen}
      />
      <Stack.Screen
        name={ROUTES.MAIN.EDIT_PERMISSION}
        component={EditPermissionScreen}
      />
      <Stack.Screen
        name={ROUTES.MAIN.ROLE_PERMISSIONS}
        component={RolePermissionListScreen}
      />
      <Stack.Screen
        name={ROUTES.MAIN.CREATE_ROLE_PERMISSION}
        component={CreateRolePermissionScreen}
      />
      <Stack.Screen
        name={ROUTES.MAIN.ROLE_PERMISSION_DETAIL}
        component={RolePermissionDetailScreen}
      />
      <Stack.Screen
        name={ROUTES.MAIN.EDIT_ROLE_PERMISSION}
        component={EditRolePermissionScreen}
      />
      <Stack.Screen name={ROUTES.MAIN.ACLS} component={AclListScreen} />
      <Stack.Screen name={ROUTES.MAIN.CREATE_ACL} component={CreateAclScreen} />
      <Stack.Screen name={ROUTES.MAIN.ACL_DETAIL} component={AclDetailScreen} />
      <Stack.Screen name={ROUTES.MAIN.EDIT_ACL} component={EditAclScreen} />
      <Stack.Screen
        name={ROUTES.MAIN.CREATE_DOCUMENT}
        component={CreateDocumentScreen}
      />
      <Stack.Screen
        name={ROUTES.MAIN.EDIT_DOCUMENT}
        component={EditDocumentScreen}
      />
      <Stack.Screen
        name={ROUTES.MAIN.MY_SUBMISSIONS}
        component={MySubmissionsScreen}
      />
      <Stack.Screen
        name={ROUTES.MAIN.PENDING_APPROVALS}
        component={PendingApprovalsScreen}
      />
      <Stack.Screen
        name={ROUTES.MAIN.PUBLISHED_DOCUMENTS}
        component={PublishedDocumentsScreen}
      />
      <Stack.Screen
        name={ROUTES.MAIN.WORKFLOW_DETAIL}
        component={WorkflowDetailScreen}
      />
    </Stack.Navigator>
  );
}
