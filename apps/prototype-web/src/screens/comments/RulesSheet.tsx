import { Fragment } from "react";
import { Icon } from "@/components/Icon";
import { COMMUNITY_RULES } from "@/screens/comments/comments";

export function RulesSheet() {
  return (
    <Fragment>
      <ul className="rules-list">
        {COMMUNITY_RULES.map(([icon, title, text]) => <li key={title}><Icon name={icon} /><span><b>{title}</b><small>{text}</small></span></li>)}
      </ul>
      <p className="sheet-lead">Les contenus qui ne respectent pas ces règles sont masqués par la modération de 95 Alerte.</p>
    </Fragment>
  );
}
