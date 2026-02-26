<template>
  <div class="report-table-container">
    <div class="report-header">
      <h2 v-if="title" class="report-title">{{ title }}</h2>
      <div class="export-options">
        <button @click="exportToCSV">Export CSV</button>
        <button @click="exportToJSON">Export JSON</button>
        <button @click="exportToPDF">Export PDF</button>
      </div>
    </div>

    <table class="report-table">
      <thead>
        <tr>
          <th v-for="column in columns" :key="column.key">
            {{ column.label }}
          </th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(row, rowIndex) in data" :key="rowIndex">
          <td v-for="column in columns" :key="column.key">
            {{ column.render ? column.render(row) : row[column.key] }}
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup lang="ts">
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

// Define column structure
interface Column {
  key: string;
  label: string;
  render: any;
}

// Define props with types
const props = defineProps<{
  title?: string;
  data: any[];
  columns: Column[];
  filename?: string;
}>();

// Escape CSV fields (commas, quotes, newlines)
const escapeCSV = (field: any): string => {
  if (field === null || field === undefined) return '';
  const str = String(field);
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
};

// Export as CSV
const exportToCSV = (): void => {
  const headers = props.columns.map(col => col.label);
  const rows = props.data.map(row => props.columns.map(col => escapeCSV(col.render ? col.render(row) : row[col.key])));
  const csvContent = [headers, ...rows].map(row => row.join(',')).join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.href = url;
  link.setAttribute('download', `${props.filename || 'report'}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

// Export as JSON
const exportToJSON = (): void => {
  const jsonContent = JSON.stringify(props.data, null, 2);
  const blob = new Blob([jsonContent], { type: 'application/json;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.href = url;
  link.setAttribute('download', `${props.filename || 'report'}.json`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

// Export as PDF (requires jspdf and jspdf-autotable)
const exportToPDF = (): void => {
  const doc = new jsPDF();
  const headers = props.columns.map(col => col.label);
  const rows = props.data.map(row => props.columns.map(col => String(col.render ? col.render(row) : row[col.key])));

  // Start position
  let finalY = 10;

  // Add title if provided
  if (props.title) {
    doc.setFontSize(16);
    doc.setFont(undefined, 'bold');
    doc.text(props.title, 10, finalY);
    finalY += 10; // space after title
  }

  // Generate table
  autoTable(doc, {
    head: [headers],
    body: rows,
    startY: finalY,
    margin: { top: finalY },
  });

  doc.save(`${props.filename || 'report'}.pdf`);
};
</script>

<style scoped>
.report-table-container {
  font-family: Arial, sans-serif;
  margin: 20px;
}

.report-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
  flex-wrap: wrap;
}

.report-title {
  margin: 0;
  font-size: 1.5rem;
  color: #333;
}

.export-options button {
  margin-left: 10px;
  padding: 5px 10px;
  cursor: pointer;
  background-color: #4caf50;
  color: white;
  border: none;
  border-radius: 4px;
}

.export-options button:hover {
  background-color: #45a049;
}

.report-table {
  width: 100%;
  border-collapse: collapse;
}

.report-table th,
.report-table td {
  border: 1px solid #ddd;
  padding: 8px;
  text-align: left;
}

.report-table th {
  background-color: #f2f2f2;
  font-weight: bold;
}
</style>
