import { BOOT_TIME, MIN } from "@/data/seed";

/* =====================================================================
   COMPOSANTS DE BASE (CSS : docs/design-system/index.html)
   ===================================================================== */

export const commentTime = (c) => c.createdAt ?? BOOT_TIME - c.ageMin * MIN;
