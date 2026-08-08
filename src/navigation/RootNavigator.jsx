import { Loader } from '@components/common/Loader';
import { useAuth } from '@context/AuthContext';

import { AuthNavigator } from './AuthNavigator';
import { MainNavigator } from './MainNavigator';

export function RootNavigator() {
  const { isAuthenticated, isRestoring } = useAuth();

  if (isRestoring) {
    return <Loader />;
  }

  return isAuthenticated ? <MainNavigator /> : <AuthNavigator />;
}
