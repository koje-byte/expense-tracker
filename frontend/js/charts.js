const categoryData = new Map();

async function loadPieChart() {
    const res = await fetch("http://localhost:5000/api/expenses");
    const data = await res.json();


    data.forEach(element => {
        const category = element.category;
        const amount = Number(element.amount);

        if (!categoryData.has(category)) {
            categoryData.set(category, {
                total: 0,
                count: 0
            });
        }

        const categoryInfo = categoryData.get(category);

        categoryInfo.total += amount;
        categoryInfo.count++;
    });

    const labels = [...categoryData.keys()];

    const totals = [...categoryData.values()]
        .map(item => item.total);

    const counts = [...categoryData.values()]
        .map(item => item.count);

 

    const ctx = document.getElementById("expensePieChart");

 

    new Chart(ctx, {
        type: "pie",

        data: {
            labels: labels,

            datasets: [{
                label: "Expenses",
                data: totals
            }]
        },

        options: {
            responsive: true,

            plugins: {
                legend: {
                    position: "bottom"
                },

                title: {
                    display: true,
                    text: "Expenses by Category"
                }
            }
        }
    });

    const ctx2 = document.getElementById("expensePieChart2");

new Chart(ctx2, {
        type: "pie",

        data: {
            labels: labels,

            datasets: [{
                label: "count",
                data: counts
            }]
        },

        options: {
            responsive: true,

            plugins: {
                legend: {
                    position: "bottom"
                },

                title: {
                    display: true,
                    text: "Counts by Category"
                }
            }
        }
    });

}



loadPieChart();