import { useState } from 'react';
import { Text, View } from 'react-native';

import { Badge } from '@components/common/Badge';
import { Button } from '@components/common/Button';
import { ConfirmDialog } from '@components/common/ConfirmDialog';
import { ErrorBanner } from '@components/common/ErrorBanner';
import { Screen } from '@components/layout/Screen';
import { useToast } from '@context/ToastContext';
import { useResubmitWorkflow } from '@hooks/useResubmitWorkflow';
import { useReviewWorkflow } from '@hooks/useReviewWorkflow';
import { formatDate } from '@utils/format';
import {
  WORKFLOW_STATUS,
  documentRefLabel,
  employeeRefLabel,
  workflowLevelLabel,
  workflowStatusLabel,
  workflowStatusTone,
} from '@validation/workflow';

import { styles } from '@theme/styles/WorkflowDetailScreen.styles';

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

export function WorkflowDetailScreen({ navigation, route }) {
  const { workflow, origin } = route.params ?? {};
  const toast = useToast();

  const {
    submit: review,
    isSubmitting: isReviewing,
    error: reviewError,
    clearMessages: clearReviewError,
  } = useReviewWorkflow();

  const {
    submit: resubmit,
    isSubmitting: isResubmitting,
    error: resubmitError,
  } = useResubmitWorkflow();

  const [isConfirmingReject, setIsConfirmingReject] = useState(false);

  if (!workflow) {
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
          <Text style={styles.emptyTitle}>Workflow not found</Text>
          <Text style={styles.emptyBody}>
            This record may have been removed since the list was loaded.
          </Text>
        </View>
      </Screen>
    );
  }

  const title = documentRefLabel(workflow.document) ?? 'Untitled document';
  const documentType = workflow.document?.documentType || null;
  const status = workflowStatusLabel(workflow.status);
  const level = workflowLevelLabel(workflow.currentLevel);
  const reviewer = employeeRefLabel(workflow.currentReviewer);
  const owner = employeeRefLabel(workflow.owner ?? workflow.document?.owner);
  const lastAction = workflow.lastAction
    ? workflowStatusLabel(workflow.lastAction) || workflow.lastAction
    : null;

  // 0/undefined render as the "none yet" fallback rather than a literal "0" —
  // WORKFLOW_MODULE.md §17/§25 note these fields aren't populated in every state.
  const reminderCount = workflow.reminderCount ? String(workflow.reminderCount) : null;
  const escalationCount = workflow.escalationCount ? String(workflow.escalationCount) : null;
  const isEscalatedToSuperAdmin =
    workflow.currentLevel === 'SUPER_ADMIN' && Boolean(escalationCount);

  const canReview =
    origin === 'pending' && workflow.status === WORKFLOW_STATUS.PENDING_REVIEW;
  const canResubmit =
    origin === 'submissions' && workflow.status === WORKFLOW_STATUS.REVISION;

  const handleReview = async (action, successMessage) => {
    const updated = await review(workflow._id, action);

    if (updated) {
      toast.success(successMessage);
      navigation.goBack();
    }
  };

  const handleReject = async () => {
    const updated = await review(workflow._id, 'REJECT');

    setIsConfirmingReject(false);

    if (updated) {
      toast.success('Document rejected.');
      navigation.goBack();
    }
  };

  const handleResubmit = async () => {
    const updated = await resubmit(workflow._id);

    if (updated) {
      toast.success('Document resubmitted for review.');
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
            {title}
          </Text>
          <Badge label={status || '—'} tone={workflowStatusTone(workflow.status)} />
        </View>
        {documentType ? <Text style={styles.code}>{documentType}</Text> : null}
      </View>

      <Text style={styles.sectionLabel}>Workflow</Text>
      <View style={styles.section}>
        <Row label="Current level" value={level} fallback="None" />
        <Row label="Current reviewer" value={reviewer} fallback="None" divider />
        <Row label="Submitted by" value={owner} fallback="Unknown" divider />
        <Row label="Last action" value={lastAction} divider />
      </View>
      {isEscalatedToSuperAdmin ? (
        <Text style={styles.note}>
          Escalated to Super Admin after no response from the Executive
          reviewer.
        </Text>
      ) : null}

      <Text style={styles.sectionLabel}>Dates</Text>
      <View style={styles.section}>
        <Row
          label="Submitted"
          value={formatDate(workflow.submittedAt)}
          fallback="Not submitted"
        />
        <Row
          label="Reviewed"
          value={formatDate(workflow.reviewedAt)}
          fallback="Not yet reviewed"
          divider
        />
      </View>

      <Text style={styles.sectionLabel}>Reminders &amp; escalation</Text>
      <View style={styles.section}>
        <Row
          label="Reminders sent"
          value={reminderCount}
          fallback="None yet"
        />
        <Row
          label="Last reminder"
          value={formatDate(workflow.lastReminderAt)}
          fallback="Not sent"
          divider
        />
        <Row
          label="Escalations"
          value={escalationCount}
          fallback="Not escalated"
          divider
        />
        <Row
          label="Escalated at"
          value={formatDate(workflow.escalatedAt)}
          fallback="Not escalated"
          divider
        />
      </View>
      <Text style={styles.note}>
        Reminders and escalation run automatically on the backend — there's
        nothing to trigger here, this is a read-only record of what already
        happened.
      </Text>

      {canReview ? (
        <View style={styles.actionBlock}>
          <ErrorBanner message={reviewError} />

          <Button
            title="Approve"
            onPress={() => handleReview('APPROVE', 'Document approved.')}
            loading={isReviewing}
            disabled={isReviewing}
            style={styles.action}
          />
          <Button
            title="Return for revision"
            onPress={() =>
              handleReview('RETURN', 'Document returned for revision.')
            }
            loading={isReviewing}
            disabled={isReviewing}
            variant="secondary"
            style={styles.action}
          />
          <Button
            title="Reject"
            onPress={() => {
              clearReviewError();
              setIsConfirmingReject(true);
            }}
            disabled={isReviewing}
            variant="danger"
          />
        </View>
      ) : null}

      {canResubmit ? (
        <View style={styles.actionBlock}>
          <ErrorBanner message={resubmitError} />

          <Button
            title="Resubmit"
            onPress={handleResubmit}
            loading={isResubmitting}
            disabled={isResubmitting}
            style={styles.action}
          />
          <Text style={styles.statusHint}>
            Editing the document before resubmitting isn't available in this
            app yet — this resubmits it as-is, starting again from your Team
            Lead.
          </Text>
        </View>
      ) : null}

      <ConfirmDialog
        visible={isConfirmingReject}
        title="Reject this document?"
        message="The review process ends immediately and cannot be undone. The owner will need to create a new submission."
        confirmLabel="Reject"
        confirmVariant="danger"
        onConfirm={handleReject}
        onCancel={() => setIsConfirmingReject(false)}
        isBusy={isReviewing}
      />
    </Screen>
  );
}
