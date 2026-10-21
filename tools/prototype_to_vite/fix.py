# Corrections après découpage et typage des props (une liaison importée ne peut pas être réaffectée, paramètres facultatifs…)
import re, pathlib, sys
R = pathlib.Path(sys.argv[1])
def edit(path, pairs, regex=False):
    p = R / path; s = p.read_text()
    for a, b in pairs:
        if regex:
            s2 = re.sub(a, b, s); assert s2 != s, (path, a)
        else:
            assert a in s, (path, a); s2 = s.replace(a, b)
        s = s2
    p.write_text(s)

edit('map/LiveMap.tsx', [('(v, settle, bottomOverride) =>', '(v, settle?, bottomOverride?) =>'), ('(target, settle = "program", bottom) =>', '(target, settle = "program", bottom?) =>'), ('((k, at) =>', '((k, at?) =>')])
edit('map/geo.tsx', [('export function useSatellite(force)', 'export function useSatellite(force?: boolean)'), ('export function alertStatus(alert, now, showStatus)', 'export function alertStatus(alert: Alert, now: number, showStatus?: boolean)')])
edit('store/store.ts', [('push: (screen, params) =>', 'push: (screen: string, params?: Record<string, any>) =>'), ('openSheet: (sheet, params, snap) =>', 'openSheet: (sheet: string, params?: Record<string, any>, snap?: string) =>'),
                        ('toast: (text, opts = {}) =>', 'toast: (text: string, opts: Record<string, any> = {}) =>')])
for f in R.rglob('*.tsx'):
    s = f.read_text(); s2 = s.replace('useRef()', 'useRef(undefined)')
    if s2 != s: f.write_text(s2)

# État de module partagé : objets mutables
edit('map/geo.tsx', [('export let lastMapView = null;', 'export const mapMemory = { lastView: null, lastZone: null, loadedOnce: false };'),
                     ('\nexport let lastMapZone = null;\n', '\n'), ('\nexport let mapLoadedOnce = false;\n', '\n')])
s = (R/'map/geo.tsx').read_text()
if 'import type { Alert }' not in s:
    s = s.replace('import { ASSETS } from "@/assets";', 'import { ASSETS } from "@/assets";\nimport type { Alert } from "@/types";', 1); (R/'map/geo.tsx').write_text(s)
edit('map/LiveMap.tsx', [('lastMapZone === zoneKey ? lastMapView : null', 'mapMemory.lastZone === zoneKey ? mapMemory.lastView : null'), ('    lastMapView = next;', '    mapMemory.lastView = next;'), ('    lastMapZone = zoneKey;', '    mapMemory.lastZone = zoneKey;'),
                         ('mapLoadedOnce ? undefined', 'mapMemory.loadedOnce ? undefined'), ('lastMapView, lastMapZone, levelOf, mapLabels, mapLoadedOnce,', 'levelOf, mapLabels, mapMemory,')])
edit('screens/home/MapScreen.tsx', [('!mapLoadedOnce', '!mapMemory.loadedOnce'), ('mapLoadedOnce = true', 'mapMemory.loadedOnce = true'), ('mapLoadedOnce', 'mapMemory')])
edit('screens/alerts/feed.ts', [('export let feedLoadedOnce = false;', 'export const feedMemory = { loadedOnce: false };')])
edit('screens/alerts/AlertsScreen.tsx', [('!feedLoadedOnce', '!feedMemory.loadedOnce'), ('feedLoadedOnce = true', 'feedMemory.loadedOnce = true'), ('feedLoadedOnce', 'feedMemory')])
edit('screens/auth/auth.ts', [('export let splashLogoRect = null;', 'export const splashMemory = { logoRect: null };'), ('const from = splashLogoRect;', 'const from = splashMemory.logoRect;'), ('    splashLogoRect = null;', '    splashMemory.logoRect = null;')])
edit('screens/auth/LoginScreen.tsx', [('splashLogoRect !== null', 'splashMemory.logoRect !== null'), ('splashLogoRect', 'splashMemory')])
edit('screens/auth/SplashScreen.tsx', [('splashLogoRect = {', 'splashMemory.logoRect = {')])
s = (R/'screens/auth/SplashScreen.tsx').read_text()
s = re.sub(r'import \{ ([^}]*) \} from "@/screens/auth/auth";', lambda m: 'import { ' + ', '.join(sorted(set(m.group(1).split(', ') + ['splashMemory']))) + ' } from "@/screens/auth/auth";', s, count=1)
(R/'screens/auth/SplashScreen.tsx').write_text(s)

