import Ionicons from '@expo/vector-icons/Ionicons';
import { useCallback, useRef, useState } from 'react';
import { FlatList, Pressable, RefreshControl, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';

import { theme } from '@theme';

import { AclCard } from '@components/acl/AclCard';
import { AclFilterModal } from '@components/acl/AclFilterModal';
import { Button } from '@components/common/Button';
import { ErrorBanner } from '@components/common/ErrorBanner';
import { Loader } from '@components/common/Loader';
import { Screen } from '@components/layout/Screen';
import { useAcls } from '@hooks/useAcls';
import { useDepartments } from '@hooks/useDepartments';
import { useEmployeeOptions } from '@hooks/useEmployeeOptions';
import { useHierarchy } from '@hooks/useHierarchy';
import { usePermissionOptions } from '@hooks/usePermissionOptions';
import { useTeams } from '@hooks/useTeams';
import { ROUTES } from '@navigation/routes';

import { styles } from '@theme/styles/AclListScreen.styles';

export function AclListScreen({ navigation }) {
  const {
    acls,
    totalCount,
    filters,
    activeFilterCount,
    toggleFilter,
    setFilter,
    clearFilters,
    isLoading,
    isRefreshing,
    error,
    isForbidden,
    refresh,
  } = useAcls();

  const { options: hierarchyOptions } = useHierarchy();
  const { options: permissionOptions } = usePermissionOptions();
  const { departments } = useDepartments();
  const { teams } = useTeams();
  const { options: employeeOptions } = useEmployeeOptions();

  const departmentOptions = departments.map((department) => ({
    value: department._id,
    label: department.name,
  }));
  const teamOptions = teams.map((team) => ({ value: team._id, label: team.name }));

  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);

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

  const openAcl = (id) => navigation.navigate(ROUTES.MAIN.ACL_DETAIL, { aclId: id });

  const renderEmpty = () => {
    if (isLoading) return null;

    return (
      <View style={styles.centred}>
        <Text style={styles.emptyTitle}>
          {activeFilterCount ? 'No matching access rules' : 'No access rules yet'}
        </Text>
        <Text style={styles.emptyBody}>
          {activeFilterCount
            ? 'Try clearing the filters to see every rule.'
            : 'With no active rule matching a request, access defaults to Deny. Rules you create here decide Allow or Deny for a hierarchy, permission, and optional scope.'}
        </Text>
        {activeFilterCount ? (
          <Button
            title="Clear filters"
            onPress={clearFilters}
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
          onPress={() => navigation.navigate(ROUTES.MAIN.CREATE_ACL)}
          variant="text"
          fullWidth={false}
        />
      </View>

      <View style={styles.titleRow}>
        <Text style={styles.title}>Access rules</Text>
        <Text style={styles.count}>
          {isLoading ? 'Loading…' : `${acls.length} of ${totalCount} shown`}
        </Text>
      </View>
      <Text style={styles.subtitle}>
        The real decision — Allow or Deny — for a hierarchy level, a
        permission, and optionally one department, team, or person. No
        matching rule means Deny by default.
      </Text>

      <Pressable
        onPress={() => setIsFilterModalOpen(true)}
        accessibilityRole="button"
        style={styles.filterToggle}
      >
        <Ionicons name="options-outline" size={16} color={theme.colors.textSecondary} />
        <Text style={styles.filterToggleLabel}>
          Filters{activeFilterCount ? ` (${activeFilterCount})` : ''}
        </Text>
      </Pressable>

      <AclFilterModal
        visible={isFilterModalOpen}
        onClose={() => setIsFilterModalOpen(false)}
        filters={filters}
        toggleFilter={toggleFilter}
        setFilter={setFilter}
        clearFilters={clearFilters}
        activeFilterCount={activeFilterCount}
        hierarchyOptions={hierarchyOptions}
        permissionOptions={permissionOptions}
        departmentOptions={departmentOptions}
        teamOptions={teamOptions}
        employeeOptions={employeeOptions}
      />

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
        <Loader message="Loading access rules…" />
      ) : (
        <FlatList
          data={acls}
          keyExtractor={(item) => item._id ?? `${item.hierarchyLevel}-${item.permission}-${item.effect}`}
          renderItem={({ item }) => (
            <AclCard acl={item} onPress={item._id ? () => openAcl(item._id) : undefined} />
          )}
          style={styles.list}
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
