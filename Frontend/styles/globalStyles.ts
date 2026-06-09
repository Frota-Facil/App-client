import { StyleSheet, ViewStyle } from 'react-native';
import { colors } from '../constants/colors';

export const SCREEN_PADDING = 20;
export const CARD_RADIUS = 16;
export const CARD_PADDING = 16;
export const CARD_SPACING = 12;
export const CARD_BORDER_COLOR = colors.border;

const pageContainer: ViewStyle = {
  flex: 1,
  backgroundColor: colors.background,
};

const screenContent: ViewStyle = {
  paddingHorizontal: SCREEN_PADDING,
};

export const baseCard: ViewStyle = {
  backgroundColor: colors.surface,
  borderRadius: CARD_RADIUS,
  padding: CARD_PADDING,
  borderWidth: 1,
  borderColor: CARD_BORDER_COLOR,
  shadowColor: "#000000",
  shadowOffset: { width: 0, height: 0 },
  shadowOpacity: 0,
  shadowRadius: 0,
  elevation: 0,
};

export const styles = StyleSheet.create({
  // ROOT
  pageContainer,

  root: pageContainer,

  body: {
    flex: 1,
  },

  screenContent,

  bodyContent: {
    ...screenContent,
    paddingTop: 16,
  },

  baseCard,

  cardBase: baseCard,

  cardSpacing: {
    marginBottom: CARD_SPACING,
  },

  // ───────── HEADER ─────────
  header: {
    backgroundColor: colors.primary,
    padding: SCREEN_PADDING,
    paddingTop: 15,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },

  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },

  headerSubtitle: {
    color: '#C7D2FE',
    fontSize: 12,
  },

  headerName: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },

  heroText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 20,
    lineHeight: 30,
  },

  // ───────── AVATAR ─────────
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#274C77',
    justifyContent: 'center',
    alignItems: 'center',
  },

  avatarText: {
    color: '#fff',
    fontWeight: 'bold',
  },

  // ───────── BUTTON ─────────
  ctaButton: {
    marginTop: 20,
    backgroundColor: '#F59E0B',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },

  ctaText: {
    color: '#fff',
    fontWeight: 'bold',
  },

  // ───────── BADGE ─────────
  bellWrapper: {
    position: 'relative',
  },

  badge: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: colors.danger,
    borderRadius: 10,
    paddingHorizontal: 5,
    paddingVertical: 2,
  },

  badgeText: {
    color: '#fff',
    fontSize: 10,
  },

  // ───────── ALERT CARD ─────────
  alertCard: {
    ...baseCard,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: CARD_SPACING,
  },

  alertIcon: {
    marginRight: 10,
  },

  alertText: {
    flex: 1,
  },

  alertTitle: {
    fontWeight: 'bold',
    color: colors.textPrimary,
  },

  alertSubtitle: {
    color: colors.textSecondary,
    fontSize: 12,
  },

  // ───────── SECTION ─────────
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 10,
  },

  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },

  sectionLink: {
    color: colors.primary,
    fontSize: 12,
  },

  // ───────── VEHICLE CARD ─────────
  vehicleCard: {
    ...baseCard,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: CARD_SPACING,
  },

  vehicleCardImageWrapper: {
    width: 66,
    height: 50,
    borderRadius: 14,
    backgroundColor: "#F3F4F6",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },

  vehicleCardImage: {
    width: 58,
    height: 38,
  },

  vehicleInfo: {
    flex: 1,
    marginRight: 10,
  },

  vehicleName: {
    fontWeight: 'bold',
    color: colors.textPrimary,
  },

  vehiclePlate: {
    color: colors.textSecondary,
    fontSize: 12,
  },

  vehicleStatusBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
  },

  vehicleStatusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 5,
  },

  vehicleStatusText: {
    fontSize: 12,
    fontWeight: "600",
  },

  requestCard: {
    ...baseCard,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: CARD_SPACING,
  },

  availableBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
  },

  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.success,
    marginRight: 5,
  },

  availableText: {
    color: colors.success,
    fontSize: 12,
  },

    // ───────── TRIP CARD ─────────
  tripGroupHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 8,
    marginBottom: 6,
  },

  tripGroupTitle: {
    color: colors.textSecondary,
    fontSize: 13,
    fontWeight: "bold",
  },

  tripGroupCount: {
    color: colors.textSecondary,
    fontSize: 13,
  },

  tripCard: {
    ...baseCard,
    marginBottom: CARD_SPACING,
  },

  tripTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },

  tripTitleArea: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },

  tripLocationIcon: {
    marginRight: 6,
  },

  tripDestination: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: "bold",
    flex: 1,
  },

  tripStatusBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    marginLeft: 8,
  },

  tripStatusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 5,
  },

  tripStatusText: {
    fontSize: 12,
    fontWeight: "bold",
  },

  tripInfoRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 10,
  },

  tripInfoItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },

  tripInfoText: {
    color: colors.textSecondary,
    fontSize: 12,
  },

  // ───────── VEHICLES PAGE ─────────
  vehicleSearchArea: {
    ...screenContent,
    marginTop: 10,
  },

  vehicleSearchInputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surface,
    borderRadius: CARD_RADIUS,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: CARD_BORDER_COLOR,
  },

  vehicleSearchIcon: {
    width: 18,
    height: 18,
    tintColor: "#9CA3AF",
    marginRight: 8,
  },

  vehicleSearchInput: {
    flex: 1,
    fontSize: 14,
    color: "#111827",
  },

  vehicleList: {
    flex: 1,
    marginTop: 10,
  },

  vehicleGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },

  vehicleGridCard: {
    ...baseCard,
    width: "48%",
    marginBottom: CARD_SPACING,
  },

  vehicleGridImage: {
    backgroundColor: "#F3F4F6",
    borderRadius: 12,
    height: 80,
    justifyContent: "center",
    alignItems: "center",
  },

  vehicleGridImageAsset: {
    width: "88%",
    height: 66,
  },

  vehicleGridName: {
    fontWeight: "bold",
    marginTop: 10,
    color: colors.textPrimary,
  },

  vehicleGridPlate: {
    fontSize: 12,
    color: "#6B7280",
  },

  vehicleGridStatus: {
    marginTop: 8,
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },

  vehicleGridStatusText: {
    fontSize: 12,
  },

  vehicleModalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: SCREEN_PADDING,
    backgroundColor: "rgba(13, 27, 42, 0.62)",
  },

  vehicleModalBackdrop: {
    ...StyleSheet.absoluteFillObject,
  },

  vehicleModalCard: {
    width: "100%",
    maxWidth: 380,
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: CARD_BORDER_COLOR,
    shadowColor: "#0D1B2A",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 6,
  },

  vehicleModalImageWrapper: {
    minHeight: 150,
    borderRadius: 16,
    backgroundColor: "#F3F4F6",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },

  vehicleModalImage: {
    width: 220,
    height: 130,
  },

  vehicleModalDetails: {
    borderTopWidth: 1,
    borderTopColor: CARD_BORDER_COLOR,
    paddingTop: 8,
  },

  vehicleModalDetailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
    gap: 12,
  },

  vehicleModalDetailLabel: {
    color: colors.textSecondary,
    fontSize: 13,
  },

  vehicleModalDetailValue: {
    color: colors.textPrimary,
    flex: 1,
    fontSize: 14,
    fontWeight: "600",
    textAlign: "right",
  },

  vehicleModalRequestButton: {
    width: "100%",
    height: 52,
    backgroundColor: "#F59E0B",
    borderRadius: 18,
    marginTop: 16,
    alignItems: "center",
    justifyContent: "center",
  },

  vehicleModalRequestButtonText: {
    color: "#0D1B2A",
    fontSize: 15,
    fontWeight: "700",
  },

  vehicleModalFooterButton: {
    backgroundColor: "#E5E7EB",
    borderRadius: 18,
    height: 52,
    marginTop: 10,
    alignItems: "center",
    justifyContent: "center",
  },

  vehicleModalFooterButtonText: {
    color: colors.textPrimary,
    fontSize: 14,
    fontWeight: "bold",
  },

  // ───────── TAB BAR ─────────
  tabBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    borderTopWidth: 1,
    borderColor: colors.border,
  },

  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },

  tabLabel: {
    fontSize: 10,
    color: colors.textMuted,
  },

  tabLabelActive: {
    color: '#F59E0B',
    fontWeight: 'bold',
  },
  backIcon: {
  width: 20,
  height: 20,
  marginLeft: 5,
  marginRight: 10,
},

  // ───────── NOTIFICATIONS PAGE ─────────
  notificationsHeader: {
    height: 60,
    paddingHorizontal: SCREEN_PADDING,
    paddingVertical: 18,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  notificationsHeaderLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },

  notificationsHeaderTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#111827",
  },

  markAllText: {
    fontSize: 13,
    fontWeight: "bold",
    color: colors.primary,
  },

  notificationFiltersArea: {
    backgroundColor: "#FFFFFF",
    paddingTop: 14,
    paddingBottom: 8,
  },

  notificationFiltersContent: {
    paddingHorizontal: SCREEN_PADDING,
    gap: 8,
  },

  notificationFilterButton: {
    paddingHorizontal: 18,
    paddingVertical: 9,
    borderRadius: 22,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    marginRight: 8,
  },

  notificationFilterButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },

  notificationFilterText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#6B7280",
  },

  notificationFilterTextActive: {
    color: "#FFFFFF",
  },

  notificationsListContent: {
    ...screenContent,
    paddingTop: 16,
  },

  notificationCard: {
    ...baseCard,
    marginBottom: CARD_SPACING,
    flexDirection: "row",
    alignItems: "flex-start",
  },

  notificationIconWrapper: {
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
  },

  notificationIconText: {
    fontSize: 18,
    fontWeight: "bold",
  },

  notificationContent: {
    flex: 1,
  },

  notificationTitle: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#111827",
    marginBottom: 3,
  },

  notificationMessage: {
    fontSize: 15,
    color: "#4B5563",
    lineHeight: 20,
  },

  notificationDate: {
    fontSize: 12,
    color: "#6B7280",
    marginTop: 6,
  },
});
