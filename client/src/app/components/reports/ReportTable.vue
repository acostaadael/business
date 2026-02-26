<template>
  <div class="report-table-container">
    <div class="report-header">
      <h2 v-if="title" class="report-title">{{ title }}</h2>
      <div class="export-options">
        <b-dropdown id="dropdown-1" :text="t$('entity.action.export.main')" class="m-md-2">
          <b-dropdown-item @click="exportToPDF">{{ t$('entity.action.export.format.pdf') }}</b-dropdown-item>
          <b-dropdown-item @click="exportToExcel">{{ t$('entity.action.export.format.excel') }}</b-dropdown-item>
        </b-dropdown>
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
      <tfoot v-if="totalColumns.length > 0">
        <tr>
          <td v-for="(column, index) in columns" :key="column.key">
            <template v-if="index === 0">{{ totalLabel }}</template>
            <template v-else-if="totalColumns.includes(column.key)">
              {{ totals[column.key] }}
            </template>
            <template v-else></template>
          </td>
        </tr>
      </tfoot>
    </table>
  </div>
</template>

<script setup lang="ts">
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { useI18n } from 'vue-i18n';
import { computed } from 'vue';
const { t: t$ } = useI18n();

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
  totalColumns?: string[]; // keys of columns to total
  totalLabel?: string;
}>();

// Default values
const totalColumns = props.totalColumns || [];
const totalLabel = props.totalLabel || 'Total';

// Compute totals for specified columns
const totals = computed(() => {
  const result: Record<string, string> = {};
  totalColumns.forEach(key => {
    const sum = props.data.reduce((acc, row) => {
      const val = row[key];
      const num = typeof val === 'number' ? val : parseFloat(val);
      return acc + (isNaN(num) ? 0 : num);
    }, 0);
    result[key] = `${sum} $`;
  });
  return result;
});

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

  // Add totals row if totalColumns is not empty
  if (totalColumns.length > 0) {
    const totalsRow = props.columns.map((col, index) => {
      if (index === 0) {
        return totalLabel;
      } else if (totalColumns.includes(col.key)) {
        return String(totals.value[col.key]);
      } else {
        return '';
      }
    });
    rows.push(totalsRow);
  }

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

// Export as Excel (XLSX)
const exportToExcel = (): void => {
  // Prepare data for worksheet: headers + rows
  const headers = props.columns.map(col => col.label);
  const rows = props.data.map(row => props.columns.map(col => (col.render ? col.render(row) : row[col.key])));
  const worksheetData: any[] = [headers, ...rows];

  // Add totals row if totalColumns is not empty
  if (totalColumns.length > 0) {
    const totalsRow = props.columns.map((col, index) => {
      if (index === 0) {
        return totalLabel;
      } else if (totalColumns.includes(col.key)) {
        return totals.value[col.key];
      } else {
        return ''; // empty for non-total columns
      }
    });
    worksheetData.push(totalsRow);
  }

  // Create worksheet and workbook
  const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Report');

  // Generate Excel file and trigger download
  XLSX.writeFile(workbook, `${props.filename || 'report'}.xlsx`);
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

.report-table tfoot td {
  font-weight: bold;
  background-color: #e8e8e8;
}
</style>
