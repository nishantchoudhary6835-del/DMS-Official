import { useRef, useState } from 'react';
import { Text, View } from 'react-native';

import { BrandMark } from '@components/common/BrandMark';
import { Button } from '@components/common/Button';
import { ErrorBanner } from '@components/common/ErrorBanner';
import { TextField } from '@components/common/TextField';
import { Screen } from '@components/layout/Screen';
import { useLogin } from '@hooks/useLogin';
import { ROUTES } from '@navigation/routes';
import { validateEmail, validateLoginPassword } from '@validation/auth';

import { styles } from '@theme/styles/LoginScreen.styles';

export function LoginScreen({ navigation }) {
  const { submit, isSubmitting, error, fieldErrors, clearError } = useLogin();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [localErrors, setLocalErrors] = useState({});

  const passwordRef = useRef(null);

  const emailError = fieldErrors.email || localErrors.email;
  const passwordError = fieldErrors.password || localErrors.password;

  const handleEmailChange = (value) => {
    setEmail(value);
    setLocalErrors((prev) => ({ ...prev, email: undefined }));
    if (error) clearError();
  };

  const handlePasswordChange = (value) => {
    setPassword(value);
    setLocalErrors((prev) => ({ ...prev, password: undefined }));
    if (error) clearError();
  };

  const handleSubmit = async () => {
    const errors = {
      email: validateEmail(email),
      password: validateLoginPassword(password),
    };

    if (errors.email || errors.password) {
      setLocalErrors(errors);
      return;
    }

    const succeeded = await submit({ email, password });

    if (!succeeded) {
      setPassword('');
    }
  };

  return (
    <Screen padded={false}>
      <View style={styles.page}>
        <View style={styles.card}>
          <View style={styles.cardBrand}>
            <BrandMark size="large" showTagline />
          </View>

          <View style={styles.cardBody}>
            <Text style={styles.subtitle}>
              Please sign in to continue
            </Text>

            <ErrorBanner message={error} />

            <TextField
              label="Email Address"
              icon="mail-outline"
              value={email}
              onChangeText={handleEmailChange}
              error={emailError}
              placeholder="you@syandrix.com"
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              autoComplete="email"
              textContentType="emailAddress"
              editable={!isSubmitting}
              returnKeyType="next"
              onSubmitEditing={() => passwordRef.current?.focus()}
              blurOnSubmit={false}
            />

            <TextField
              ref={passwordRef}
              label="Password"
              icon="lock-closed-outline"
              value={password}
              onChangeText={handlePasswordChange}
              error={passwordError}
              placeholder="Enter your password"
              secureTextEntry
              autoCapitalize="none"
              autoCorrect={false}
              textContentType="password"
              autoComplete="current-password"
              editable={!isSubmitting}
              returnKeyType="go"
              onSubmitEditing={handleSubmit}
            />

            <Button
              title="Sign in"
              icon="arrow-forward"
              iconPosition="trailing"
              pill
              onPress={handleSubmit}
              loading={isSubmitting}
              style={styles.action}
            />

            <Button
              title="Forgot password?"
              onPress={() => navigation.navigate(ROUTES.AUTH.FORGOT_PASSWORD)}
              variant="text"
              fullWidth={false}
              disabled={isSubmitting}
              style={styles.forgotPassword}
            />
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>First time logging in?</Text>
            <Button
              title="Set up your account"
              onPress={() => navigation.navigate(ROUTES.AUTH.REGISTER)}
              variant="text"
              fullWidth={false}
              disabled={isSubmitting}
            />
          </View>
        </View>
      </View>
    </Screen>
  );
}
