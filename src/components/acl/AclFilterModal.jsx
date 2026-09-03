import Ionicons from '@expo/vector-icons/Ionicons';
import { Modal, Pressable, ScrollView, Text, View } from 'react-native';

import { Button } from '@components/common/Button';
import { Chip } from '@components/common/Chip';
import { Select } from '@components/common/Select';
import { theme } from '@theme';
import { ACL_EFFECT, ACL_SCOPE, ACL_SCOPE_LABELS, ACL_STATUS } from '@validation/acl';

import { styles } from '@theme/styles/AclFilterModal.styles';

export function AclFilterModal({
  visible,
  onClose,
  filters,
  toggleFilter,
  setFilter,
  clearFilters,
  activeFilterCount,
  hierarchyOptions,
  permissionOptions,
  departmentOptions,
  teamOptions,
  employeeOptions,
}) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        {/* Swallows the press so tapping inside the sheet doesn't close it. */}
        <Pressable style={styles.sheet} onPress={() => {}}>
          <View style={styles.header}>
            <Text style={styles.title}>Filters</Text>
            <Pressable
              onPress={onClose}
              accessibilityRole="button"
              accessibilityLabel="Close"
              hitSlop={10}
            >
              <Ionicons name="close" size={20} color={theme.colors.textMuted} />
            </Pressable>
          </View>

          <ScrollView style={styles.body} contentContainerStyle={styles.bodyContent}>
            <Text style={styles.groupLabel}>Status</Text>
            <View style={styles.chipRow}>
              {Object.values(ACL_STATUS).map((value) => (
                <Chip
                  key={value}
                  label={value === ACL_STATUS.ACTIVE ? 'Active' : 'Inactive'}
                  selected={filters.status === value}
                  onPress={() => toggleFilter('status', value)}
                />
              ))}
            </View>

            <Text style={styles.groupLabel}>Effect</Text>
            <View style={styles.chipRow}>
              {Object.values(ACL_EFFECT).map((value) => (
                <Chip
                  key={value}
                  label={value === ACL_EFFECT.ALLOW ? 'Allow' : 'Deny'}
                  selected={filters.effect === value}
                  onPress={() => toggleFilter('effect', value)}
                />
              ))}
            </View>

            {hierarchyOptions.length ? (
              <>
                <Text style={styles.groupLabel}>Hierarchy level</Text>
                <View style={styles.chipRow}>
                  {hierarchyOptions.map((option) => (
                    <Chip
                      key={option.value}
                      label={option.label}
                      selected={filters.hierarchyLevel === option.value}
                      onPress={() => toggleFilter('hierarchyLevel', option.value)}
                    />
                  ))}
                </View>
              </>
            ) : null}

            <Text style={styles.groupLabel}>Scope</Text>
            <View style={styles.chipRow}>
              {Object.values(ACL_SCOPE).map((value) => (
                <Chip
                  key={value}
                  label={ACL_SCOPE_LABELS[value]}
                  selected={filters.scope === value}
                  onPress={() => toggleFilter('scope', value)}
                />
              ))}
            </View>

            <View style={styles.selectGrid}>
              <View style={styles.selectGridItem}>
                <Select
                  label="Permission"
                  value={filters.permission ?? null}
                  options={permissionOptions}
                  onChange={(value) => setFilter('permission', value)}
                  placeholder="All permissions"
                  disabled={!permissionOptions.length}
                  allowClear
                />
              </View>
              <View style={styles.selectGridItem}>
                <Select
                  label="Department"
                  value={filters.department ?? null}
                  options={departmentOptions}
                  onChange={(value) => setFilter('department', value)}
                  placeholder="All departments"
                  disabled={!departmentOptions.length}
                  allowClear
                />
              </View>
              <View style={styles.selectGridItem}>
                <Select
                  label="Team"
                  value={filters.team ?? null}
                  options={teamOptions}
                  onChange={(value) => setFilter('team', value)}
                  placeholder="All teams"
                  disabled={!teamOptions.length}
                  allowClear
                />
              </View>
              <View style={styles.selectGridItem}>
                <Select
                  label="Employee"
                  value={filters.employee ?? null}
                  options={employeeOptions}
                  onChange={(value) => setFilter('employee', value)}
                  placeholder="All employees"
                  disabled={!employeeOptions.length}
                  allowClear
                />
              </View>
            </View>
          </ScrollView>

          <View style={styles.footer}>
            <Button
              title="Clear filters"
              onPress={clearFilters}
              variant="secondary"
              disabled={!activeFilterCount}
              style={styles.footerButton}
            />
            <Button
              title="Apply"
              onPress={onClose}
              style={styles.footerButton}
            />
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
