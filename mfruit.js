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
    let yearlyTotal = {};
    let lastMonthOfYear = {};

    // Remove headers
    sheetData.shift();

    // Process each row
    sheetData.forEach(row => {
        let date = new Date(row[0]);
        let year = date.getFullYear();
        let month = date.toLocaleString('en-us', { month: 'short' });
        let yearMonth = `${month} ${year}`;
        let type = row[1].replace(/\s+/g, ' ').trim().toLowerCase(); // Normalize category names
        let amount = parseInt(row[2]) || 0;

        if (!monthlyData[yearMonth]) {
            monthlyData[yearMonth] = {
                totalCollection: 0,
                rent: 0,
                current: 0,
                investment: 0,
                salary: 0, // Added Salary
                profit: 0
            };
        }

        // Ensure correct processing of categories
        if (type.includes("fruit daily collection")) {
            monthlyData[yearMonth].totalCollection += amount;
        } else if (type.includes("fruit rent")) {
            monthlyData[yearMonth].rent += amount;
        } else if (type.includes("fruit current")) {
            monthlyData[yearMonth].current += amount;
        } else if (type.includes("fruit investment")) {
            monthlyData[yearMonth].investment += amount;
        } else if (type.includes("fruit salary")) {  // New Salary Condition
            monthlyData[yearMonth].salary += amount;
        }

        // Recalculate monthly profit
        monthlyData[yearMonth].profit =
            monthlyData[yearMonth].totalCollection -
            (monthlyData[yearMonth].rent + monthlyData[yearMonth].current + monthlyData[yearMonth].investment + monthlyData[yearMonth].salary);

        // Update yearly totals
        if (!yearlyTotal[year]) {
            yearlyTotal[year] = {
                totalCollection: 0,
                rent: 0,
                current: 0,
                investment: 0,
                salary: 0, // Added Salary
                profit: 0
            };
        }

        if (type.includes("fruit daily collection")) {
            yearlyTotal[year].totalCollection += amount;
        }
        if (type.includes("fruit rent")) yearlyTotal[year].rent += amount;
        if (type.includes("fruit current")) yearlyTotal[year].current += amount;
        if (type.includes("fruit investment")) yearlyTotal[year].investment += amount;
        if (type.includes("fruit salary")) yearlyTotal[year].salary += amount; // Added Salary

        yearlyTotal[year].profit =
            yearlyTotal[year].totalCollection -
            (yearlyTotal[year].rent + yearlyTotal[year].current + yearlyTotal[year].investment + yearlyTotal[year].salary);
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
                <div class="year-title">${monthYear}: <strong style="color: blue;">${data.totalCollection}</strong></div>
                <table>
                    <tr><td>Total Monthly Collection:</td><td><strong style="color: blue;">${data.totalCollection}</strong></td></tr>
                    <tr><td>fruit Rent:</td><td>${data.rent}</td></tr>
                    <tr><td>fruit Current:</td><td>${data.current}</td></tr>
                    <tr><td>fruit Investment:</td><td>${data.investment}</td></tr>
                    <tr><td>fruit Salary:</td><td>${data.salary}</td></tr>
                    <tr style="font-weight:bold; color: green;"><td>Monthly Profit:</td><td>${data.profit}</td></tr>
                </table>
        `;

        // Insert the yearly total at the top of the last month of that year
        if (lastMonthOfYear[year] === monthYear) {
            let yearData = yearlyTotal[year];
            tableHTML = `
                <div class="year-section">
                    <table>
                        <tr style="font-weight:bold; background:#e6f7ff; color: blue;">
                            <td>Total Collection in ${year}</td>
                            <td><strong>${yearData.totalCollection}</strong></td>
                        </tr>
                        <tr style="background:#f7f7f7; color: red;">
                            <td>Total Rent in ${year}</td>
                            <td>${yearData.rent}</td>
                        </tr>
                        <tr style="background:#f7f7f7; color: red;">
                            <td>Total Current in ${year}</td>
                            <td>${yearData.current}</td>
                        </tr>
                        <tr style="background:#f7f7f7; color: black;">
                            <td><strong>Total Investment in ${year}</strong></td>
                            <td>${yearData.investment}</td>
                        </tr>
                        <tr style="background:#f7f7f7; color: purple;">
                            <td>Total Salary in ${year}</td>
                            <td>${yearData.salary}</td>
                        </tr>
                        <tr style="font-weight:bold; background:#dff0d8; color: green;">
                            <td>Total Yearly Profit</td>
                            <td><strong>${yearData.profit}</strong></td>
                        </tr>
                    </table>
                </div>
            ` + tableHTML; // Prepend yearly summary
        }

        tableHTML += `</div>`; // Close div

        dataContainer.innerHTML += tableHTML;
    });
}

// Fetch data on page load
fetchData();
