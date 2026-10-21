import { Button } from "@/components/Button";
import { FOLLOW_TOAST } from "@/screens/detail/detail";
import { useActions, useStore } from "@/store/store";
import type { Alert } from "@/types";

export interface FollowButtonProps {
  alert: Alert;
}

export function FollowButton({ alert }: FollowButtonProps) {
  const { state, dispatch } = useStore();
  const { openSheet, toast } = useActions();
  const level = state.follows[alert.id];
  const onClick = () => {
    if (!state.session.user) { openSheet("sign-in", { reason: "follow" }); return; }
    if (level || !state.prefs.followAsked) { openSheet("follow", { id: alert.id }); return; }
    const next = state.prefs.followLevel || "all";
    dispatch({ type: "FOLLOW", alertId: alert.id, level: next });
    toast(FOLLOW_TOAST[next]);
  };
  return (
    <Button variant="secondary" icon={level === "none" ? "bell-slash" : level ? "bell-ringing-fill" : "bell"} aria-pressed={!!level} onClick={onClick} disabled={state.demo.offline}>
      {level ? "Suivie" : "Suivre"}
    </Button>
  );
}
