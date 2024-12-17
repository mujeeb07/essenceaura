const create_mail_options = (recipient_email, subject, text_content) => {
    return {
      from: { name: "Essence Aura", address: process.env.EMAIL_USER },
      to: recipient_email,
      subject: subject,
      text: text_content,
    };
  };

module.exports = create_mail_options;