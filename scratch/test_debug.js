setTimeout(async () => {
  try {
    const res = await fetch("https://subaselvi-motors-billing.vercel.app/api/debug-env");
    const text = await res.text();
    console.log(res.status, text);
  } catch (e) {
    console.error(e);
  }
}, 30000);
