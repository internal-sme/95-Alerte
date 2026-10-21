import { Icon } from "@/components/Icon";
import { TABS } from "@/navigation/constants";
import { useActions, useStore } from "@/store/store";

export function TabBar() {
  const { state } = useStore();
  const { setTab, push, setPref, openSheet } = useActions();
  return (
    <nav className="tabbar" aria-label="Navigation principale">
      {TABS.map((t) => {
        if (t.id === "report") {
          return (
            <button key={t.id} type="button" className="tab tab-report" onClick={() => { setPref("reportHintSeen", true); if (state.session.user) push("report"); else openSheet("sign-in", { reason: "report" }); }} aria-label="Signaler un événement">
              <span className="fab"><Icon name="plus" /></span>Signaler
            </button>
          );
        }
        const active = state.nav.tab === t.id;
        return (
          <button key={t.id} type="button" className="tab" aria-current={active ? "page" : undefined} onClick={() => setTab(t.id)}>
            <Icon name={active && t.id !== "alerts" ? `${t.icon}-fill` : t.icon} />{t.label}
          </button>
        );
      })}
    </nav>
  );
}
