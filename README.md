# Bachelor’s Blitz Auction System 
A real-time, multi-user auction management system for college sports tournaments, powered entirely by **Google Sheets** and **Apps Script**.

---

## Overview
Bachelor’s Blitz Auction is a lightweight, automated auction system designed for campus-level team auctions. It allows sports committees to conduct live bidding sessions, manage player allocations, and track budgets without any external software or backend.

---

## Features
- **Live Auction Dashboard:** Displays one player at a time for bidding, updates data dynamically.  
- **Secure Multi-User Access:** Owners view only the auction dashboard — no access to future players.  
- **Automatic Team Calculations:** Updates team spending, remaining credits, gender ratios, and flags rule violations.  
- **Centralized Logs:** Sold players automatically logged with timestamps for transparency.  
- **No Deployment Needed:** Built natively in Google Sheets using Apps Script.

---

## How It Works
1. **Players Sheet:** Master database of all players.  
2. **Teams Sheet:** Calculates totals, remaining credits, and compliance with team rules.  
3. **Auction Sheet:** Displays one player at a time and provides editable input cells below for live bidding outcomes.  
4. **Apps Script:** Syncs auction data → player database → sold log.

---

## Project Structure
``` bash
Bachelors-blitz-auction-system/
├── appsscript/
│ └── auction_sync.js
├── data/
│ └── auction_data.xlsx
└── README.md
```

---

## Example Google Sheet Formulas
- **Spent per team:**
  ```excel
  =SUMIFS(Players!$G:$G, Players!$H:$H, $A2, Players!$F:$F, "SOLD")

## Tech Stack
Platform: Google Sheets
Automation: Google Apps Script (JavaScript)
Realtime Collaboration: Google Workspace
Visualization: Native conditional formatting

## Usage
- Copy the Google Sheet template.
- Paste your player & team data.
- Open Extensions → Apps Script and paste auction_sync.js.
- Run once to authorize.
- Use the Auction sheet for live bidding.

# Author

**Pranav Alok**
~ B.S. Analytics & Sustainability Studies
~ TISS Mumbai

🔗[Linkedin](https://www.linkedin.com/in/pranav-alok-aa0664338/)




