// GET /api/x-analysis — recent tweets + engagement metrics for X analysis dashboard
export async function onRequestGet(context) {
  const { env } = context;
  const token = env.X_BEARER_TOKEN;
  const userId = env.X_USER_ID;

  const url = `https://api.x.com/2/users/${userId}/tweets`
    + `?max_results=20&tweet.fields=public_metrics,created_at&exclude=retweets,replies`;

  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await res.json();

  if (!res.ok) {
    return new Response(JSON.stringify(data), {
      status: res.status,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  return new Response(JSON.stringify(data), {
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'max-age=300',
    },
  });
}
