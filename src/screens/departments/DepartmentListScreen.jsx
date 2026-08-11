import { useCallback, useRef } from 'react';
import { FlatList, RefreshControl, ScrollView, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';

import { Button } from '@components/common/Button';
import { Chip } from '@components/common/Chip';
import { ErrorBanner } from '@components/common/ErrorBanner';
import { Loader } from '@components/common/Loader';
import { Screen } from '@components/layout/Screen';
import { DepartmentCard } from '@components/department/DepartmentCard';
import { useDepartments } from '@hooks/useDepartments';
import { ROUTES } from '@navigation/routes';
import { DEPARTMENT_STATUS } from '@validation/department';

import { styles } from '@theme/styles/DepartmentListScreen.styles';

export function DepartmentListScreen({ navigation }) {
  const {
    departments,
    totalCount,
    status,
    toggleStatus,
    isLoading,
    isRefreshing,
    error,
    isForbidden,
    refresh,
  } = useDepartments();

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

  const openDepartment = (id) =>
    navigation.navigate(ROUTES.MAIN.DEPARTMENT_DETAIL, { departmentId: id });

  const renderEmpty = () => {
    if (isLoading) return null;

    return (
      <View style={styles.centred}>
        <Text style={styles.emptyTitle}>
          {status ? 'No matching departments' : 'No departments yet'}
        </Text>
        <Text style={styles.emptyBody}>
          {status
            ? 'Try clearing the filter to see all departments.'
            : 'Departments you create will appear here. Employees and teams are then assigned to them.'}
        </Text>
        {status ? (
          <Button
            title="Clear filter"
            onPress={() => toggleStatus(status)}
            variant="secondary"
            fullWidth={false}
          />
        ) : null}
      </View>
    );
  };

  return (
    <Screen scrollable={false} padded={false}>
      <View style={styles.header}>
        <Button
          title="Back"
          icon="chevron-back"
          onPress={() => navigation.goBack()}
          variant="text"
          fullWidth={false}
        />
        <Button
          title="New"
          icon="add"
          onPress={() => navigation.navigate(ROUTES.MAIN.CREATE_DEPARTMENT)}
          variant="text"
          fullWidth={false}
        />
      </View>

      <View style={styles.titleRow}>
        <Text style={styles.title}>Departments</Text>
        <Text style={styles.count}>
          {isLoading
            ? 'Loading…'
            : `${departments.length} of ${totalCount} shown`}
        </Text>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filterScroll}
        contentContainerStyle={styles.filterRow}
      >
        {Object.values(DEPARTMENT_STATUS).map((value) => (
          <Chip
            key={value}
            label={value === DEPARTMENT_STATUS.ACTIVE ? 'Active' : 'Inactive'}
            selected={status === value}
            onPress={() => toggleStatus(value)}
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
        <Loader message="Loading departments…" />
      ) : (
        <FlatList
          data={departments}
          keyExtractor={(item) => item._id ?? item.code}
          renderItem={({ item }) => (
            <DepartmentCard
              department={item}
              onPress={item._id ? () => openDepartment(item._id) : undefined}
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
