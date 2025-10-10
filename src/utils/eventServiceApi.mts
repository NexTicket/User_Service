// Utility for communicating with Event_and_Venue_Service for tenant operations
const EVENT_SERVICE_URL = process.env.EVENT_SERVICE_URL || 'http://localhost:4000';

interface TenantData {
  id?: number;
  name: string;
  firebaseUid: string;
  createdAt?: string;
  updatedAt?: string;
  email?: string | null;
  role?: string | null;
}

interface TenantApiResponse {
  message: string;
  tenant: TenantData;
  created?: boolean;
}

export const callEventServiceTenant = {
  // Create or get existing tenant (ensure tenant exists)
  async ensureTenant(firebaseUid: string, name: string): Promise<TenantData | null> {
    try {
      const response = await fetch(`${EVENT_SERVICE_URL}/api/tenants/ensure`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          firebaseUid,
          name
        })
      });

      if (!response.ok) {
        console.error('Failed to ensure tenant via Event Service:', response.status, await response.text());
        return null;
      }

      const result: TenantApiResponse = await response.json();
      console.log(`✅ ${result.created ? 'Created' : 'Found'} tenant via Event Service:`, result.tenant);
      
      return result.tenant;
    } catch (error) {
      console.error('Error calling Event Service for tenant ensure:', error);
      return null;
    }
  },

  // Get tenant by Firebase UID
  async getTenantByFirebaseUid(firebaseUid: string): Promise<TenantData | null> {
    try {
      const response = await fetch(`${EVENT_SERVICE_URL}/api/tenants/firebase/${firebaseUid}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (response.status === 404) {
        console.log(`🔍 Tenant not found in Event Service for Firebase UID: ${firebaseUid}`);
        return null;
      }

      if (!response.ok) {
        console.error('Failed to fetch tenant via Event Service:', response.status, await response.text());
        return null;
      }

      const result = await response.json();
      console.log(`✅ Found tenant via Event Service:`, result.tenant);
      
      return result.tenant;
    } catch (error) {
      console.error('Error calling Event Service for tenant fetch:', error);
      return null;
    }
  },

  // Create a new tenant
  async createTenant(firebaseUid: string, name: string): Promise<TenantData | null> {
    try {
      const response = await fetch(`${EVENT_SERVICE_URL}/api/tenants`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          firebaseUid,
          name
        })
      });

      if (!response.ok) {
        console.error('Failed to create tenant via Event Service:', response.status, await response.text());
        return null;
      }

      const result: TenantApiResponse = await response.json();
      console.log(`✅ Created tenant via Event Service:`, result.tenant);
      
      return result.tenant;
    } catch (error) {
      console.error('Error calling Event Service for tenant creation:', error);
      return null;
    }
  }
};