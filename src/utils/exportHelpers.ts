/**
 * Export Helpers
 * Utilities for exporting data to CSV, PDF (via print), and printing
 */

/**
 * Export data to CSV file
 */
export function exportToCSV(data: any[], filename: string = "export") {
  if (data.length === 0) {
    console.warn("No data to export");
    return;
  }

  // Get headers from first object
  const headers = Object.keys(data[0]);

  // Create CSV content
  const csvContent = [
    // Header row
    headers.join(","),
    // Data rows
    ...data.map((row) =>
      headers
        .map((header) => {
          const value = row[header];
          // Escape commas and quotes
          if (
            typeof value === "string" &&
            (value.includes(",") || value.includes('"'))
          ) {
            return `"${value.replace(/"/g, '""')}"`;
          }
          return value;
        })
        .join(","),
    ),
  ].join("\n");

  // Create blob and download
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);

  link.setAttribute("href", url);
  link.setAttribute(
    "download",
    `${filename}_${new Date().toISOString().split("T")[0]}.csv`,
  );
  link.style.visibility = "hidden";

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Export data to PDF file (via browser print to PDF)
 */
export function exportToPDF(
  headers: string[],
  rows: any[][],
  title: string = "Report",
) {
  // Create HTML content for PDF
  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>${title}</title>
        <style>
          @page { margin: 1cm; }
          body {
            font-family: Arial, sans-serif;
            padding: 20px;
          }
          h1 {
            color: #2CA5A9;
            margin-bottom: 10px;
          }
          .meta {
            color: #666;
            font-size: 12px;
            margin-bottom: 20px;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 20px;
          }
          th, td {
            border: 1px solid #ddd;
            padding: 8px;
            text-align: left;
            font-size: 11px;
          }
          th {
            background-color: #2CA5A9;
            color: white;
            font-weight: bold;
          }
          tr:nth-child(even) {
            background-color: #f9f9f9;
          }
        </style>
      </head>
      <body>
        <h1>${title}</h1>
        <div class="meta">Generated: ${new Date().toLocaleString()}</div>
        
        <table>
          <thead>
            <tr>
              ${headers.map((h) => `<th>${h}</th>`).join("")}
            </tr>
          </thead>
          <tbody>
            ${rows
              .map(
                (row) =>
                  `<tr>${row.map((cell) => `<td>${cell || "-"}</td>`).join("")}</tr>`,
              )
              .join("")}
          </tbody>
        </table>
      </body>
    </html>
  `;

  // Open in new window and trigger print (user can save as PDF)
  const printWindow = window.open("", "_blank");
  if (printWindow) {
    printWindow.document.write(htmlContent);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
    }, 250);
  } else {
    alert("Please allow popups to export PDF");
  }
}

/**
 * Print table data
 */
export function printTable(title: string, headers: string[], rows: any[][]) {
  // Create print window
  const printWindow = window.open("", "_blank");

  if (!printWindow) {
    alert("Please allow popups to print");
    return;
  }

  // Build HTML content
  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>${title}</title>
        <style>
          @page { margin: 1cm; }
          body {
            font-family: Arial, sans-serif;
            padding: 20px;
          }
          h1 {
            color: #2CA5A9;
            margin-bottom: 10px;
          }
          .meta {
            color: #666;
            font-size: 12px;
            margin-bottom: 20px;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 20px;
          }
          th, td {
            border: 1px solid #ddd;
            padding: 12px;
            text-align: left;
          }
          th {
            background-color: #2CA5A9;
            color: white;
            font-weight: bold;
          }
          tr:nth-child(even) {
            background-color: #f9f9f9;
          }
          @media print {
            body {
              padding: 0;
            }
          }
        </style>
      </head>
      <body>
        <h1>${title}</h1>
        <div class="meta">Generated: ${new Date().toLocaleString()}</div>
        
        <table>
          <thead>
            <tr>
              ${headers.map((h) => `<th>${h}</th>`).join("")}
            </tr>
          </thead>
          <tbody>
            ${rows
              .map(
                (row) =>
                  `<tr>${row.map((cell) => `<td>${cell || "-"}</td>`).join("")}</tr>`,
              )
              .join("")}
          </tbody>
        </table>

        <script>
          window.onload = function() {
            window.print();
          };
        </script>
      </body>
    </html>
  `;

  printWindow.document.write(htmlContent);
  printWindow.document.close();
}

/**
 * Format currency for export
 */
export function formatCurrency(amount: number): string {
  return `₹${amount.toLocaleString("en-IN")}`;
}

/**
 * Format date for export
 */
export function formatDate(date: Date | string): string {
  return new Date(date).toLocaleDateString("en-IN");
}

/**
 * Format datetime for export
 */
export function formatDateTime(date: Date | string): string {
  return new Date(date).toLocaleString("en-IN");
}
