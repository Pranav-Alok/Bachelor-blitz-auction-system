/**
 * Script: Confirm-input-row-driven sync
 * Sheets: 'Players', 'Auction'
 * - Current player shown via FILTER in Auction row 3 (A3:K3)
 * - Editable inputs (to be filled) are in Auction row 4:
 *     F4 -> Auction Status (e.g., SOLD)
 *     G4 -> Sold price
 *     H4 -> Bought by (Team)
 *     I4 -> Owner contact (optional)
 *     L4 -> Confirm checkbox (TRUE to finalize)
 *
 * Behavior:
 * - Script triggers only when checkbox L4 is checked TRUE.
 * - It validates fields, finds the player by name in Players (A col),
 *   writes the values in Players (F:G:H:I:J), appends to Sold Log,
 *   clears B1 (current player selector) and clears row 4 inputs + unchecks.
 */

function onEdit(e) {
  try {
    if (!e || !e.range) return;
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sh = e.range.getSheet();
    if (sh.getName() !== 'Auction') return;

    const r = e.range.getRow();
    const c = e.range.getColumn();

    // We only react when the confirm-checkbox cell L4 is edited
    const CONFIRM_ROW = 4, CONFIRM_COL = 12; // column L = 12
    if (!(r === CONFIRM_ROW && c === CONFIRM_COL)) return;

    const confirmVal = sh.getRange(CONFIRM_ROW, CONFIRM_COL).getValue();
    if (confirmVal !== true) return; // only act when checked

    // Read displayed player name from A3 (filter output)
    const playerNameCell = sh.getRange(3,1).getValue(); // A3
    const playerName = (playerNameCell || '').toString().trim();
    if (!playerName) {
      sh.getRange(4,11).setValue('ERROR: No player shown in A3.');
      sh.getRange(CONFIRM_ROW, CONFIRM_COL).setValue(false);
      return;
    }

    // Read inputs from row 4
    const auctionStatus = (sh.getRange(4,6).getValue() || '').toString().trim(); // F4
    const soldAtRaw = sh.getRange(4,7).getValue(); // G4
    const soldAt = (soldAtRaw !== null && soldAtRaw !== '') ? soldAtRaw : '';
    const boughtBy = (sh.getRange(4,8).getValue() || '').toString().trim();   // H4
    const ownerContact = (sh.getRange(4,9).getValue() || '').toString().trim(); // I4

    // Validate required fields: status=SOLD, soldAt, boughtBy
    if (auctionStatus.toUpperCase() !== 'SOLD' || soldAt === '' || boughtBy === '') {
      sh.getRange(4,11).setValue('ERROR: To confirm, set Status=SOLD and fill Sold price and Bought by.');
      sh.getRange(CONFIRM_ROW, CONFIRM_COL).setValue(false);
      return;
    }

    // Find player in Players sheet by name (A col), case-insensitive, tolerant spaces
    const players = ss.getSheetByName('Players');
    if (!players) {
      sh.getRange(4,11).setValue('ERROR: Players sheet not found.');
      sh.getRange(CONFIRM_ROW, CONFIRM_COL).setValue(false);
      return;
    }

    const lastRow = players.getLastRow();
    if (lastRow < 2) {
      sh.getRange(4,11).setValue('ERROR: Players sheet empty.');
      sh.getRange(CONFIRM_ROW, CONFIRM_COL).setValue(false);
      return;
    }

    const namesRange = players.getRange(2,1,lastRow-1,1).getValues();
    const names = namesRange.map(r => (r[0] ? r[0].toString().trim().toUpperCase() : ''));
    const targetName = playerName.toUpperCase();
    let idx = names.indexOf(targetName);
    if (idx === -1) {
      // tolerant: normalize spaces
      for (let i=0;i<names.length;i++){
        if (names[i].replace(/\s+/g,' ') === targetName.replace(/\s+/g,' ')) { idx = i; break; }
      }
    }
    if (idx === -1) {
      sh.getRange(4,11).setValue('ERROR: Player not found in Players sheet. Check name.');
      sh.getRange(CONFIRM_ROW, CONFIRM_COL).setValue(false);
      return;
    }

    const targetRow = 2 + idx; // because data starts at row 2

    // Write into Players sheet:
    // F (6) Auction Status, G (7) Sold At, H (8) Bought by (Team), I (9) Owner Contact, J (10) Timestamp
    players.getRange(targetRow,6).setValue(auctionStatus);
    players.getRange(targetRow,7).setValue(soldAt);
    players.getRange(targetRow,8).setValue(boughtBy);
    if (ownerContact !== '') players.getRange(targetRow,9).setValue(ownerContact);
    players.getRange(targetRow,10).setValue(new Date());

    // Append updated full row A:K to Sold Log (create if missing)
    let log = ss.getSheetByName('Sold Log');
    if (!log) {
      log = ss.insertSheet('Sold Log');
      log.appendRow(['Player Name','Player Email','GENDER','Course','Base Price','Auction Status','Sold At','Bought by (Team)','Owner Contact','Timestamp sold','Notes']);
    }
    const updatedRow = players.getRange(targetRow,1,1,11).getValues()[0];
    log.appendRow(updatedRow);

    // Clear Auction inputs (row 4: columns F,G,H,I), clear any notes (col K), uncheck confirm, clear B1
    sh.getRange(4,6,1,4).clearContent(); // F4:I4
    sh.getRange(4,11).clearContent();    // K4
    sh.getRange(CONFIRM_ROW, CONFIRM_COL).setValue(false);
    sh.getRange('B1').clearContent();

  } catch (err) {
    Logger.log('Error in confirm-sync (input row version): ' + err);
    try {
      const s = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Auction');
      if (s) s.getRange(4,11).setValue('SCRIPT ERROR: ' + err.toString());
    } catch(e){}
  }
}
