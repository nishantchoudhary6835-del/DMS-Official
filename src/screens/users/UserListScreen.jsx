import { useCallback, useMemo, useRef, useState } from 'react';
import { FlatList, RefreshControl, ScrollView, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';

import { Button } from '@components/common/Button';
import { Chip } from '@components/common/Chip';
import { ErrorBanner } from '@components/common/ErrorBanner';
import { Loader } from '@components/common/Loader';
import { Screen } from '@components/layout/Screen';
import { UserCard } from '@components/user/UserCard';
import { useUsers } from '@hooks/useUsers';
import { ROUTES } from '@navigation/routes';
import {
  ACCOUNT_STATUS_LABELS,
  ACCOUNT_STATUS_LEVELS,
} from '@validation/user';

import { styles } from '@theme/styles/UserListScreen.styles';

const EXTRA_FILTERS = [
  { key: 'UNVERIFIED', label: 'Email unverified' },
  { key: 'LOCKED', label: 'Locked out' },
];

export function UserListScreen({ navigation }) {
  const { users, isLoading, isRefreshing, error, isForbidden, refresh } =
    useUsers();

  const [statusFilter, setStatusFilter] = useState(null);
  const [extraFilter, setExtraFilter] = useState(null);

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

  const visible = useMemo(
    () =>
      users.filter((user) => {
        if (statusFilter && user.accountStatus !== statusFilter) return false;
        if (extraFilter === 'UNVERIFIED' && user.isEmailVerified) return false;
        if (extraFilter === 'LOCKED' && !user.lockUntil) return false;

        return true;
      }),
    [users, statusFilter, extraFilter]
  );

  const hasFilters = Boolean(statusFilter || extraFilter);

  const toggleStatus = (value) =>
    setStatusFilter((prev) => (prev === value ? null : value));

  const toggleExtra = (value) =>
    setExtraFilter((prev) => (prev === value ? null : value));

  const renderEmpty = () => {
    if (isLoading) return null;

    return (
      <View style={styles.centred}>
        <Text style={styles.emptyTitle}>
          {hasFilters ? 'Nothing matches' : 'No accounts yet'}
        </Text>
        <Text style={styles.emptyBody}>
          {hasFilters
            ? 'Try a different filter.'
            : 'Accounts appear here once employees register with their work email.'}
        </Text>
      </View>
    );
  };

  return (
    <Screen background="canvas" scrollable={false} padded={false}>
      <View style={styles.header}>
        <Button
          title="← Back"
          onPress={() => navigation.goBack()}
          variant="text"
          fullWidth={false}
        />
      </View>

      <View style={styles.titleRow}>
        <Text style={styles.title}>Accounts</Text>
        <Text style={styles.count}>
          {isLoading
            ? 'Loading…'
            : `${visible.length} ${visible.length === 1 ? 'account' : 'accounts'}`}
        </Text>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterRow}
      >
        {ACCOUNT_STATUS_LEVELS.map((status) => (
          <Chip
            key={status}
            label={ACCOUNT_STATUS_LABELS[status]}
            selected={statusFilter === status}
            onPress={() => toggleStatus(status)}
          />
        ))}
        {EXTRA_FILTERS.map((item) => (
          <Chip
            key={item.key}
            label={item.label}
            selected={extraFilter === item.key}
            onPress={() => toggleExtra(item.key)}
          />
        ))}
      </ScrollView>

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
        <Loader message="Loading accounts…" />
      ) : (
        <FlatList
          data={visible}
          keyExtractor={(item) => item._id ?? item.email}
          renderItem={({ item }) => (
            <UserCard
              user={item}
              onPress={
                item._id
                  ? () =>
                      navigation.navigate(ROUTES.MAIN.ACCOUNT_DETAIL, {
                        userId: item._id,
                      })
                  : undefined
              }
            />
          )}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={renderEmpty}
          refreshControl={
            <RefreshControl refreshing={isRefreshing} onRefresh={refresh} />
          }
        />
      )}
    </Screen>
  );
}
