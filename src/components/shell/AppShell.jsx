import { useState } from 'react';
import { Modal, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useBreakpoint } from '@hooks/useBreakpoint';

import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';

import { styles } from '@theme/styles/AppShell.styles';

// The console chrome: a permanent rail on laptop widths, a dismissible drawer
// below 900px. The content column stays transparent so the canvas shows through.
export function AppShell({
  activeKey,
  onNavigate,
  email,
  name,
  role,
  onProfilePress,
  children,
}) {
  const { isCompact } = useBreakpoint();

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  const closeDrawer = () => setIsDrawerOpen(false);

  const navigate = (item) => {
    closeDrawer();
    onNavigate?.(item);
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <View style={styles.row}>
        {isCompact ? null : (
          <Sidebar
            activeKey={activeKey}
            onNavigate={navigate}
            isCollapsed={isCollapsed}
            onToggleCollapse={() => setIsCollapsed((value) => !value)}
          />
        )}

        <View style={styles.main}>
          <TopBar
            isCompact={isCompact}
            email={email}
            name={name}
            role={role}
            onOpenMenu={() => setIsDrawerOpen(true)}
            onProfilePress={onProfilePress}
          />

          <ScrollView
            style={styles.flex}
            contentContainerStyle={[
              styles.content,
              isCompact && styles.contentCompact,
            ]}
            keyboardShouldPersistTaps="handled"
          >
            {children}

            <View style={styles.footer}>
              <Text style={styles.footerText}>
                © 2026 Syandrix Infotech. All rights reserved.
              </Text>
              <Text style={styles.footerText}>Version 1.0.0</Text>
            </View>
          </ScrollView>
        </View>
      </View>

      <Modal
        visible={isCompact && isDrawerOpen}
        transparent
        animationType="fade"
        onRequestClose={closeDrawer}
      >
        <View style={styles.drawerRow}>
          <SafeAreaView style={styles.drawer} edges={['top', 'bottom']}>
            <Sidebar
              activeKey={activeKey}
              onNavigate={navigate}
              onDismiss={closeDrawer}
              isOverlay
            />
          </SafeAreaView>

          <Pressable
            style={styles.scrim}
            onPress={closeDrawer}
            accessibilityRole="button"
            accessibilityLabel="Close menu"
          />
        </View>
      </Modal>
    </SafeAreaView>
  );
}
