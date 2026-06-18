// Comprehensive search filter test
const appointments = [
  { id: 176, patient_name: "Nithin Nazar", patient_phone: "919048810697", clinician_name: "Jerry P Mathew", patient_mrn: "001", scheduled_start_at: "2026-06-18T16:10:00", status: "CANCELLED", centre_id: "1" },
  { id: 223, patient_name: "Joke Jose", patient_phone: "56438839292", clinician_name: "Jerry P Mathew", patient_mrn: "304375", scheduled_start_at: "2026-06-18T16:10:00", status: "CONFIRMED", centre_id: "1" },
  { id: 228, patient_name: "Meghna Sudhan", patient_phone: "89211497194", clinician_name: "Anet Augustine", patient_mrn: "304662", scheduled_start_at: "2026-06-18T15:15:00", status: "CONFIRMED", centre_id: "1" },
  { id: 238, patient_name: "Jomin John", patient_phone: "919037402900", clinician_name: "Dr Z", patient_mrn: "123456", scheduled_start_at: "2026-06-19T10:10:00", status: "CONFIRMED", centre_id: "1" },
  { id: 136, patient_name: "Jomin John", patient_phone: "919037402900", clinician_name: "Dr Z", patient_mrn: "123456", scheduled_start_at: "2026-06-24T09:30:00", status: "CANCELLED", centre_id: "1" },
];

function applyFilters(searchTerm, timeFilter, statusFilter, centreFilter) {
  let filtered = [...appointments];
  
  // SEARCH HAS HIGHEST PRIORITY
  if (searchTerm && searchTerm.trim()) {
    const search = searchTerm.toLowerCase().trim();
    filtered = filtered.filter(
      (apt) =>
        (apt.patient_name && apt.patient_name.toLowerCase().includes(search)) ||
        (apt.patient_phone && apt.patient_phone.includes(search)) ||
        (apt.clinician_name && apt.clinician_name.toLowerCase().includes(search)) ||
        (apt.patient_mrn && apt.patient_mrn.toLowerCase().includes(search)),
    );
  } else {
    // NO SEARCH - Apply time filters
    if (timeFilter !== "ALL") {
      const now = new Date("2026-06-18T20:00:00"); // Current time for testing
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

      filtered = filtered.filter((apt) => {
        const aptDate = new Date(apt.scheduled_start_at);
        const aptDay = new Date(
          aptDate.getFullYear(),
          aptDate.getMonth(),
          aptDate.getDate(),
        );

        if (timeFilter === "CURRENT") {
          return aptDay.getTime() === today.getTime();
        } else if (timeFilter === "PAST") {
          return aptDay < today;
        } else if (timeFilter === "UPCOMING") {
          return aptDay > today;
        }
        return true;
      });
    }
  }

  // Status filter - always apply
  if (statusFilter !== "ALL") {
    filtered = filtered.filter((apt) => apt.status === statusFilter);
  }

  // Centre filter - always apply
  if (centreFilter !== "ALL") {
    filtered = filtered.filter(
      (apt) => String(apt.centre_id) === String(centreFilter),
    );
  }

  return filtered;
}

function test(description, searchTerm, timeFilter, statusFilter, centreFilter, expectedCount, expectedNames) {
  const result = applyFilters(searchTerm, timeFilter, statusFilter, centreFilter);
  const pass = result.length === expectedCount;
  console.log(`\n${pass ? "✅" : "❌"} ${description}`);
  console.log(`   Search: "${searchTerm}", Time: ${timeFilter}, Status: ${statusFilter}, Centre: ${centreFilter}`);
  console.log(`   Expected: ${expectedCount}, Got: ${result.length}`);
  if (result.length > 0) {
    console.log(`   Results: ${result.map(r => r.patient_name).join(", ")}`);
  }
  if (expectedNames) {
    const actualNames = result.map(r => r.patient_name).sort().join(",");
    const expected = expectedNames.sort().join(",");
    if (actualNames !== expected) {
      console.log(`   ⚠️  Expected names: ${expected}`);
      console.log(`   ⚠️  Actual names: ${actualNames}`);
    }
  }
}

console.log("=== COMPREHENSIVE SEARCH FILTER TESTS ===\n");

// Test 1: Search "nithin" - should ignore time filter
test("Search 'nithin' (case insensitive)", "nithin", "CURRENT", "ALL", "ALL", 1, ["Nithin Nazar"]);

// Test 2: Search "Nithin" - case insensitive
test("Search 'Nithin' (exact case)", "Nithin", "CURRENT", "ALL", "ALL", 1, ["Nithin Nazar"]);

// Test 3: Search "NITHIN" - case insensitive
test("Search 'NITHIN' (uppercase)", "NITHIN", "CURRENT", "ALL", "ALL", 1, ["Nithin Nazar"]);

// Test 4: Search "jomin" - should find 2 appointments (different dates)
test("Search 'jomin' (multiple results)", "jomin", "CURRENT", "ALL", "ALL", 2, ["Jomin John", "Jomin John"]);

// Test 5: Search cleared - should apply time filter (CURRENT = today = 3 appointments)
test("No search, time filter CURRENT", "", "CURRENT", "ALL", "ALL", 3, ["Nithin Nazar", "Joke Jose", "Meghna Sudhan"]);

// Test 6: Search with status filter
test("Search 'jomin' with CONFIRMED status", "jomin", "CURRENT", "CONFIRMED", "ALL", 1, ["Jomin John"]);

// Test 7: Search cleared with status filter
test("No search, CURRENT time, CONFIRMED status", "", "CURRENT", "CONFIRMED", "ALL", 2, ["Joke Jose", "Meghna Sudhan"]);

// Test 8: Search by phone number
test("Search by phone '919037402900'", "919037402900", "CURRENT", "ALL", "ALL", 2, ["Jomin John", "Jomin John"]);

// Test 9: Search by MRN
test("Search by MRN '123456'", "123456", "CURRENT", "ALL", "ALL", 2, ["Jomin John", "Jomin John"]);

// Test 10: Search by clinician name
test("Search by clinician 'Jerry'", "Jerry", "CURRENT", "ALL", "ALL", 2, ["Nithin Nazar", "Joke Jose"]);

// Test 11: Sequential searches (the problematic scenario)
console.log("\n=== SEQUENTIAL SEARCH TEST (Your Bug Scenario) ===");
let result1 = applyFilters("nithin", "ALL", "ALL", "ALL");
console.log(`1. Search "nithin": ${result1.length} results - ${result1.map(r => r.patient_name).join(", ")}`);

let result2 = applyFilters("jomin", "ALL", "ALL", "ALL");
console.log(`2. Search "jomin": ${result2.length} results - ${result2.map(r => r.patient_name).join(", ")}`);

let result3 = applyFilters("nithin", "ALL", "ALL", "ALL");
console.log(`3. Search "nithin" again: ${result3.length} results - ${result3.map(r => r.patient_name).join(", ")}`);

let result4 = applyFilters("", "CURRENT", "ALL", "ALL");
console.log(`4. Clear search (time=CURRENT): ${result4.length} results - ${result4.map(r => r.patient_name).join(", ")}`);

console.log("\n✅ All tests completed!");
