# Fyrirspurn Status Fix

## Problem
Bills of type "fyrirspurn" (written questions) were being assigned the wrong status (`awaiting_first_reading`). For example, Þingmál #83 which has been answered should show status "Fyrirspurn svarað" instead of "Bíða 1. umræðu".

Fyrirspurn bills have a different workflow than regular bills:
- **Question sent** → waiting for answer
- **Question answered** → answered in writing or orally
- **Question unanswered** → explicitly not answered

## Investigation
Fetched XML for Þingmál #83:
```xml
<málstegund málstegund='q'>
  <heiti>Fyrirspurn</heiti>
  <heiti2>fyrirspurn til skrifl. svars</heiti2>
</málstegund>
<staðamáls>Fyrirspurninni var svarað skriflega.</staðamáls>
```

Found multiple fyrirspurn status patterns:
1. `"Fyrirspurninni var svarað skriflega."` - answered in writing (most common)
2. `"Fyrirspurninni var svarað munnlega."` - answered orally
3. `"Fyrirspurninni hefur ekki verið svarað."` - not yet answered

## Solution

### 1. Backend Model Changes

#### `/backend/parliament/models.py`
Added two new status choices to the `Bill` model:
```python
STATUS_CHOICES = [
    # ... existing statuses ...
    ('question_sent', 'Fyrirspurn send'),
    ('question_answered', 'Fyrirspurn svarað')
]
```

#### `/backend/parliament/migrations/0009_add_fyrirspurn_status_choices.py`
Created migration to update the status field choices in the database.

### 2. Status Mapping Logic

#### `/backend/scrapers/fetch_bills.py`
Updated `map_bill_status()` function to handle fyrirspurn statuses:
```python
def map_bill_status(status_text):
    # Check for unanswered questions first (more specific)
    if 'hefur ekki verið svarað' in status_text or 'ekki verið svarað' in status_text:
        return 'question_sent'
    
    status_map = {
        # ... existing mappings ...
        'svarað': 'question_answered',  # Covers both written and oral answers
        'Fyrirspurn': 'question_sent'
    }
    # ...
```

Status mapping logic:
- `"svarað"` in status text → `'question_answered'` (covers both skriflega and munnlega)
- `"ekki verið svarað"` in status text → `'question_sent'` (explicitly not answered)
- Default for fyrirspurn → `'question_sent'`

#### `/backend/parliament/views.py`
Updated `BillViewSet.statistics()` to include counts for new statuses:
```python
stats = {
    # ... existing statuses ...
    'question_sent': 0,
    'question_answered': 0,
    # ...
}
```

### 3. Frontend Display Updates

Updated status display and colors in three files:

#### `/frontend/src/pages/parliament/BillsPage.js`
- Added `'question_sent': 'Fyrirspurn send'` to `formatStatus()`
- Added `'question_answered': 'Fyrirspurn svarað'` to `formatStatus()`
- Added `'question_sent': 'info'` to `getStatusColor()`
- Added `'question_answered': 'success'` to `getStatusColor()`
- Added menu items to status filter dropdown

#### `/frontend/src/pages/parliament/BillDetailPage.js`
- Updated `formatStatus()` and `getStatusColor()` functions
- Added both new statuses with proper colors

#### `/frontend/src/pages/parliament/MemberDetailPage.js`
- Updated `formatStatus()` and `getStatusColor()` functions
- Added both new statuses with proper colors

#### `/frontend/src/pages/analytics/DashboardPage.js`
- Updated `statusTranslations` object in the "Staða þingmála" chart
- Added all missing status translations to Icelandic:
  - `awaiting_first_reading` → "Bíða 1. umræðu"
  - `awaiting_second_reading` → "Bíða 2. umræðu"
  - `awaiting_third_reading` → "Bíða 3. umræðu"
  - `question_sent` → "Fyrirspurn send"
  - `question_answered` → "Fyrirspurn svarað"

## Testing

Tested status mapping with all known fyrirspurn status patterns:
```
Fyrirspurninni var svarað skriflega.     → question_answered ✓
Fyrirspurninni var svarað munnlega.      → question_answered ✓
Fyrirspurninni hefur ekki verið svarað.  → question_sent ✓
Bíða 1. umræðu                           → awaiting_first_reading ✓
Samþykkt                                 → passed ✓
```

## Deployment Steps

1. **Apply database migration:**
   ```bash
   cd backend
   python3 manage.py migrate
   ```

2. **Re-fetch bills to update statuses:**
   ```bash
   cd backend
   python3 scrapers/fetch_bills.py 157
   ```
   This will update all bills in session 157 with the correct statuses.

3. **Verify the fix:**
   - Check Þingmál #83 in the database or frontend
   - Status should now be `'question_answered'` ("Fyrirspurn svarað")
   - Color should be green (success)

## Files Modified

### Backend:
- `backend/parliament/models.py` - Added new status choices
- `backend/scrapers/fetch_bills.py` - Updated status mapping logic
- `backend/parliament/views.py` - Updated statistics endpoint
- `backend/parliament/migrations/0009_add_fyrirspurn_status_choices.py` - New migration

### Frontend:
- `frontend/src/pages/parliament/BillsPage.js` - Updated status display and filters
- `frontend/src/pages/parliament/BillDetailPage.js` - Updated status display
- `frontend/src/pages/parliament/MemberDetailPage.js` - Updated status display
- `frontend/src/pages/analytics/DashboardPage.js` - Updated status translations in charts

## Notes

- All linter checks passed ✓
- No breaking changes - existing statuses remain unchanged
- The new statuses are only used for bills of type `'fyrirspurn'`
- Regular bills (frumvarp) and resolutions (þingsályktun) are unaffected

