export const sendWhatsAppNotification = async (templateName, recipientPhone, params, cid) => {
  try {
    const formattedPhone = recipientPhone.replace(/\D/g, "").length === 10 
      ? "91" + recipientPhone.replace(/\D/g, "") 
      : recipientPhone.replace(/\D/g, "");

    const bodyParameters = params.map(p => ({ type: "text", text: String(p || "N/A") }));

    const payload = {
      to: formattedPhone,
      type: "template",
      template: {
        name: templateName,
        language: {
          policy: "deterministic",
          code: "en",
        },
        components: [
          {
            type: "body",
            parameters: bodyParameters,
          },
        ],
      },
    };

    // Add button URL parameter if cid is provided
    if (cid) {
      payload.template.components.push({
        type: "button",
        sub_type: "url",
        index: "0",
        parameters: [
          {
            type: "text",
            text: String(cid),
          },
        ],
      });
    }

    const res = await fetch(
      "https://backend.askeva.io/v1/message/send-message?token=9a7a05bc8b2b595ad726bdaa8414d2bf3303b7b463cbbcb431729a51e4aa09a85dc57924fbe452ebe0437d4bff4d90b2af25a4d4344ca31b385f35681298e41b",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      }
    );

    if (!res.ok) {
      const errorText = await res.text();
      console.error("WhatsApp API Error:", errorText);
    } else {
      console.log("WhatsApp Notification Sent:", templateName);
    }
  } catch (error) {
    console.error("Failed to send WhatsApp notification:", error);
  }
};
