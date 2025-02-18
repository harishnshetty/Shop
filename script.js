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

    let yearlyData = {};

    // Remove headers
    sheetData.shift();

    // Process each row and group by year
    sheetData.forEach(row => {
        let date = new Date(row[0]);
        let year = date.getFullYear();
        let type = row[1].trim().replace(/\s+/g, " "); // Normalize spaces
        let amount = parseInt(row[2]) || 0;

        if (!yearlyData[year]) {
            yearlyData[year] = {
                womenInvestment: 0,
                goldInvestment: 0,
                fruitInvestment: 0,
                totalInvestment: 0,
                rent: 0,
                current: 0,
                womenCollection: 0,
                goldCollection: 0,
                fruitCollection: 0,
                totalCollection: 0, // Collection from 3 shops
                salary: 0, // Salary (including Gold & Fruit Salary)
                totalSpent: 0, // Total Spent = Salary + Rent + Current
                totalProfit: 0 // Profit = Collection - (Investment + Spent)
            };
        }

        // Categorize data properly
        if (type.includes("Women investment")) {
            yearlyData[year].womenInvestment += amount;
        } else if (type.includes("Gold investment")) {
            yearlyData[year].goldInvestment += amount;
        } else if (type.includes("Fruit Investment")) {
            yearlyData[year].fruitInvestment += amount;
        } else if (type.includes("Rent")) {
            yearlyData[year].rent += amount;
        } else if (type.includes("Current")) {
            yearlyData[year].current += amount;
        } else if (type === "Women Daily Collection") {
            yearlyData[year].womenCollection += amount;
        } else if (type === "Gold Daily Collection") {
            yearlyData[year].goldCollection += amount;
        } else if (type === "Fruit Daily Collection") {
            yearlyData[year].fruitCollection += amount;
        } else if (type === "Salary" || type === "Gold Salary" || type === "Fruit Salary") {
            yearlyData[year].salary += amount; // Adding Gold & Fruit Salary
        }
    });

    // Compute totals for each year
    Object.keys(yearlyData).forEach(year => {
        let data = yearlyData[year];

        // Calculate Total Investment
        data.totalInvestment =
            data.womenInvestment +
            data.goldInvestment +
            data.fruitInvestment;

        // Calculate Total Collection
        data.totalCollection =
            data.womenCollection +
            data.goldCollection +
            data.fruitCollection;

        // Calculate Total Spent
        data.totalSpent =
            data.salary +
            data.rent +
            data.current;

        // Calculate Total Earned Profit
        data.totalProfit = data.totalCollection - (data.totalInvestment + data.totalSpent);
    });

    // Sort years in descending order (latest first)
    let sortedYears = Object.keys(yearlyData).sort((a, b) => b - a);

    // Display results
    const dataContainer = document.getElementById("data-container");
    dataContainer.innerHTML = "";

    sortedYears.forEach(year => {
        let data = yearlyData[year];

        let tableHTML = `
            <div class="year-section">
                <div class="year-title">Year: ${year}</div>
                <table>
                    <tr><th>Category</th><th>Amount</th></tr>
                    <tr><td style="color:green; font-weight:bold;"><strong>Total Earned Profit</strong></td><td style="color:green; font-weight:bold;">${data.totalProfit}</td></tr>
                    <tr><td>Women Investment</td><td>${data.womenInvestment}</td></tr>
                    <tr><td>Gold Investment</td><td>${data.goldInvestment}</td></tr>
                    <tr><td>Fruit Investment</td><td>${data.fruitInvestment}</td></tr>
                    <tr><td style="color:red;"><strong>Total Investment</strong></td><td style="color:red;"><strong>${data.totalInvestment}</strong></td></tr>
                    
                    <tr><td>Women Collected in Yearly</td><td>${data.womenCollection}</td></tr>
                    <tr><td>Gold Shop Collected in Yearly</td><td>${data.goldCollection}</td></tr>
                    <tr><td>Fruit Shop Collected in Yearly</td><td>${data.fruitCollection}</td></tr>
                    <tr><td style="color:red;"><strong>Total Collected in All 3 Shops</strong></td><td style="color:red;"><strong>${data.totalCollection}</strong></td></tr>
                    <tr><td>Salary</td><td>${data.salary}</td></tr>
                    <tr><td>Rent</td><td>${data.rent}</td></tr>
                    <tr><td>Current</td><td>${data.current}</td></tr>
                    <tr><td style="color:red;"><strong>Total Spent in Year</strong></td><td style="color:red;"><strong>${data.totalSpent}</strong></td></tr>
                </table>
            </div>
        `;

        dataContainer.innerHTML += tableHTML;
    });
}

// Fetch data on page load
fetchData();
