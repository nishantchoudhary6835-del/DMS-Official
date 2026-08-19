import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { ForgotPasswordScreen } from '@screens/auth/ForgotPasswordScreen';
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
        // Let the app-root painted canvas show through.
        contentStyle: { backgroundColor: 'transparent' },
      }}
    >
      <Stack.Screen name={ROUTES.AUTH.LOGIN} component={LoginScreen} />
      <Stack.Screen name={ROUTES.AUTH.REGISTER} component={RegisterScreen} />
      <Stack.Screen
        name={ROUTES.AUTH.FORGOT_PASSWORD}
        component={ForgotPasswordScreen}
      />
    </Stack.Navigator>
  );
}
