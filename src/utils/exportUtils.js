// src/utils/exportUtils.js

export const exportAsText = (content, filename = 'export.txt') => {
  const element = document.createElement('a');
  element.setAttribute('href', `data:text/plain;charset=utf-8,${encodeURIComponent(content)}`);
  element.setAttribute('download', filename);
  element.style.display = 'none';
  document.body.appendChild(element);
  element.click();
  document.body.removeChild(element);
};

export const exportAsJSON = (data, filename = 'export.json') => {
  const element = document.createElement('a');
  element.setAttribute('href', `data:application/json;charset=utf-8,${encodeURIComponent(JSON.stringify(data, null, 2))}`);
  element.setAttribute('download', filename);
  element.style.display = 'none';
  document.body.appendChild(element);
  element.click();
  document.body.removeChild(element);
};

export const exportAsCSV = (data, filename = 'export.csv') => {
  let csv = '';
  
  // Add headers if data is array of objects
  if (Array.isArray(data) && data.length > 0 && typeof data[0] === 'object') {
    csv = Object.keys(data[0]).join(',') + '\n';
    data.forEach(row => {
      csv += Object.values(row).map(v => `"${v}"`).join(',') + '\n';
    });
  } else {
    csv = data.toString();
  }

  const element = document.createElement('a');
  element.setAttribute('href', `data:text/csv;charset=utf-8,${encodeURIComponent(csv)}`);
  element.setAttribute('download', filename);
  element.style.display = 'none';
  document.body.appendChild(element);
  element.click();
  document.body.removeChild(element);
};

// Simple PDF export (text-based)
export const exportAsPDF = (content, filename = 'export.pdf') => {
  // For full PDF functionality, you'd need a library like jsPDF
  // This is a placeholder that exports as text
  console.log('For PDF export, install: npm install jspdf html2canvas');
  exportAsText(content, filename.replace('.pdf', '.txt'));
};
