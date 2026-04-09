# IFRIC + ESMA Hub

אתר מחקר שמרכז:

- החלטות IFRIC
- extracts של החלטות האכיפה של ESMA
- דף בית עם חיפוש רוחבי
- מסכים נפרדים לכל מקור

## הרצה מקומית

הדרך הכי פשוטה ב-Windows:

- לחץ פעמיים על `launch-site.bat`

או דרך PowerShell:

```powershell
powershell -ExecutionPolicy Bypass -File .\start-site.ps1
```

ואז לפתוח:

```text
http://localhost:8080
```

## מבנה הפרויקט

- `index.html` - ממשק האתר
- `styles.css` - עיצוב
- `app.js` - לוגיקת טעינת הנתונים, חיפוש ולשוניות
- `data/ifric.json` - נתוני IFRIC
- `data/esma.json` - נתוני ESMA
- `scripts/build-ifric-dataset.ps1` - בניית מאגר IFRIC מהאתר הרשמי
- `scripts/build-esma-dataset.ps1` - בניית מאגר ESMA מהאתר הרשמי
- `scripts/update-datasets.ps1` - עדכון שני המאגרים יחד
- `.github/workflows/update-data.yml` - עדכון אוטומטי שבועי ב-GitHub Actions

## עדכון נתונים ידני

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\update-datasets.ps1
```

## פרסום אוטומטי

הפרויקט מוכן לגישה של:

1. מעלים ל-GitHub
2. מפעילים GitHub Pages
3. ה-workflow ב-`.github/workflows/update-data.yml` יעדכן את קבצי ה-JSON אחת לשבוע

כך האתר יכול להישאר סטטי מבחינת אירוח, אבל הנתונים שלו יתעדכנו אוטומטית.

## מקורות רשמיים

- https://www.ifrs.org/supporting-implementation/how-we-help-support-consistent-application/#agenda-decisions
- https://www.ifrs.org/supporting-implementation/supporting-materials-by-ifrs-standards/
- https://www.esma.europa.eu/issuer-disclosure/financial-reporting
