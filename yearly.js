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

    let yearlyTotal = {};
    
    // Remove headers
    sheetData.shift();

    // Process each row
    sheetData.forEach(row => {
        let date = new Date(row[0]);
        let year = date.getFullYear();
        let type = row[1].replace(/\s+/g, ' ').trim(); // Normalize spaces
        let amount = parseInt(row[2]) || 0;

        if (!yearlyTotal[year]) {
            yearlyTotal[year] = {
                totalCollection: 0,
                totalRent: 0,
                totalCurrent: 0,
                totalInvestment: 0,
                totalSalary: 0,
                totalProfit: 0
            };
        }

        // Categorizing and summing data
        if (/(Women|Gold|Fruit) Daily Collection/.test(type)) {
            yearlyTotal[year].totalCollection += amount;
        }
        if (/(Women|Gold|House|Fruit) Rent/.test(type)) {
            yearlyTotal[year].totalRent += amount;
        }
        if (/(Women|Gold|House|Fruit) Current/.test(type)) {
            yearlyTotal[year].totalCurrent += amount;
        }

        // Corrected Investment Calculation
        if (/Women\s+Investment/i.test(type)) {
            yearlyTotal[year].totalInvestment += amount;
        }
        if (/Gold\s+Investment/i.test(type)) {
            yearlyTotal[year].totalInvestment += amount;
        }
        if (/Fruit\s+Investment/i.test(type)) {
            yearlyTotal[year].totalInvestment += amount;
        }

        if (/(Gold|Fruit) Salary/.test(type)) {
            yearlyTotal[year].totalSalary += amount;
        }

        // Calculate final profit
        yearlyTotal[year].totalProfit = 
            yearlyTotal[year].totalCollection - 
            (yearlyTotal[year].totalRent + yearlyTotal[year].totalCurrent + yearlyTotal[year].totalInvestment + yearlyTotal[year].totalSalary);
    });

    // Display results
    const dataContainer = document.getElementById("data-container");
    dataContainer.innerHTML = "";

    Object.keys(yearlyTotal).sort((a, b) => b - a).forEach(year => {
        let yearData = yearlyTotal[year];
        let tableHTML = `
            <div class="year-section">
                <table>
                    <tr style="font-weight:bold; background:#e6f7ff; color: blue;">
                        <td>Total Collection in ${year}</td>
                        <td><strong>${yearData.totalCollection}</strong></td>
                    </tr>
                    <tr style="background:#f7f7f7; color: red;">
                        <td>Total Rent in ${year}</td>
                        <td>${yearData.totalRent}</td>
                    </tr>
                    <tr style="background:#f7f7f7; color: red;">
                        <td>Total Current in ${year}</td>
                        <td>${yearData.totalCurrent}</td>
                    </tr>
                    <tr style="background:#f7f7f7; color: black;">
                        <td><strong>Total Investment in ${year}</strong></td>
                        <td>${yearData.totalInvestment}</td>
                    </tr>
                    <tr style="background:#f7f7f7; color: purple;">
                        <td>Total Salary in ${year}</td>
                        <td>${yearData.totalSalary}</td>
                    </tr>
                    <tr style="font-weight:bold; background:#dff0d8; color: green;">
                        <td><strong>Final Total Profit</strong></td>
                        <td><strong>${yearData.totalProfit}</strong></td>
                    </tr>
                </table>
            </div>
        `;
        dataContainer.innerHTML += tableHTML;
    });
}

// Fetch data on page load
fetchData();
