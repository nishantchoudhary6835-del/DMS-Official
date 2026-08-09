import { useCallback, useRef } from 'react';
import { Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';

import { BrandMark } from '@components/common/BrandMark';
import { Button } from '@components/common/Button';
import { ErrorBanner } from '@components/common/ErrorBanner';
import { GradientCard } from '@components/common/GradientCard';
import { Loader } from '@components/common/Loader';
import { Screen } from '@components/layout/Screen';
import { useAuth } from '@context/AuthContext';
import { useDashboard } from '@hooks/useDashboard';
import { ROUTES } from '@navigation/routes';

import { styles } from '@theme/styles/HomeScreen.styles';

function StatTile({ label, value, spine = 'neutral' }) {
  return (
    <View style={[styles.tile, styles[`spine_${spine}`]]}>
      <Text style={styles.tileValue}>{value}</Text>
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
    <Screen>
      <BrandMark size="small" align="left" style={styles.brand} />

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
          <GradientCard style={styles.hero}>
            <Text style={styles.heroLabel}>Employees on record</Text>
            <Text style={styles.heroValue}>{stats.total}</Text>

            <View style={styles.heroRule} />

            <View style={styles.heroFooter}>
              <Text style={styles.heroMeta}>Signed in as</Text>
              <Text style={styles.heroEmail} numberOfLines={1}>
                {user?.email ?? 'Unknown'}
              </Text>
            </View>
          </GradientCard>

          <Text style={styles.sectionLabel}>Employees</Text>
          <View style={styles.tileGrid}>
            <StatTile label="Active" value={stats.active} spine="success" />
            <StatTile label="Inactive" value={stats.inactive} spine="neutral" />
            <StatTile
              label="Awaiting registration"
              value={stats.awaitingRegistration}
              spine={stats.awaitingRegistration ? 'accent' : 'neutral'}
            />
          </View>

          <Text style={styles.sectionLabel}>Accounts</Text>
          {accountStats ? (
            <View style={styles.tileGrid}>
              <StatTile
                label="Registered"
                value={accountStats.total}
                spine="info"
              />
              <StatTile
                label="Email unverified"
                value={accountStats.unverified}
                spine={accountStats.unverified ? 'accent' : 'neutral'}
              />
              <StatTile
                label="Locked out"
                value={accountStats.locked}
                spine={accountStats.locked ? 'primary' : 'neutral'}
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
        icon="people"
        onPress={() => navigation.navigate(ROUTES.MAIN.EMPLOYEES)}
        style={styles.action}
      />

      <Button
        title="New employee"
        icon="person-add-outline"
        onPress={() => navigation.navigate(ROUTES.MAIN.CREATE_EMPLOYEE)}
        variant="secondary"
        style={styles.action}
      />

      <Button
        title="Accounts"
        icon="key-outline"
        onPress={() => navigation.navigate(ROUTES.MAIN.ACCOUNTS)}
        variant="secondary"
        style={styles.action}
      />

      <Button
        title="Sign out"
        icon="log-out-outline"
        onPress={signOut}
        variant="text"
      />
    </Screen>
  );
}
