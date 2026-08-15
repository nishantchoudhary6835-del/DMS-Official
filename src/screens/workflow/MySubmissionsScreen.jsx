import { useCallback, useRef } from 'react';
import { FlatList, RefreshControl, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';

import { Button } from '@components/common/Button';
import { ErrorBanner } from '@components/common/ErrorBanner';
import { Loader } from '@components/common/Loader';
import { Screen } from '@components/layout/Screen';
import { WorkflowCard } from '@components/workflow/WorkflowCard';
import { useMySubmissions } from '@hooks/useMySubmissions';
import { ROUTES } from '@navigation/routes';

import { styles } from '@theme/styles/WorkflowListScreen.styles';

export function MySubmissionsScreen({ navigation }) {
  const { workflows, isLoading, isRefreshing, error, isForbidden, refresh } =
    useMySubmissions();

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

  const renderEmpty = () => {
    if (isLoading) return null;

    return (
      <View style={styles.centred}>
        <Text style={styles.emptyTitle}>No submissions yet</Text>
        <Text style={styles.emptyBody}>
          Documents you submit for review will appear here with their current
          status and reviewer.
        </Text>
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
      </View>

      <View style={styles.titleRow}>
        <Text style={styles.title}>Submitted documents</Text>
        <Text style={styles.count}>
          {isLoading ? 'Loading…' : `${workflows.length} shown`}
        </Text>
      </View>
      <Text style={styles.subtitle}>
        Documents you've submitted for review and where each one currently
        stands.
      </Text>

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
        <Loader message="Loading submissions…" />
      ) : (
        <FlatList
          data={workflows}
          keyExtractor={(item, index) => item._id ?? String(index)}
          renderItem={({ item }) => (
            <WorkflowCard
              workflow={item}
              onPress={() =>
                navigation.navigate(ROUTES.MAIN.WORKFLOW_DETAIL, {
                  workflow: item,
                  origin: 'submissions',
                })
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
