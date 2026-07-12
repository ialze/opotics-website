async function test() {
    const auth = Buffer.from(`solutions@opotics.com:9rFcX44cdmS$E#f`).toString("base64");

    const res = await fetch("https://api.forwardemail.net/v1/emails", {
      method: "POST",
      headers: {
        "Authorization": `Basic ${auth}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "solutions@opotics.com",
        to: "issa@orientalpress.com",
        subject: "Test Inquiry",
        text: "Test Message",
      }),
    });

    const text = await res.text();
    console.log("Status:", res.status);
    console.log("Body:", text);
}

test();
