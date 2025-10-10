import { callEventServiceTenant } from './eventServiceApi.mjs';

/**
 * Auto-create tenant for user if it doesn't exist
 * This ensures all users with specific roles become tenants in the system
 * Using Firestore instead of Prisma for User-Service
 */
export const ensureTenantExists = async (user: any) => {
  if (!user || !user.uid) {
    throw new Error('User information required');
  }

  console.log('🏢 ensureTenantExists called for user:', {
    uid: user.uid,
    email: user.email,
    role: user.role,
    name: user.name
  });

  // Only create tenants for specific roles (including customer since they can create events)
  const tenantRoles = ['organizer', 'venue_owner', 'event_admin', 'checkin_officer', 'customer'];
  if (!tenantRoles.includes(user.role)) {
    console.log(`⚠️ User role '${user.role}' does not require tenant creation`);
    return null; // Other roles don't need to be tenants
  }

  try {
    // Use Event Service API to ensure tenant exists
    const tenant = await callEventServiceTenant.ensureTenant(
      user.uid, 
      user.name || user.email || `${user.role} User`
    );

    if (tenant) {
      console.log(`✅ Tenant ensured via Event Service for ${user.role}: ${user.email} (${user.uid}) - ID: ${tenant.id}`);
      return tenant;
    } else {
      console.error('Failed to ensure tenant via Event Service API');
      return null;
    }
  } catch (error) {
    console.error('Failed to ensure tenant exists:', error);
    throw error;
  }
};