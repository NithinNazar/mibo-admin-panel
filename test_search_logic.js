// Test search logic
const appointments = [
  { patient_name: "Nithin Nazar", patient_phone: "919048810697", clinician_name: "Jerry P Mathew", patient_mrn: "001" },
  { patient_name: "Jomin John", patient_phone: "919037402900", clinician_name: "Dr Z", patient_mrn: "123456" },
  { patient_name: "Joke Jose", patient_phone: "56438839292", clinician_name: "Jerry P Mathew", patient_mrn: "304375" },
];

function testSearch(searchTerm) {
  const search = searchTerm.toLowerCase().trim();
  const filtered = appointments.filter(
    (apt) =>
      (apt.patient_name && apt.patient_name.toLowerCase().includes(search)) ||
      (apt.patient_phone && apt.patient_phone.includes(search)) ||
      (apt.clinician_name && apt.clinician_name.toLowerCase().includes(search)) ||
      (apt.patient_mrn && apt.patient_mrn.toLowerCase().includes(search)),
  );
  
  console.log(`\nSearch: "${searchTerm}"`);
  console.log(`Results: ${filtered.length}`);
  filtered.forEach(apt => console.log(`  - ${apt.patient_name}`));
  return filtered;
}

// Test cases
testSearch("nithin");
testSearch("Nithin");
testSearch("NITHIN");
testSearch("jomin");
testSearch("Jerry");
testSearch("123456");
