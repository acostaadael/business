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

<script setup>
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

const props = defineProps({
  // Report title displayed above the table
  title: {
    type: String,
    default: '',
  },
  // Array of data objects to display
  data: {
    type: Array,
    required: true,
  },
  // Column configuration: [{ key: 'name', label: 'Full Name' }, ...]
  columns: {
    type: Array,
    required: true,
  },
  // Base filename for exported files (without extension)
  filename: {
    type: String,
    default: 'report',
  },
});

// Escape CSV fields (commas, quotes, newlines)
const escapeCSV = field => {
  if (field === null || field === undefined) return '';
  const str = String(field);
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
};

// Export as CSV
const exportToCSV = () => {
  const headers = props.columns.map(col => col.label);
  const rows = props.data.map(row => props.columns.map(col => escapeCSV(col.render ? col.render(row) : row[col.key])));
  const csvContent = [headers, ...rows].map(row => row.join(',')).join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.href = url;
  link.setAttribute('download', `${props.filename}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

// Export as JSON
const exportToJSON = () => {
  const jsonContent = JSON.stringify(props.data, null, 2);
  const blob = new Blob([jsonContent], { type: 'application/json;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.href = url;
  link.setAttribute('download', `${props.filename}.json`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

// Export as PDF (requires jspdf and jspdf-autotable)
const exportToPDF = () => {
  const doc = new jsPDF();

  const headers = props.columns.map(col => col.label);
  const rows = props.data.map(row => props.columns.map(col => (col.render ? col.render(row) : row[col.key])));

  let finalY = 10; // start position

  if (props.title) {
    doc.setFontSize(16);
    doc.setFont(undefined, 'bold');
    doc.text(props.title, 10, finalY);
    finalY += 10; // add some space after title
  }

  autoTable(doc, {
    head: [headers],
    body: rows,
    startY: finalY,
    margin: { top: finalY }, // ensure table starts after title
  });
  doc.save(`${props.filename}.pdf`);
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
  margin-left: 10px; /* space between buttons */
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
