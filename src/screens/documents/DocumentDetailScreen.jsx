import { useState } from 'react';
import { Text, View } from 'react-native';

import { Badge } from '@components/common/Badge';
import { Button } from '@components/common/Button';
import { ConfirmDialog } from '@components/common/ConfirmDialog';
import { ErrorBanner } from '@components/common/ErrorBanner';
import { Screen } from '@components/layout/Screen';
import { useToast } from '@context/ToastContext';
import { useArchiveDocument } from '@hooks/useArchiveDocument';
import { useDeleteDocument } from '@hooks/useDeleteDocument';
import { useRestoreDocument } from '@hooks/useRestoreDocument';
import { useSubmitDocument } from '@hooks/useSubmitDocument';
import { useViewDocument } from '@hooks/useViewDocument';
import { formatDate } from '@utils/format';
import {
  documentStatusLabel,
  documentStatusTone,
  isPublishedStatus,
} from '@validation/document';
import { employeeRefLabel } from '@validation/workflow';

import { styles } from '@theme/styles/DocumentDetailScreen.styles';

function Row({ label, value, fallback = 'Not set', divider = false }) {
  return (
    <View style={[styles.row, divider && styles.rowDivider]}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={value ? styles.rowValue : styles.rowValueMuted}>
        {value || fallback}
      </Text>
    </View>
  );
}

/**
 * Reached from the Drafts / Published / Archived lists (GET /document, not a
 * workflow) — this has no reviewer/level/reminder history to show because
 * there's no Workflow object behind it here, just the document itself plus
 * whichever lifecycle action its current status actually allows.
 *
 * Exactly one action is offered at a time, chosen by status rather than by
 * "is it archived": a draft gets Submit, a published document gets Archive,
 * an archived one gets Restore, and a document mid-review gets none, because
 * the backend would reject every one of them.
 */
