import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { CreateEmployeeScreen } from '@screens/employees/CreateEmployeeScreen';
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
    </Stack.Navigator>
  );
}
