const token = process.env.DISCORD_TOKEN;
const applicationId = process.env.DISCORD_APPLICATION_ID;

if (!token) {
  throw new Error("The DISCORD_TOKEN environment variable is required.");
}
if (!applicationId) {
  throw new Error(
    "The DISCORD_APPLICATION_ID environment variable is required."
  );
}

const url = `https://discord.com/api/v10/applications/${applicationId}/commands`;

// @ts-ignore
const response = await fetch(url, {
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bot ${token}`,
  },
  method: "PUT",
  body: JSON.stringify([]),
});
