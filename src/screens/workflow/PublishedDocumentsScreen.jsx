import { useCallback, useMemo, useRef } from 'react';
import { FlatList, RefreshControl, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';

import { Button } from '@components/common/Button';
import { ErrorBanner } from '@components/common/ErrorBanner';
import { Loader } from '@components/common/Loader';
import { Screen } from '@components/layout/Screen';
import { DocumentCard } from '@components/document/DocumentCard';
import { useDocuments } from '@hooks/useDocuments';
import { ROUTES } from '@navigation/routes';

import { styles } from '@theme/styles/WorkflowListScreen.styles';

const MODE_COPY = {
  published: {
    title: 'Published Documents',
    subtitle: 'Documents you can access that are not archived.',
    empty: 'Nothing published yet.',
  },
  archived: {
    title: 'Archived Documents',
    subtitle: 'Documents you can access that have been archived.',
    empty: 'Nothing archived yet.',
  },
};

/**
 * Sourced from GET /document (DOCUMENT_MODULE_DOCUMENTATION.md §9) rather
 * than GET /workflow/my-submissions — that endpoint is inherently
 * owner-scoped ("my own submissions"), so no permission check could ever
 * make it show more than the documents this account personally authored.
 * §9 describes /document as "documents accessible to the authenticated
 * user," which is the actually-correct, ACL-driven scope this screen wants
 * — an unrestricted role like Super Admin should see every document here,
 * not just their own. That's the theory the doc states; whether the
 * backend's ACL genuinely implements it that broadly for Super Admin is
 * unverified until the first real response is observed.
 *
 * `route.params.focus` picks which single lifecycle bucket to show —
 * 'archived' or anything else (default 'published') — rather than showing
 * both together, so the sidebar's Published/Archived links (and the
 * matching dashboard panels) each land on exactly what they say.
 */
export function PublishedDocumentsScreen({ navigation, route }) {
  const mode = route?.params?.focus === 'archived' ? 'archived' : 'published';
  const copy = MODE_COPY[mode];

  const { documents, isLoading, isRefreshing, error, isForbidden, refresh } =
    useDocuments();

  const visibleDocuments = useMemo(
    () =>
      documents.filter((document) =>
        mode === 'archived' ? document.status === 'ARCHIVED' : document.status !== 'ARCHIVED'
      ),
    [documents, mode]
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
        <Text style={styles.emptyTitle}>{copy.empty}</Text>
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
        <Text style={styles.title}>{copy.title}</Text>
        <Text style={styles.count}>
          {isLoading ? 'Loading…' : `${visibleDocuments.length} shown`}
        </Text>
      </View>
      <Text style={styles.subtitle}>{copy.subtitle}</Text>

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
        <Loader message="Loading documents…" />
      ) : (
        <FlatList
          data={visibleDocuments}
          keyExtractor={(item, index) => item._id ?? String(index)}
          renderItem={({ item }) => (
            <DocumentCard
              document={item}
              onPress={() =>
                navigation.navigate(ROUTES.MAIN.DOCUMENT_DETAIL, {
                  document: item,
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
