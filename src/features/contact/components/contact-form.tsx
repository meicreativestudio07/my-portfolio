"use client";

import type { FormEvent } from "react";
import { useState } from "react";

const FORMSPREE_ENDPOINT = `https://formspree.io/f/${process.env.NEXT_PUBLIC_FORMSPREE_FORM_ID}`;

type SubmitStatus = "idle" | "submitting" | "success" | "error";

export const ContactForm = () => {
  const [status, setStatus] = useState<SubmitStatus>("idle");

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    setStatus("submitting");

    try {
      const response = await fetch(FORMSPREE_ENDPOINT, {
        method: "POST",
        body: new FormData(form),
        headers: { Accept: "application/json" },
      });

      if (!response.ok) throw new Error("Formspree request failed");

      form.reset();
      setStatus("success");
    } catch {
      setStatus("error");
    }
  };

  return (
    <form className="contact__form" data-reveal="text" onSubmit={handleSubmit}>
      <div className="contact__field">
        <label className="contact__label" htmlFor="contact-name">
          お名前
        </label>
        <input
          className="contact__input"
          id="contact-name"
          name="name"
          type="text"
          autoComplete="name"
          required
        />
      </div>

      <div className="contact__field">
        <label className="contact__label" htmlFor="contact-email">
          メールアドレス
        </label>
        <input
          className="contact__input"
          id="contact-email"
          name="email"
          type="email"
          autoComplete="email"
          required
        />
      </div>

      <div className="contact__field">
        <label className="contact__label" htmlFor="contact-message">
          お問い合わせ内容
        </label>
        <textarea
          className="contact__textarea"
          id="contact-message"
          name="message"
          rows={6}
          required
        />
      </div>

      <div className="contact__actions">
        <button
          className="contact__submit"
          type="submit"
          disabled={status === "submitting"}
        >
          {status === "submitting" ? "送信中…" : "送信する"}
        </button>

        {status === "success" && (
          <p className="contact__status" data-tone="success" role="status">
            送信しました。お問い合わせありがとうございます。
          </p>
        )}
        {status === "error" && (
          <p className="contact__status" data-tone="error" role="alert">
            送信に失敗しました。お手数ですが時間をおいて再度お試しください。
          </p>
        )}
      </div>
    </form>
  );
};
