import { useCallback, useRef } from 'react';
import { Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';

import { BrandMark } from '@components/common/BrandMark';
import { Button } from '@components/common/Button';
import { ErrorBanner } from '@components/common/ErrorBanner';
import { Loader } from '@components/common/Loader';
import { Screen } from '@components/layout/Screen';
import { useAuth } from '@context/AuthContext';
import { useDashboard } from '@hooks/useDashboard';
import { ROUTES } from '@navigation/routes';

import { styles } from '@theme/styles/HomeScreen.styles';

function StatTile({ label, value, tone = 'default' }) {
  return (
    <View style={styles.tile}>
      <Text
        style={[
          styles.tileValue,
          tone === 'accent' && styles.tileValueAccent,
          tone === 'muted' && styles.tileValueMuted,
        ]}
      >
        {value}
      </Text>
      <Text style={styles.tileLabel}>{label}</Text>
    </View>
  );
}

export function HomeScreen({ navigation }) {
  const { user, signOut } = useAuth();
  const { stats, accountStats, isLoading, error, isForbidden, refresh } =
    useDashboard();

  const hasFocusedOnce = useRef(false);

  useFocusEffect(
    useCallback(() => {
      if (!hasFocusedOnce.current) {
        hasFocusedOnce.current = true;
        return;
      }
      refresh();
    }, [refresh])
  );

  return (
    <Screen background="canvas">
      <BrandMark size="medium" style={styles.brand} />

      <View style={styles.identity}>
        <Text style={styles.identityLabel}>Signed in as</Text>
        <Text style={styles.identityValue}>{user?.email ?? 'Unknown'}</Text>
      </View>

      {error ? (
        <View style={styles.errorBlock}>
          <ErrorBanner message={error} />
          {!isForbidden ? (
            <Button
              title="Try again"
              onPress={refresh}
              variant="secondary"
              fullWidth={false}
            />
          ) : null}
        </View>
      ) : null}

      {isLoading ? (
        <Loader message="Loading overview…" fullScreen={false} />
      ) : (
        <>
          <Text style={styles.sectionLabel}>Employees</Text>
          <View style={styles.tileGrid}>
            <StatTile label="Total" value={stats.total} />
            <StatTile label="Active" value={stats.active} />
            <StatTile label="Inactive" value={stats.inactive} tone="muted" />
            <StatTile
              label="Awaiting registration"
              value={stats.awaitingRegistration}
              tone={stats.awaitingRegistration ? 'accent' : 'default'}
            />
          </View>

          <Text style={styles.sectionLabel}>Accounts</Text>
          {accountStats ? (
            <View style={styles.tileGrid}>
              <StatTile label="Registered" value={accountStats.total} />
              <StatTile
                label="Email unverified"
                value={accountStats.unverified}
                tone={accountStats.unverified ? 'accent' : 'default'}
              />
              <StatTile
                label="Locked out"
                value={accountStats.locked}
                tone={accountStats.locked ? 'accent' : 'muted'}
              />
            </View>
          ) : (
            <Text style={styles.unavailable}>
              Account figures are unavailable right now.
            </Text>
          )}
        </>
      )}

      <Text style={styles.sectionLabel}>Manage</Text>

      <Button
        title="Employees"
        onPress={() => navigation.navigate(ROUTES.MAIN.EMPLOYEES)}
        style={styles.action}
      />

      <Button
        title="New employee"
        onPress={() => navigation.navigate(ROUTES.MAIN.CREATE_EMPLOYEE)}
        variant="secondary"
        style={styles.action}
      />

      <Button
        title="Accounts"
        onPress={() => navigation.navigate(ROUTES.MAIN.ACCOUNTS)}
        variant="secondary"
        style={styles.action}
      />

      <Button title="Sign out" onPress={signOut} variant="text" />
    </Screen>
  );
}
