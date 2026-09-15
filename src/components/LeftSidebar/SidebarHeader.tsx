import { useLanguage } from "../../context/LanguageContext";
/**
 * SidebarHeader Component
 *
 * Header section with app title and description.
 */

import { STYLES } from "./constants";

/**
 * SidebarHeader - App title and tagline
 *
 * Displays the application name and brief description
 * at the top of the sidebar.
 *
 * @example
 * <SidebarHeader />
 */
export const SidebarHeader = () => {
  const { t } = useLanguage();
  return (
  <div className={STYLES.header}>
    <h1 className="text-lg font-semibold">{t("AppShots Editor")}</h1>
    <p className="text-xs text-gray-400 mt-1">
      {t("Create App Store and Google Play screenshots")}</p>
  </div>
);
};
