import { useMemo } from 'react';
import { PERMISSIONS } from '@/shared/constants/permissions';

/**
 * usePermissions — resolves fine-grained permissions from a Relationship object.
 *
 * @param {object|null} relationship  — A relationship document from GET /relationships.
 *   Expected shape: { permissions: { canViewMedications: bool, canAddMedication: bool, ... } }
 *
 * @returns {object} — A stable object with:
 *   - One boolean property per canonical permission key (e.g. `canViewMedications`)
 *   - `can(key)` — helper function for dynamic lookup
 *   - `raw` — the original permissions object from the API
 *
 * Usage:
 *   const perms = usePermissions(relationship);
 *   if (perms.canEditMedication) { ... }
 *   if (perms.can(PERMISSIONS.canOrderRefills)) { ... }
 */
export function usePermissions(relationship) {
  return useMemo(() => {
    const raw = relationship?.permissions ?? {};

    // Build one boolean getter per canonical key — false by default (deny-by-default)
    const resolved = Object.fromEntries(
      Object.values(PERMISSIONS).map((key) => [key, raw[key] === true])
    );

    return {
      ...resolved,
      /** Dynamic lookup helper */
      can: (permissionKey) => raw[permissionKey] === true,
      /** The raw permissions object as returned by the API */
      raw,
    };
  }, [relationship]);
}

/**
 * useHasPermission — lightweight single-permission check.
 *
 * @param {object|null} relationship
 * @param {string} permissionKey  — One of the PERMISSIONS constants
 * @returns {boolean}
 *
 * Usage:
 *   const canDelete = useHasPermission(relationship, PERMISSIONS.canDeleteMedication);
 */
export function useHasPermission(relationship, permissionKey) {
  return useMemo(
    () => relationship?.permissions?.[permissionKey] === true,
    [relationship, permissionKey]
  );
}
