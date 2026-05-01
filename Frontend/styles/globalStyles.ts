import { StyleSheet } from 'react-native';
import { colors } from '../constants/colors';

export const styles = StyleSheet.create({
  // ROOT
  root: {
    flex: 1,
    backgroundColor: colors.background,
    
    

  },

  body: {
    flex: 1,
  },

  bodyContent: {
    padding: 16,
    paddingBottom: 100,
  },

  // ───────── HEADER ─────────
  header: {
    backgroundColor: colors.primary,
    padding: 20,
    paddingTop: 40,
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
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 12,
    margin: 12,
    marginLeft: 20,
    marginRight: 20,
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
    marginLeft: 10,
  },

  sectionLink: {
    color: colors.primary,
    fontSize: 12,
  },

  // ───────── VEHICLE CARD ─────────
  vehicleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 14,
    borderRadius: 12,
    margin: 10,
    marginLeft: 20,
    marginRight: 20,
  },

  vehicleInfo: {
    flex: 1,
    marginLeft: 10,
  },

  vehicleName: {
    fontWeight: 'bold',
    color: colors.textPrimary,
  },

  vehiclePlate: {
    color: colors.textSecondary,
    fontSize: 12,
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

  // ───────── TAB BAR ─────────
  tabBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 10,
    borderTopWidth: 1,
    borderColor: colors.border,
    marginBottom: 45,
    
  },

  backblack:{
    width: 'auto',
    height:  50,
    backgroundColor: "#000"
  },

  tabItem: {
    alignItems: 'center',
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
});