for path in ['navigation/transitions.ts', 'screens/home/MapScreen.tsx']:
    edit(path, [('import ReactDOM from "react-dom/client";', 'import { flushSync } from "react-dom";'), ('ReactDOM.flushSync(', 'flushSync(')])

edit('ErrorBoundary.tsx', [('import React from "react";', 'import React, { type ReactNode } from "react";'),
  ('export class ErrorBoundary extends React.Component {\n  constructor(props) {', 'export class ErrorBoundary extends React.Component<{ children: ReactNode }, { error: Error | null }> {\n  constructor(props: { children: ReactNode }) {'),
  ('static getDerivedStateFromError(error) {', 'static getDerivedStateFromError(error: Error) {')])

edit('data/seed.ts', [
  ('export const COMMUNES = [', 'export const COMMUNES: Commune[] = ['),
  ('export const COMMUNE_BY_ID = Object', 'export const COMMUNE_BY_ID: Record<string, Commune> = Object'),
  ('export const SERVICE_TYPES = {', 'export const SERVICE_TYPES: Record<string, ServiceType> = {'),
  ('export const CATEGORIES = [', 'export const CATEGORIES: Category[] = ['),
  ('export const CATEGORY_BY_ID = Object', 'export const CATEGORY_BY_ID: Record<string, Category> = Object'),
  ('export const USERS = {', 'export const USERS: Record<string, User> = {'),
  ('export function buildAlert(row) {', 'export function buildAlert(row: any[]): Alert {'),
  ('export const SEED_ALERTS = ', 'export const SEED_ALERTS: Alert[] = '),
  ('export const SEED_COMMENTS = {', 'export const SEED_COMMENTS: Record<string, Comment[]> = {'),
  ('export const SEED_NOTIFICATIONS = [', 'export const SEED_NOTIFICATIONS: Notification[] = ['),
  ('/* =====', 'import type { Alert, Category, Comment, Commune, Notification, ServiceType, User } from "@/types";\n\n/* ====='),
])
edit('demo/catalog.ts', [(r'\b(o|extra|params|patch) = \{\}', r'\1: Record<string, any> = {}')], regex=True)

for f in list(R.rglob('*.ts')) + list(R.rglob('*.tsx')):
    s = f.read_text(); s2 = re.sub(r'\n{3,}', '\n\n', s)
    if s2 != s: f.write_text(s2)

# Types d'appoint
edit('screens/alerts/feed.ts', [('export function feedGroups(list, sort, ctx) {', 'export function feedGroups(list: Alert[], sort: string, ctx): { t: string; items: Alert[]; all?: string }[] {'),
  ('return [["Moins de 1 km"', 'return ([["Moins de 1 km"'), ('["Au-delà de 10 km", 10, Infinity]]', '["Au-delà de 10 km", 10, Infinity]] as [string, number, number][])'),
  ('return [["Dernière heure"', 'return ([["Dernière heure"'), ('["6 à 24 h", 6 * HOUR, Infinity]]', '["6 à 24 h", 6 * HOUR, Infinity]] as [string, number, number][])'),
  ('import { HOUR } from "@/data/seed";', 'import { HOUR } from "@/data/seed";\nimport type { Alert } from "@/types";')])
edit('screens/home/MapScreen.tsx', [('document.querySelector(`.map-live', 'document.querySelector<HTMLElement>(`.map-live')])
edit('screens/report/PinMap.tsx', [('moveBy(...keys[e.key]);', 'moveBy(...(keys[e.key] as [number, number]));')])
edit('screens/search/SearchScreen.tsx', [('(fold(b.label).startsWith(nq) - fold(a.label).startsWith(nq))', '(Number(fold(b.label).startsWith(nq)) - Number(fold(a.label).startsWith(nq)))')])
edit('screens/report/report.ts', [(r'export function draftAlert\(d, now, id = "draft"\) \{', 'export function draftAlert(d: Draft, now: number, id = "draft"): Alert {')], regex=True)
s = (R/'screens/report/report.ts').read_text()
s = re.sub(r'(\n/\* =====)', '\nimport type { Alert, Draft } from "@/types";\n\\1', s, count=1); (R/'screens/report/report.ts').write_text(s)

