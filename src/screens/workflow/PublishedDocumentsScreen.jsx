import { useCallback, useMemo, useRef } from 'react';
import { FlatList, RefreshControl, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';

import { Button } from '@components/common/Button';
import { ErrorBanner } from '@components/common/ErrorBanner';
import { Loader } from '@components/common/Loader';
import { Screen } from '@components/layout/Screen';
import { WorkflowCard } from '@components/workflow/WorkflowCard';
import { useMySubmissions } from '@hooks/useMySubmissions';
import { ROUTES } from '@navigation/routes';
import { WORKFLOW_STATUS } from '@validation/workflow';

import { styles } from '@theme/styles/WorkflowListScreen.styles';

/**
 * There's no GET /document (list) or GET /workflow/all route documented
 * anywhere — see DOCUMENT_MANAGEMENT.md's own note on this. The only place
 * a published document can honestly be read from is GET /workflow/my-
 * submissions, filtered to COMPLETED (the terminal, published state — see
 * @validation/workflow's header comment). So this is "documents I submitted
 * that are now published," not an org-wide published library, because no
 * endpoint exists for the latter.
 */
export function PublishedDocumentsScreen({ navigation }) {
  const { workflows, isLoading, isRefreshing, error, isForbidden, refresh } =
    useMySubmissions();

  const published = useMemo(
    () => workflows.filter((workflow) => workflow.status === WORKFLOW_STATUS.COMPLETED),
    [workflows]
  );

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
        <Text style={styles.emptyTitle}>Nothing published yet</Text>
        <Text style={styles.emptyBody}>
          Your submissions appear here once they've been approved all the way
          through and published.
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
        <Text style={styles.title}>Published documents</Text>
        <Text style={styles.count}>
          {isLoading ? 'Loading…' : `${published.length} shown`}
        </Text>
      </View>
      <Text style={styles.subtitle}>
        Your own submissions that have completed review and been published.
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
        <Loader message="Loading published documents…" />
      ) : (
        <FlatList
          data={published}
          keyExtractor={(item, index) => item._id ?? String(index)}
          renderItem={({ item }) => (
            <WorkflowCard
              workflow={item}
              onPress={() =>
                navigation.navigate(ROUTES.MAIN.WORKFLOW_DETAIL, {
                  workflow: item,
                  origin: 'published',
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
