import { theme } from '@theme';

/**
 * Placeholder content for the dashboard shell.
 *
 * Nothing here comes from the API. It exists so the layout can be judged at
 * full density before any endpoint is wired, and it is deliberately kept in
 * one file: HomeScreen passes these down as props and every panel below is a
 * pure presentational component, so swapping in real data means changing what
 * HomeScreen passes and nothing else.
 */

export const STAT_CARDS = [
  {
    key: 'total-documents',
    icon: 'document-text-outline',
    tone: 'info',
    value: '128',
    label: 'Total Documents',
    linkLabel: 'View all documents',
  },
  {
    key: 'pending-approvals',
    icon: 'checkmark-done-outline',
    tone: 'success',
    value: '24',
    label: 'Pending Approvals',
    linkLabel: 'View pending',
  },
  {
    key: 'strategic-ideas',
    icon: 'bulb-outline',
    tone: 'accent',
    value: '15',
    label: 'Strategic Ideas',
    linkLabel: 'View ideas',
  },
  {
    key: 'escalations',
    icon: 'trending-up-outline',
    tone: 'primary',
    value: '7',
    label: 'Escalations',
    linkLabel: 'View escalations',
  },
];

/**
 * Seven segments drawn entirely from the Bureau palette, ordered so adjacent
 * stages never share a hue.
 */
export const DOCUMENT_STATUS = {
  total: '128',
  segments: [
    { key: 'draft', label: 'Draft', count: 24, share: '18.75%', color: theme.colors.textMuted },
    { key: 'submitted', label: 'Submitted', count: 18, share: '14.06%', color: theme.colors.info },
    { key: 'under-review', label: 'Under Review', count: 22, share: '17.19%', color: theme.colors.accent },
    { key: 'approved', label: 'Approved', count: 30, share: '23.44%', color: theme.colors.success },
    { key: 'published', label: 'Published', count: 20, share: '15.63%', color: theme.colors.primary },
    { key: 'active', label: 'Active', count: 8, share: '6.25%', color: theme.colors.accentBright },
    { key: 'archived', label: 'Archived', count: 6, share: '4.69%', color: theme.colors.spine.neutral },
  ],
};

export const APPROVAL_FLOW = [
  { key: 'team-lead', label: 'Team Lead', value: 38 },
  { key: 'manager', label: 'Manager', value: 28 },
  { key: 'dept-head', label: 'Dept. Head', value: 22 },
  { key: 'executive', label: 'Executive', value: 16 },
  { key: 'governance', label: 'Governance', value: 8 },
];

export const QUICK_ACTIONS = [
  { key: 'create-document', label: 'Create Document', icon: 'add-circle-outline', tone: 'info' },
  { key: 'submit-idea', label: 'Submit Strategic Idea', icon: 'bulb-outline', tone: 'accent' },
  { key: 'my-approvals', label: 'My Pending Approvals', icon: 'checkmark-done-outline', tone: 'success' },
  { key: 'escalations', label: 'View Escalations', icon: 'trending-up-outline', tone: 'primary' },
  { key: 'audit-logs', label: 'Audit Logs', icon: 'list-outline', tone: 'neutral' },
];

export const RECENT_DOCUMENTS = [
  {
    key: 'ai-automation-policy',
    title: 'AI Automation Policy',
    type: 'Policy',
    stage: 'Under Review',
    tone: 'accent',
    updatedAt: '2 hours ago',
  },
  {
    key: 'data-security-standards',
    title: 'Data Security Standards',
    type: 'Standard',
    stage: 'Approved',
    tone: 'success',
    updatedAt: '5 hours ago',
  },
  {
    key: 'employee-onboarding',
    title: 'Employee Onboarding Process',
    type: 'Procedure',
    stage: 'Submitted',
    tone: 'info',
    updatedAt: '1 day ago',
  },
  {
    key: 'it-infrastructure',
    title: 'IT Infrastructure Guidelines',
    type: 'Guideline',
    stage: 'Published',
    tone: 'neutral',
    updatedAt: '2 days ago',
  },
  {
    key: 'remote-work-policy',
    title: 'Remote Work Policy',
    type: 'Policy',
    stage: 'Draft',
    tone: 'neutral',
    updatedAt: '3 days ago',
  },
];

export const IDEAS_PIPELINE = [
  {
    key: 'classification',
    title: 'AI Based Document Classification',
    submittedBy: 'Submitted by You',
    stage: 'Manager Review',
    tone: 'accent',
  },
  {
    key: 'compliance',
    title: 'Automated Compliance Checks',
    submittedBy: 'Submitted by Team Member',
    stage: 'Dept. Head Review',
    tone: 'info',
  },
  {
    key: 'knowledge-graph',
    title: 'Knowledge Graph Implementation',
    submittedBy: 'Submitted by You',
    stage: 'Executive Review',
    tone: 'neutral',
  },
  {
    key: 'smart-search',
    title: 'Smart Search Enhancement',
    submittedBy: 'Submitted by Team Member',
    stage: 'Governance Review',
    tone: 'success',
  },
];

export const RECENT_ACTIVITY = [
  {
    key: 'approved',
    icon: 'checkmark-circle-outline',
    tone: 'success',
    title: 'Document approved',
    detail: '"Data Security Standards" approved by Department Head',
    at: '3h ago',
  },
  {
    key: 'submitted',
    icon: 'send-outline',
    tone: 'info',
    title: 'New document submitted',
    detail: '"AI Automation Policy" submitted for review',
    at: '5h ago',
  },
  {
    key: 'escalated',
    icon: 'trending-up-outline',
    tone: 'primary',
    title: 'Idea escalated',
    detail: '"Automated Compliance Checks" escalated to Executive',
    at: '1d ago',
  },
  {
    key: 'comment',
    icon: 'chatbubble-outline',
    tone: 'accent',
    title: 'New comment',
    detail: 'Comment added on "IT Infrastructure Guidelines"',
    at: '2d ago',
  },
];