# Carte : composant à ref (forwardRef) typé, avec ses méthodes impératives
edit('map/LiveMap.tsx', [
  ('export const LiveMap = React.forwardRef(function LiveMap({ alerts, selectedId, onSelect, zone, me, place, sheetMode, peek, loading, onViewChange, error }, ref) {',
   '''/** Rectangle visible, en km dans le repère de la carte */
export interface MapBounds { x0: number; x1: number; y0: number; y1: number }

/** Méthodes exposées par la carte (ref) */
export interface LiveMapHandle {
  recenter: () => void;
  focusAlert: (a: LatLng) => void;
  zoomBy: (k: number, at?: { x: number; y: number }) => void;
  focusPlace: (p: LatLng, scale: number) => MapBounds | null;
  bounds: () => MapBounds | null;
}

export interface LiveMapProps {
  alerts: Alert[];
  selectedId?: string | null;
  onSelect?: (id: string | null) => void;
  zone?: { center: LatLng; radiusKm: number } | null;
  me?: LatLng | null;
  place?: any;
  sheetMode?: string | number;
  peek?: number;
  loading?: boolean;
  error?: boolean;
  onViewChange?: (view: any, settle: string, center: { x: number; y: number }) => void;
}

export const LiveMap = React.forwardRef<LiveMapHandle, LiveMapProps>(function LiveMap({ alerts, selectedId, onSelect, zone, me, place, sheetMode, peek, loading, onViewChange, error }, ref) {'''),
  ('const geom = useRef({});', 'const geom = useRef<{ size?: { w: number; h: number }; bottomInset?: number }>({});'),
  ('import { cx, fmtDistance, haversineKm, motionReduced } from "@/utils/index";', 'import { cx, fmtDistance, haversineKm, motionReduced } from "@/utils/index";\nimport type { Alert, LatLng } from "@/types";'),
])

edit('navigation/BottomSheet.tsx', [('aria-label={title || "Panneau"}', 'aria-label={typeof title === "string" && title ? title : "Panneau"}')])
edit('screens/auth/SignupInfoScreen.tsx', [('    const err = {};', '    const err: Record<string, string> = {};')])

# Store typé : état global et dispatch
edit('store/store.ts', [
  ('export const StoreContext = createContext(null);', 'export interface StoreValue {\n  state: AppState;\n  dispatch: Dispatch<Action>;\n}\n\nexport const StoreContext = createContext<StoreValue>(null);'),
  ('export const ClockContext = createContext(BOOT_TIME);', 'export const ClockContext = createContext<number>(BOOT_TIME);'),
  ('export function initialState() {', 'export function initialState(): AppState {'),
  ('export function reducer(state, action) {', 'export function reducer(state: AppState, action: Action): AppState {'),
])
s = (R/'store/store.ts').read_text()
s = s.replace('import { createContext, useContext, useMemo } from "react";', 'import { createContext, useContext, useMemo, type Dispatch } from "react";\nimport type { Action, AppState } from "@/types";', 1)
(R/'store/store.ts').write_text(s)
edit('screens/auth/SignupInfoScreen.tsx', [('const [errors, setErrors] = useState({});', 'const [errors, setErrors] = useState<Record<string, string | null>>({});')])

# Caméra réelle : Permissions Policy (API Chrome, absente des types du DOM)
edit('screens/report/report.ts', [('  const policy = document.permissionsPolicy || document.featurePolicy;',
  '  const doc = document as Document & { permissionsPolicy?: { allowsFeature(feature: string): boolean }; featurePolicy?: { allowsFeature(feature: string): boolean } };\n  const policy = doc.permissionsPolicy || doc.featurePolicy;')])

# Phase 7 : statuts de commentaire typés
edit('store/store.ts', [('{ ...c, status: "deleted", body: "" }', '{ ...c, status: "deleted" as const, body: "" }')])
edit('demo/catalog.ts', [('  const mine = { ...MY_COMMENT, createdAt: Date.now() - 2 * MIN, ...patch };', '  const mine: Comment = { ...MY_COMMENT, createdAt: Date.now() - 2 * MIN, ...patch };')])
s = (R/'demo/catalog.ts').read_text()
s = s.replace('\n/* =====', '\nimport type { Comment } from "@/types";\n\n/* =====', 1); (R/'demo/catalog.ts').write_text(s)
edit('screens/comments/ReportContentScreen.tsx', [('onChange={setReason}', 'onChange={(v) => setReason(v as ReportReason)}')])