export function DocumentDetailScreen({ navigation, route }) {
  const { document } = route.params ?? {};
  const toast = useToast();

  const {
    view: viewDocument,
    isLoading: isOpeningDocument,
    error: viewError,
  } = useViewDocument();

  const {
    submit: archive,
    isSubmitting: isArchiving,
    error: archiveError,
  } = useArchiveDocument();

  const {
    submit: restore,
    isSubmitting: isRestoring,
    error: restoreError,
  } = useRestoreDocument();

  const {
    submit: submitForReview,
    isSubmitting: isSubmittingForReview,
    error: submitError,
  } = useSubmitDocument();

  const {
    submit: deleteDocument,
    isSubmitting: isDeleting,
    error: deleteError,
  } = useDeleteDocument();

  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);

  if (!document) {
    return (
      <Screen padded={false} style={styles.page}>
        <View style={styles.header}>
          <Button
            title="Back"
            icon="chevron-back"
            onPress={() => navigation.goBack()}
            variant="text"
            fullWidth={false}
          />
        </View>
        <View style={styles.centred}>
          <Text style={styles.emptyTitle}>Document not found</Text>
          <Text style={styles.emptyBody}>
            This record may have been removed since the list was loaded.
          </Text>
        </View>
      </Screen>
    );
  }

  const documentId = document._id || null;
  const isDraft = document.status === 'DRAFT';
  const isArchived = document.status === 'ARCHIVED';
  // Archiving is retiring a live document, so it is offered on exactly the
  // statuses that count as published — which is also document.service.js's
  // own archive whitelist. Offering it elsewhere is a guaranteed 400.
  const isArchivable = isPublishedStatus(document.status);
  const owner = employeeRefLabel(document.owner);
  const department = document.department?.name || null;
  const team = document.team?.name || null;

  const handleOpenDocument = () => {
    if (documentId) viewDocument(documentId);
  };

  const handleArchive = async () => {
    if (!documentId) return;

    const updated = await archive(documentId);

    if (updated) {
      toast.success('Document archived.');
      navigation.goBack();
    }
  };

  const handleRestore = async () => {
    if (!documentId) return;

    const updated = await restore(documentId);

    if (updated) {
      toast.success('Document restored.');
      navigation.goBack();
    }
  };

  const handleSubmitForReview = async () => {
    if (!documentId) return;

    const workflow = await submitForReview(documentId);

    if (workflow) {
      toast.success('Document submitted for review.');
      navigation.goBack();
    }
  };

  const handleDelete = async () => {
    if (!documentId) return;

    const deleted = await deleteDocument(documentId);

    setIsConfirmingDelete(false);

    if (deleted) {
      toast.success('Draft deleted.');
      navigation.goBack();
    }
  };

  return (
    <Screen padded={false} style={styles.page}>
      <View style={styles.header}>
        <Button
          title="Back"
          icon="chevron-back"
          onPress={() => navigation.goBack()}
          variant="text"
          fullWidth={false}
        />
      </View>

      <View style={styles.identity}>
        <View style={styles.nameRow}>
          <Text style={styles.name} numberOfLines={2}>
            {document.title || 'Untitled document'}
          </Text>
          <Badge
            label={documentStatusLabel(document.status) || '—'}
            tone={documentStatusTone(document.status)}
          />
        </View>
        {document.documentType ? (
          <Text style={styles.code}>{document.documentType}</Text>
        ) : null}
      </View>

      <View style={styles.section}>
        <ErrorBanner message={viewError} />
        <Button
          title={document.fileName ? `Open document (${document.fileName})` : 'Open document'}
          icon="document-attach-outline"
          onPress={handleOpenDocument}
          loading={isOpeningDocument}
          disabled={!documentId || isOpeningDocument}
          variant="secondary"
        />
      </View>

      <Text style={styles.sectionLabel}>Details</Text>
      <View style={styles.section}>
        <Row label="Owner" value={owner} fallback="Unknown" />
        <Row label="Department" value={department} divider />
        <Row label="Team" value={team} divider />
        <Row label="Current version" value={document.currentVersion} divider />
      </View>

      <Text style={styles.sectionLabel}>Dates</Text>
      <View style={styles.section}>
        <Row label="Created" value={formatDate(document.createdAt)} />
        <Row label="Last updated" value={formatDate(document.updatedAt)} divider />
      </View>

      <View style={styles.actionBlock}>
        <ErrorBanner
          message={submitError || deleteError || restoreError || archiveError}
        />

        {isDraft ? (
          <>
            <Button
              title="Submit for review"
              icon="send-outline"
              onPress={handleSubmitForReview}
              loading={isSubmittingForReview}
              disabled={!documentId || isSubmittingForReview}
              style={styles.action}
            />
            <Button
              title="Delete draft"
              icon="trash-outline"
              onPress={() => setIsConfirmingDelete(true)}
              disabled={!documentId || isSubmittingForReview || isDeleting}
              variant="danger"
              style={styles.action}
            />
            <Text style={styles.statusHint}>
              Submitting sends this to the next approver above you. Deleting is
              permanent and only possible while the document is still a draft —
              once submitted, it can no longer be removed.
            </Text>
          </>
        ) : isArchived ? (
          <>
            <Button
              title="Restore"
              icon="refresh-outline"
              onPress={handleRestore}
              loading={isRestoring}
              disabled={!documentId || isRestoring}
              style={styles.action}
            />
            <Text style={styles.statusHint}>
              This document is archived. Restoring it makes it active again.
            </Text>
          </>
        ) : isArchivable ? (
          <>
            <Button
              title="Archive"
              icon="archive-outline"
              onPress={handleArchive}
              loading={isArchiving}
              disabled={!documentId || isArchiving}
              variant="secondary"
              style={styles.action}
            />
            <Text style={styles.statusHint}>
              Archiving keeps this document's history but marks it inactive.
              You can restore it later from here.
            </Text>
          </>
        ) : (
          <Text style={styles.statusHint}>
            This document is {documentStatusLabel(document.status) || 'in progress'}.
            There's nothing to do here until its review finishes.
          </Text>
        )}
      </View>

      <ConfirmDialog
        visible={isConfirmingDelete}
        title="Delete this draft?"
        message="The document and its version history are removed permanently. This cannot be undone."
        confirmLabel="Delete"
        confirmVariant="danger"
        onConfirm={handleDelete}
        onCancel={() => setIsConfirmingDelete(false)}
        isBusy={isDeleting}
      />
    </Screen>
  );
}
