# راهنمای ساخت Agent در ElevenLabs برای دمو YARA

این دمو از قابلیت **Client Tools** در ElevenLabs Agents استفاده می‌کند: Agent صوتی در حین مکالمه، توابعی را که داخل مرورگر (همین اپ React) تعریف شده‌اند صدا می‌زند و داشبورد به‌صورت زنده به‌روز می‌شود. محافظ‌های ایمنی (اجازه دسترسی، Sandbox، تأیید ادمین) در خود کد پیاده شده‌اند، نه فقط در پرامپت.

> ⚠️ نام ابزارها و پارامترها **به حروف کوچک و بزرگ حساس‌اند** و باید دقیقاً همین‌ها باشند.

---

## ۱. ساخت Agent

1. وارد [elevenlabs.io](https://elevenlabs.io) شوید و به بخش **Agents** بروید. روی **Create agent** بزنید و **Blank template** را انتخاب کنید.
2. در تب **Agent**:
   - **Agent language:** Persian (فارسی)
   - **First message:** متن بخش ۲ پایین
   - **System prompt:** متن بخش ۳ پایین
   - **LLM:** یک مدل قوی با پشتیبانی خوب از ابزار، مثل Claude Sonnet یا GPT-4.1 یا Gemini Flash
3. در تب **Voice** یک صدای چندزبانه انتخاب کنید و مدلی را بگذارید که فارسی را پشتیبانی کند (مثلاً Multilingual یا v3). یک بار تست کنید که لهجه فارسی قابل قبول است.
4. در تب **Security** یا **Advanced**، Agent را **Public** بگذارید تا بدون کلید API از مرورگر وصل شود. **کلید API را هرگز داخل کد فرانت قرار ندهید.**
5. **Agent ID** را (به شکل `agent_...`) کپی کنید. در اپ، روی ⚙️ بالای صفحه بزنید و آن را وارد کنید، یا در فایل `.env` بنویسید:
   ```
   VITE_ELEVENLABS_AGENT_ID=agent_xxxxxxxx
   ```

## ۲. First message

```
سلام، من یارا هستم، دستیار هوشمند پشتیبانی نامه‌نگار. چطور می‌تونم کمکتون کنم؟
```

## ۳. System prompt

```
You are YARA (Your AI Response Assistant), an AI technical-support agent for "نامه‌نگار", an on-premise office automation product. You talk on the phone with the IT admin of a customer organization. ALWAYS speak Persian (Farsi), in a warm, concise, professional tone. Keep each turn to 1–3 short sentences. Never read JSON, IDs or log lines aloud verbatim; summarize them naturally.

Your job is to SOLVE the problem, not only answer. Follow this procedure strictly, using the tools:

1. Ask the caller's organization if unknown, then call identify_customer. Mention their version briefly.
2. Understand the problem and call search_knowledge_base with a short query and the best category:
   - workflow  → letters/referrals (ارجاع), routing, cartable, substitutes
   - export    → PDF/print/export errors
   - performance → slowness, timeouts, disk
   - other     → anything else
   If it is a simple how-to question and an article answers it, explain the steps and stop there.
3. To investigate, you MUST ask permission first: call request_server_access with a short reason. Tell the caller the access is read-only and audited. If denied, offer create_ticket.
4. Call run_diagnostics with the same area. Explain the root cause and impact in plain Persian.
5. If classification is "fixable_on_customer_server":
   a. Say you will test the fix in an isolated sandbox first, then call test_fix_in_sandbox with recommended_fix_id.
   b. Tell the result and ask for approval by calling request_fix_approval (fix_id + one-line explanation). The admin approves on screen.
   c. Only if approved, call apply_fix. Report the verified result.
   d. Ask if the problem is solved; when confirmed, call close_case.
6. If classification is "product_bug": explain it is a product bug, give the workaround, then call create_ticket (title in Persian, severity "high", short summary). Tell the caller the ticket id is registered with full evidence and the SLA.
7. If unknown or the caller asks for a human: call create_ticket or transfer_to_human.

Hard rules:
- Never claim you changed anything unless apply_fix returned ok:true.
- If a tool returns blocked_by_guardrail, apologize briefly and follow the required step.
- Never invent tool results. Never ask for passwords.
- While a tool is running, you may say a short filler like «یک لحظه، دارم بررسی می‌کنم».
```

## ۴. تعریف Client Tools

برای هر ابزار: **Tools → Add tool → Type: Client**. گزینه **Wait for response** را برای همه **روشن** کنید. اگر گزینه **Response timeout** وجود دارد، برای `request_server_access` و `request_fix_approval` بیشترین مقدار ممکن را بگذارید (مثلاً ۶۰ تا ۱۲۰ ثانیه)، چون این دو منتظر کلیک ادمین می‌مانند.

| نام ابزار | توضیح (Description) | پارامترها (همه از نوع String) |
|---|---|---|
| `identify_customer` | Look up the caller's organization, product version, server and support contract in CRM. | `organization_name` (required) |
| `search_knowledge_base` | Search product docs, training videos and previously solved tickets. | `query` (required), `category` (required — one of: workflow, export, performance, other) |
| `request_server_access` | Ask the customer admin for temporary read-only access to their server. Waits for the admin to approve on screen. | `reason` (required) |
| `run_diagnostics` | Run diagnostic checklists (logs, services, config, read-only queries) on the customer server. Requires granted access. | `area` (required — one of: workflow, export, performance, other) |
| `test_fix_in_sandbox` | Apply a proposed fix to an isolated sandbox copy of the customer server and run tests. | `fix_id` (required) |
| `request_fix_approval` | Ask the admin to approve applying a sandbox-tested fix to the production server. Waits for the admin's click. | `fix_id` (required), `explanation` (required) |
| `apply_fix` | Back up, apply the approved fix to the production server and verify it. Only after approval. | `fix_id` (required) |
| `close_case` | Close a resolved case and draft a knowledge article for expert review. | `summary` (required) |
| `create_ticket` | Create a complete ticket (logs, repro steps, version) for the human support/dev team. | `title` (required), `severity` (required — high, medium or low), `summary` (required) |
| `transfer_to_human` | Hand the conversation to a human expert with the full context package. | `reason` (required) |

## ۵. جمله‌های پیشنهادی برای دمو روی صحنه

با میکروفون، در نقش ادمین سازمان بگویید:

- **سناریوی اصلاح (بهترین برای دمو):** «سلام، احمدی هستم از سازمان نمونه توسعه شهری. از دیروز عصر نامه‌ها به معاونت مالی ارجاع نمی‌شه.»
- **سناریوی باگ ← تیکت:** «بعد از آپدیت دیشب، خروجی PDF بعضی نامه‌ها خطا می‌ده.»
- **سناریوی کندی:** «سیستم از صبح خیلی کنده.»
- **نمایش کنترل انسانی:** وقتی درخواست اجرا آمد، روی «رد» بزنید تا ببینند هیچ تغییری بدون تأیید اعمال نمی‌شود.

## ۶. چک‌لیست قبل از ارائه

- [ ] اینترنت سالن و دسترسی به elevenlabs.io را تست کنید (فیلترشکن یا اینترنت پایدار لازم است).
- [ ] مرورگر Chrome، و اجازه میکروفون برای `localhost` داده شده باشد.
- [ ] یک هدست یا میکروفون یقه‌ای بیاورید؛ صدای اسپیکر سالن نباید دوباره وارد میکروفون شود.
- [ ] **پلن B:** اگر اینترنت قطع شد، از بالای صفحه «دمو آفلاین» را انتخاب کنید. همان UI و ابزارها با گفت‌وگوی از پیش نوشته‌شده اجرا می‌شوند.
- [ ] از هر سه سناریوی آفلاین فیلم ضبط کنید تا برای ویدئوی ۵ دقیقه‌ای استفاده شود.
