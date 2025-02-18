const sheetId = "1IdRDA-dAloPS7kmClC0zQfH2nyBVJN8aEWNbUHAc3KE";
const apiKey = "AIzaSyBwnJTt3tZV61gebywzYb8MIDk4CTcleHQ";
const sheetName = "Sheet1";
const url = `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${sheetName}?key=${apiKey}`;

async function fetchData() {
    try {
        const response = await fetch(url);
        const data = await response.json();
        processData(data.values);
    } catch (error) {
        console.error("Error fetching data:", error);
    }
}

function processData(sheetData) {
    if (!sheetData || sheetData.length === 0) return;

    let monthlyData = {};
    let yearlyTotal = {}; // Stores yearly totals
    let lastMonthOfYear = {}; // Stores the last available month for each year

    // Remove headers
    sheetData.shift();

    // Process each row
    sheetData.forEach(row => {
        let date = new Date(row[0]);
        let formattedDate = formatDate(date);
        let year = date.getFullYear();
        let month = date.toLocaleString('en-us', { month: 'short' }); // "Feb"
        let yearMonth = `${month} ${year}`; // Example: "Feb 2025"
        let type = row[1].trim();
        let amount = parseInt(row[2]) || 0;

        // Only process "Women Daily Collection"
        if (type === "Women Daily Collection") {
            if (!monthlyData[yearMonth]) {
                monthlyData[yearMonth] = {
                    totalCollection: 0,
                    entries: []
                };
            }

            // Add to total collection for the month
            monthlyData[yearMonth].totalCollection += amount;

            // Store individual entries
            monthlyData[yearMonth].entries.push({ formattedDate, amount });

            // Update yearly total
            if (!yearlyTotal[year]) {
                yearlyTotal[year] = 0;
            }
            yearlyTotal[year] += amount;
        }
    });

    // Determine the last month of each year
    Object.keys(monthlyData).forEach(monthYear => {
        let [, year] = monthYear.split(" ");
        if (!lastMonthOfYear[year] || new Date(`01-${monthYear}`) > new Date(`01-${lastMonthOfYear[year]}`)) {
            lastMonthOfYear[year] = monthYear;
        }
    });

    // Sort months in descending order (latest month first)
    let sortedMonths = Object.keys(monthlyData).sort((a, b) => new Date(`01-${b}`) - new Date(`01-${a}`));

    // Display results
    const dataContainer = document.getElementById("data-container");
    dataContainer.innerHTML = "";

    sortedMonths.forEach(monthYear => {
        let data = monthlyData[monthYear];
        let [month, year] = monthYear.split(" ");

        let tableHTML = `
            <div class="year-section">
                <div class="year-title"> ${monthYear}: <strong>${data.totalCollection}</strong></div>
                <table>
                    <tr><th>Date</th><th>Daily Collection</th></tr>
                    ${data.entries.map(entry => `<tr><td>${entry.formattedDate}</td><td>${entry.amount}</td></tr>`).join("")}
                </table>
        `;

        // Insert the yearly total at the top of the last month of that year
        if (lastMonthOfYear[year] === monthYear) {
            tableHTML = `
                <div class="year-section">
                    <table>
                        <tr style="font-weight:bold; background:#e6f7ff;">
                            <td>Total Collection in ${year}</td>
                            <td>  <strong>${yearlyTotal[year]}</strong></td>
                        </tr>
                    </table>
                </div>
                ` + tableHTML; // Prepend total collection to last month
        }

        tableHTML += `</div>`; // Close div

        dataContainer.innerHTML += tableHTML;
    });
}

// Helper function to format date as "01-Feb-2025"
function formatDate(date) {
    let day = String(date.getDate()).padStart(2, "0");
    let month = date.toLocaleString("en-us", { month: "short" });
    let year = date.getFullYear();
    return `${day}-${month}-${year}`;
}

// Fetch data on page load
fetchData();
