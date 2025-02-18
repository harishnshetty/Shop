const API_KEY = "AIzaSyBwnJTt3tZV61gebywzYb8MIDk4CTcleHQ";
const SHEET_ID = "1IdRDA-dAloPS7kmClC0zQfH2nyBVJN8aEWNbUHAc3KE";
// const RANGE = "A1:B16";

const RANGE = "A1:D"; // Fetching all rows


// Define categories for Investment and Rent
const INVESTMENT_CATEGORIES = [
    "Women Shop investment",
    "One Gram Gold investment",
    "Fruit Shop Investment"
];

const RENT_CATEGORIES = [
    "Women Shop Rent",
    "Gold Rent",
    "Fruit Rent"
];

const SALARY_CATEGORY = "Salary"; // Single category for Salary

async function fetchData() {
    try {
        const response = await fetch(
            `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${RANGE}?key=${API_KEY}`
        );
        const data = await response.json();
        console.log("Fetched Data:", data); // Debugging: See API response
        return data.values.slice(1); // Skip headers
    } catch (error) {
        console.error("Error fetching data:", error);
        return [];
    }
}

async function renderGrid() {
    const investmentGrid = document.getElementById("investmentGrid");
    const rentGrid = document.getElementById("rentGrid");
    const totalInvestmentEl = document.getElementById("totalInvestment");
    const totalRentEl = document.getElementById("totalRent");
    const totalSalaryEl = document.getElementById("totalSalary");
    const grandTotalEl = document.getElementById("grandTotal");

    const data = await fetchData();
    if (!data) return;

    let totalInvestment = 0;
    let totalRent = 0;
    let totalSalary = 0;

    let investmentHTML = "";
    let rentHTML = "";

    data.forEach(row => {
        const category = row[1]; // Column B: Category
        const amount = parseFloat(row[2]) || 0; // Column C: Amount

        if (INVESTMENT_CATEGORIES.includes(category)) {
            totalInvestment += amount;
            investmentHTML += `
                <div class="card">
                    <h3>${category}</h3>
                    <p>$${amount.toLocaleString()}</p>
                </div>
            `;
        } else if (RENT_CATEGORIES.includes(category)) {
            totalRent += amount;
            rentHTML += `
                <div class="card">
                    <h3>${category}</h3>
                    <p>$${amount.toLocaleString()}</p>
                </div>
            `;
        } else if (category === SALARY_CATEGORY) {
            totalSalary += amount;
        }
    });

    investmentGrid.innerHTML = investmentHTML;
    rentGrid.innerHTML = rentHTML;

    // Calculate Grand Total
    let grandTotal = totalInvestment + totalRent + totalSalary;

    // Update totals in the UI
    totalInvestmentEl.textContent = `$${totalInvestment.toLocaleString()}`;
    totalRentEl.textContent = `$${totalRent.toLocaleString()}`;
    totalSalaryEl.textContent = `$${totalSalary.toLocaleString()}`;
    grandTotalEl.textContent = `$${grandTotal.toLocaleString()}`;
}

document.addEventListener("DOMContentLoaded", renderGrid);
