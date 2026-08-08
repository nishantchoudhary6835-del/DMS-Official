import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { LoginScreen } from '@screens/auth/LoginScreen';
import { RegisterScreen } from '@screens/auth/RegisterScreen';

import { ROUTES } from './routes';

const Stack = createNativeStackNavigator();

export function AuthNavigator() {
  return (
    <Stack.Navigator
      initialRouteName={ROUTES.AUTH.LOGIN}
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name={ROUTES.AUTH.LOGIN} component={LoginScreen} />
      <Stack.Screen name={ROUTES.AUTH.REGISTER} component={RegisterScreen} />
    </Stack.Navigator>
  );
}
