exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method not allowed" };
  }
  
  try {
    const body = JSON.parse(event.body || "{}");
    
    const messages = [];
    if (body.system) {
      messages.push({ role: "system", content: body.system });
    }
    if (body.messages && Array.isArray(body.messages)) {
      messages.push(...body.messages);
    }
    
    const response = await fetch("https://api.deepseek.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.DEEPSEEK_API_KEY}`,
      },
      body: JSON.stringify({
        model: "deepseek-chat",
        messages: messages,
        max_tokens: body.max_tokens || 2048,
        temperature: 0.7,
      }),
    });
    
    const data = await response.json();
    
    if (data.choices && data.choices.length > 0) {
      return {
        statusCode: 200,
        body: JSON.stringify({
          content: [
            {
              type: "text",
              text: data.choices[0].message.content
            }
          ]
        }),
      };
    }
    
    return {
      statusCode: response.status,
      body: JSON.stringify(data),
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: String(err.message || err) }),
    };
  }
};