export async function executeSqlQuery(query: string) {
  const PICA_SECRET_KEY = Deno.env.get("PICA_SECRET_KEY");
  const PICA_SUPABASE_CONNECTION_KEY = Deno.env.get(
    "PICA_SUPABASE_CONNECTION_KEY",
  );
  const PROJECT_REF = Deno.env.get("SUPABASE_PROJECT_ID");
  const ACTION_ID = "conn_mod_def::GC40SckOddE::NFFu2-49QLyGsPBdfweitg";

  const response = await fetch(
    `https://api.picaos.com/v1/passthrough/v1/projects/${PROJECT_REF}/database/query`,
    {
      method: "POST",
      headers: {
        "x-pica-secret": PICA_SECRET_KEY!,
        "x-pica-connection-key": PICA_SUPABASE_CONNECTION_KEY!,
        "x-pica-action-id": ACTION_ID,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ query }),
    },
  );

  if (response.status === 201) {
    return await response.json();
  } else {
    const error = await response.text();
    throw new Error(`Database error: ${error}`);
  }
}
