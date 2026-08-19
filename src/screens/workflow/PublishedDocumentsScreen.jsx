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
  drafts: {
    title: 'Drafts',
    subtitle: "Documents saved but not yet submitted. Open one to submit it for review.",
    empty: 'No drafts. New documents start here.',
  },
  published: {
    title: 'Published Documents',
    subtitle: 'Documents in review, approved, or published. Drafts have their own section.',
    empty: 'Nothing here yet.',
  },
  archived: {
    title: 'Archived Documents',
    subtitle: 'Documents you can access that have been archived.',
    empty: 'Nothing archived yet.',
  },
};

/**
 * Three mutually exclusive buckets over `document.status`, so a document
 * appears in exactly one place and none can go missing:
 *
 *   drafts     DRAFT
 *   archived   ARCHIVED
 *   published  everything else
 *
 * "Published" therefore still includes the in-flight states — SUBMITTED,
 * REVIEW, REVISION, APPROVED — which is imprecise naming but deliberate:
 * narrowing it to genuinely-published statuses would leave a submitted
 * document with nowhere to be seen at all, since Drafts no longer holds it.
 * Splitting out an "In review" bucket is the obvious follow-up.
 */
const MODE_FILTERS = {
  drafts: (document) => document.status === 'DRAFT',
  archived: (document) => document.status === 'ARCHIVED',
  published: (document) =>
    document.status !== 'DRAFT' && document.status !== 'ARCHIVED',
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
 * 'drafts', 'archived', or anything else (default 'published') — rather than
 * showing several together, so each sidebar link lands on exactly what it
 * says.
 */
export function PublishedDocumentsScreen({ navigation, route }) {
  const focus = route?.params?.focus;
  const mode = MODE_FILTERS[focus] ? focus : 'published';
  const copy = MODE_COPY[mode];

  const { documents, isLoading, isRefreshing, error, isForbidden, refresh } =
    useDocuments();

  const visibleDocuments = useMemo(
    () => documents.filter(MODE_FILTERS[mode]),
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
