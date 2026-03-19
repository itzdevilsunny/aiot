import axios from 'axios';

export interface IncidentData {
  camId: string;
  memberCount: number;
  weaponsDetected: string[];
  type: string;
  severity: string;
  description: string;
  image?: string;
}

/**
 * Dispatches incident data to a simulated Emergency Response / PCR API.
 */
export const dispatchToAuthorities = async (incidentData: IncidentData) => {
  const payload = {
    incidentId: `IRF-${Date.now()}`,
    priority: incidentData.severity || "URGENT",
    location: {
      sector: "Sector 1 - North Parking",
      lat: 28.6139,
      lng: 77.2090,
      camera: incidentData.camId
    },
    threatDetails: {
      type: incidentData.type,
      members: incidentData.memberCount,
      weapons: incidentData.weaponsDetected,
      description: incidentData.description,
      liveStream: `http://10.30.56.122:8080/video`
    },
    timestamp: new Date().toISOString()
  };

  console.log(`[Dispatch Service] Initiating dispatch for ${payload.incidentId}...`);

  try {
    // Dispatch to PCR (Police Control Room) Simulation
    // Note: This URL is a simulation and will likely fail in a real environment, 
    // but we use it to demonstrate the workflow.
    const response = await axios.post('https://pcr-api.mcd.gov.in/dispatch', payload, { timeout: 2000 });
    return { success: true, ref: payload.incidentId, data: response.data };
  } catch (err: any) {
    console.error(`[Dispatch Service] Dispatch failed: ${err.message}`);
    // Return success: true for demo purposes even if the mock URL fails, 
    // or return the error to show failure handling.
    return { 
      success: false, 
      error: "Network Timeout / Simulated PCR Offline",
      payload: payload // Return payload so UI can at least show what would have been sent
    };
  }
};
