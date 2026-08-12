# Fitness Made Simple SG — Website

`index.html` is a single-page lead-capture landing page (dark / acid-green theme, matched to `poster_v1.png`) — this is the live site now, built for driving inquiries from Carousell/Bark/Superprof/Gumtree outreach. No build tools, no frameworks — just HTML, CSS, and JS.

The original multi-page marketing site (about/programs/results/contact) is still in the folder but no longer linked from the homepage — kept around in case it's useful again once the business is more established. `faq.html` used to be part of that set but has since been rebuilt in the current dark theme and is live, linked from every page's nav.

## Structure

```
fitness-made-simple/
├── index.html          Home — single-page lead-capture landing (live)
├── faq.html             FAQ (live, dark theme, linked from nav)
├── testimonials.html    Placeholder until there are real testimonials (live, linked from nav)
├── program-builder.html  Internal tool — drafts a Claude prompt for a client's training program
├── css/
│   ├── landing.css     Styles for index.html + shared header/nav (dark / acid-green theme)
│   ├── faq.css           Extra styles for faq.html (accordion)
│   ├── program-builder.css  Extra styles for program-builder.html
│   └── blog.css         Extra styles for the blog (post list + article layout)
├── js/
│   ├── landing.js       Scroll reveal, toast, lead form submission (both forms)
│   ├── faq.js            FAQ accordion open/close
│   ├── program-builder.js  Builds the prompt text for program-builder.html
│   └── config.js        Contact form endpoint URL (shared by landing.js and main.js)
│
├── blog/
│   ├── index.html       Post list
│   └── making-the-switch.html  First post
│
├── about.html, programs.html, results.html, contact.html
│                        Legacy multi-page site — not linked from index.html anymore
├── css/style.css        Styles for the legacy pages (moss-green theme)
└── js/main.js            Scroll reveal, FAQ accordion, mobile menu, form submission — legacy pages only
```

## Adding a new blog post

There's no CMS — each post is a plain HTML file in `blog/`, copied from `making-the-switch.html`:

1. Duplicate `blog/making-the-switch.html`, rename it to match the new post's slug
2. Update the `<title>`, `<meta name="description">`, `.post-date`, `<h1>`, and body paragraphs
3. Add a matching `.post-card` entry at the top of `blog/index.html`'s `.post-list` (title, date, excerpt, link to the new file)

## Connecting the lead forms to Google Sheets

`index.html` has **two forms**, both submitting to the same Google Sheet:
- **Quick inquiry** (in the "Get in touch" section) — low-friction, for cold leads: name, email/phone, package, source, and an optional free-text message for people who just have a question
- **Detailed intake** (further down, `#intake`) — for people who already know they want to start: everything from the quick form plus age, gender, preferred venue, preferred days/times (multi-select), goal, experience level, equipment, days/week, session length, injuries, and notes

Both send a `formType` field (`"quick"` or `"detailed"`) so you can tell them apart in the sheet. The detailed form sends more fields than the quick one — `appendRow` below just leaves a cell blank when a field wasn't part of that submission.

**Your submissions sheet:** https://docs.google.com/spreadsheets/d/1shgctLpiUQLHnJn_ML9G_LdL47zMeNqp76W5N5USmQY/edit

This step needs to happen once, manually, since Google requires you to authorize the script yourself:

1. Open the sheet above → **Extensions → Apps Script**
2. Delete anything in the editor and paste this:

   ```javascript
   function doPost(e) {
     var sheet = SpreadsheetApp.openById('1shgctLpiUQLHnJn_ML9G_LdL47zMeNqp76W5N5USmQY').getActiveSheet();
     var data = JSON.parse(e.postData.contents);
     var sgtTime = Utilities.formatDate(new Date(), 'Asia/Singapore', 'dd MMM yyyy, HH:mm:ss') + ' SGT';
     sheet.appendRow([
       sgtTime,
       data.formType || '',
       data.name || '',
       data.email || '',
       data.phone || '',
       data.package || '',
       data.source || '',
       data.message || '',
       data.age || '',
       data.gender || '',
       data.location || '',
       data.timingDays || '',
       data.timingBlocks || '',
       data.goal || '',
       data.experience || '',
       data.equipment || '',
       data.days || '',
       data.duration || '',
       data.limitations || '',
       data.notes || ''
     ]);
     return ContentService.createTextOutput(JSON.stringify({status: 'success'}))
       .setMimeType(ContentService.MimeType.JSON);
   }
   ```

   Add a header row to the sheet if you want one: `Timestamp | Form Type | Name | Email | Phone | Package | Source | Message | Age | Gender | Venue | Preferred Days | Preferred Times | Goal | Experience | Equipment | Days/Week | Session Length | Limitations | Notes`.

   `Preferred Days` and `Preferred Times` come from checkboxes, so if someone selects more than one option (e.g. both Weekdays and Weekends), that cell will contain a comma-separated list rather than a single value.

3. Click **Deploy → New deployment**
4. Click the gear icon next to "Select type" → choose **Web app**
5. Set:
   - **Execute as:** Me
   - **Who has access:** Anyone
6. Click **Deploy** → authorize when prompted (it'll warn you it's an unverified app — that's expected since it's your own script; click **Advanced → Go to project (unsafe) → Allow**)
7. Copy the **Web app URL** it gives you
8. Open `js/config.js` and paste it in:
   ```javascript
   const CONTACT_ENDPOINT = "PASTE_YOUR_URL_HERE";
   ```
9. Save, refresh the page — submissions will now land as new rows in your sheet

**Already have a deployment from before?** (You do — `js/config.js` already has a working URL in it.) The script needs updating again to log the new fields: paste the code above into the same Apps Script editor, save, then go to **Deploy → Manage deployments → click the pencil/edit icon → Version: New version → Deploy**. That keeps the same URL (no need to touch `js/config.js`) but pushes the updated logging logic live.

Until this is set up, both forms show a friendly "not connected yet" message instead of failing silently.

## Running it locally

You don't need Node, npm, or any build step — it's static HTML. Two options:

### Option 1: VSCode + Live Server (recommended)
1. Open the `fitness-made-simple` folder in VSCode
2. Install the **Live Server** extension (Extensions tab → search "Live Server" by Ritwick Dey → Install)
3. Right-click `index.html` in the file explorer → **"Open with Live Server"**
4. It opens in your browser at something like `http://127.0.0.1:5500` and auto-refreshes whenever you save a file

### Option 2: Just open the file directly
Double-click `index.html` and it'll open in your browser. This works fine for looking at pages, but skips the auto-refresh-on-save convenience of Live Server.

## Making edits

- All text content for the landing page lives directly in `index.html` — search for the text you want to change
- Colors, fonts, spacing for the landing page live in `css/landing.css` — color variables are defined at the top under `:root`
- Interactive bits (scroll reveal, toast, lead form) are in `js/landing.js`
- The legacy multi-page site's equivalents are `css/style.css` and `js/main.js`

## Before going live

- [ ] Update the Apps Script (see above) so it logs the new fields — otherwise submissions will still hit the sheet but package/source won't be captured
- [ ] Confirm "Fitness Made Simple SG" as the final name (check IPOS Singapore trademark register if you want to register it properly)

## Publishing it live (when ready)

Free options that work well for a static site like this:
- **Netlify** — drag and drop the whole folder at [app.netlify.com/drop](https://app.netlify.com/drop), get a live URL instantly
- **Vercel** — similar drag-and-drop flow, or connect a GitHub repo for auto-deploys
- **GitHub Pages** — free if you're already using GitHub to store the code

Once live, you can point a custom domain (e.g. from Namecheap or Cloudflare) at any of the above.
