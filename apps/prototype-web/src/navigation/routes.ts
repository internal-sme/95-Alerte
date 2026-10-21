import { ComponentsScreen } from "@/demo/ComponentsScreen";
import { DemoSheetContent } from "@/demo/DemoSheetContent";
import { FiltersSheet } from "@/filters/FiltersSheet";
import { SortSheet } from "@/filters/SortSheet";
import { MapLegendSheet } from "@/map/MapLegendSheet";
import { MapStyleSheet } from "@/map/MapStyleSheet";
import { ActivityScreen } from "@/screens/activity/ActivityScreen";
import { AlertsScreen } from "@/screens/alerts/AlertsScreen";
import { VerifyIdentityScreen } from "@/screens/auth/VerifyIdentityScreen";
import { AlertDetail } from "@/screens/detail/AlertDetail";
import { AlertMenuSheet } from "@/screens/detail/AlertMenuSheet";
import { EmergencyScreen } from "@/screens/detail/EmergencyScreen";
import { FollowSheet } from "@/screens/detail/FollowSheet";
import { PhotoViewer } from "@/screens/detail/PhotoViewer";
import { ShareSheet } from "@/screens/detail/ShareSheet";
import { SignInSheet } from "@/screens/detail/SignInSheet";
import { TimelineSheet } from "@/screens/detail/TimelineSheet";
import { SIGN_IN_REASONS } from "@/screens/detail/detail";
import { MapScreen } from "@/screens/home/MapScreen";
import { CommuneScreen } from "@/screens/onboarding/CommuneScreen";
import { LocationHelpSheet } from "@/screens/onboarding/LocationHelpSheet";
import { LocationWhySheet } from "@/screens/onboarding/LocationWhySheet";
import { ProfileScreen } from "@/screens/profile/ProfileScreen";
import { GallerySheet } from "@/screens/report/GallerySheet";
import { ReportScreen } from "@/screens/report/ReportScreen";
import { SearchScreen } from "@/screens/search/SearchScreen";
import { routeAlert } from "@/utils/index";

export const TAB_SCREENS = { map: MapScreen, alerts: AlertsScreen, activity: ActivityScreen, profile: ProfileScreen };

export const STACK_SCREENS = {
  report: { component: ReportScreen, modal: true },
  components: { component: ComponentsScreen },
  "verify-identity": { component: VerifyIdentityScreen, modal: true },
  commune: { component: CommuneScreen, modal: true },
  search: { component: SearchScreen, modal: true },
  alert: { component: AlertDetail, modal: true },
  emergency: { component: EmergencyScreen, modal: true },
  "photo-viewer": { component: PhotoViewer, modal: true },
};

export const SHEETS = { "demo-sheet": { title: "Exemple de bottom sheet", component: DemoSheetContent }, "map-legend": { title: "Comprendre la carte", component: MapLegendSheet }, "map-filters": { title: "Filtres", component: FiltersSheet }, "list-sort": { title: "Trier par", component: SortSheet }, "location-help": { title: "Activer la localisation", component: LocationHelpSheet }, "location-why": { title: "Comment ma position est utilisée", component: LocationWhySheet },
  "map-style": { title: "Fond de carte", component: MapStyleSheet },
  "report-gallery": { title: "Choisir dans la galerie", component: GallerySheet },
  "alert-timeline": { title: "Suivi du traitement", subtitle: (p, st) => { const a = st.alerts.find((x) => x.id === p.id); return a ? routeAlert(a).name : null; }, component: TimelineSheet },
  follow: { title: "Être prévenu ?", subtitle: (p, st) => (st.follows[p.id] ? "Vous suivez cette alerte" : "Choisissez ce qui vous sera notifié"), component: FollowSheet },
  "sign-in": { title: (p) => SIGN_IN_REASONS[p.reason || "vote"].title, component: SignInSheet },
  share: { title: "Partager l'alerte", component: ShareSheet },
  "alert-menu": { title: "Options", component: AlertMenuSheet },
};
