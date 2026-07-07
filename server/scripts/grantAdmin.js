
import { createClerkClient } from '@clerk/clerk-sdk-node';
import 'dotenv/config'

const clerkClient = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY })

async function grantAdmin() {
  try {
    const users = await clerkClient.users.getUserList({ emailAddress: ['devangsharma2707@gmail.com'] });

    if (users.length === 0) {
      console.log("User not found.");
      return;
    }

    const user = users[0];
    await clerkClient.users.updateUser(user.id, {
      privateMetadata: { role: 'admin' }
    });

    console.log(`User ${user.emailAddresses[0].emailAddress} granted admin access.`);
  } catch (error) {
    console.error("Error granting admin access:", error);
  }
}

grantAdmin();
