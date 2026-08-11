import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { CreateDepartmentScreen } from '@screens/departments/CreateDepartmentScreen';
import { DepartmentDetailScreen } from '@screens/departments/DepartmentDetailScreen';
import { DepartmentListScreen } from '@screens/departments/DepartmentListScreen';
import { EditDepartmentScreen } from '@screens/departments/EditDepartmentScreen';
import { CreateEmployeeScreen } from '@screens/employees/CreateEmployeeScreen';
import { CreateTeamScreen } from '@screens/teams/CreateTeamScreen';
import { EditTeamScreen } from '@screens/teams/EditTeamScreen';
import { TeamDetailScreen } from '@screens/teams/TeamDetailScreen';
import { TeamListScreen } from '@screens/teams/TeamListScreen';
import { EditEmployeeScreen } from '@screens/employees/EditEmployeeScreen';
import { EmployeeDetailScreen } from '@screens/employees/EmployeeDetailScreen';
import { EmployeeListScreen } from '@screens/employees/EmployeeListScreen';
import { HomeScreen } from '@screens/home/HomeScreen';
import { UserDetailScreen } from '@screens/users/UserDetailScreen';
import { UserListScreen } from '@screens/users/UserListScreen';

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
    </Stack.Navigator>
  );
}
