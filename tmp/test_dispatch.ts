import { dispatchToAuthorities } from '../backend/src/services/dispatchService';

async function test() {
    console.log("--- Testing Dispatch Service ---");
    const mockAlert = {
        camId: "CAM-04-TEST",
        memberCount: 5,
        weaponsDetected: ["knife"],
        type: "INDIAN_RED_FLAG",
        severity: "CRITICAL",
        description: "Test Alert: 5 members with knife"
    };

    const result = await dispatchToAuthorities(mockAlert);
    console.log("Result:", JSON.stringify(result, null, 2));
}

test();
