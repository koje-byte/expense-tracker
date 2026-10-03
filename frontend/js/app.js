const body=document.getElementById("expenseBody");

let editingId = null;
let allExpenses = [];
let SortedByAmount=false;
let filterApplied=false;


function showAlert(message, type = "danger") {
  document.getElementById("alertBox").innerHTML = `
    <div class="alert alert-${type} alert-dismissible fade show" role="alert">
      ${message}
      <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    </div>`;
}

function setLoading(isLoading) {
  document.getElementById("spinner").classList.toggle("d-none", !isLoading);
}

function RenderSummary(expenses) {
  let total =0;
  expenses.forEach(e => {
    total+=e.amount
  })

  document.getElementById("totalAmount").textContent = `$${total.toFixed(2)}`;
  document.getElementById("expenseCount").textContent = expenses.length;

  if (expenses.length === 0) {
    document.getElementById("highestExpense").textContent = "$0.00";
    document.getElementById("highestInfo").textContent = "No expenses yet";
    return;
  }

    let highest = expenses[0];
    expenses.forEach(e => {
    if(e.amount>highest.amount)
    {
      highest=e
    }
  })

  document.getElementById("highestExpense").textContent = `$${Number(highest.amount).toFixed(2)}`;
  document.getElementById("highestInfo").textContent =
    `${highest.title} · ${highest.category} · ${String(highest.date).slice(0, 10)}`;
}

async function RenderTable(expense) {
  body.innerHTML = "";
    expense.forEach(element => {

        const tr = document.createElement("tr");
        const tdTitle =document.createElement("td");
        const tdAmount =document.createElement("td");
        
        const tdCategory =document.createElement("td");
        const tdDate =document.createElement("td");
        const tdActions = document.createElement("td");
        tdActions.className = "text-end";

        const editBtn = document.createElement("button");
        editBtn.className = "btn btn-sm btn-outline-secondary me-1";
        editBtn.setAttribute("data-bs-toggle","modal");
        editBtn.setAttribute("data-bs-target","#exampleModal");
        editBtn.textContent = "Edit";
        editBtn.addEventListener("click", () => {
        editingId = element.id;
        document.getElementById("titleE").value = element.title;
        document.getElementById("amountE").value = element.amount;
        document.getElementById("categoryE").value = element.category;
        document.getElementById("dateE").value = element.date;
                                                });
                                                
        const deleteBtn = document.createElement("button");
        deleteBtn.className = "btn btn-sm btn-outline-danger";
        deleteBtn.textContent = "Delete";
        deleteBtn.addEventListener("click", () => DeleteExpense(element.id));
        tdTitle.innerHTML=`${element.title}`;
        tdAmount.innerHTML=`${element.amount}$`;
        const badge = document.createElement("span");

      switch (element.category) {
        case "Food":
        badge.className = "badge bg-success";
        break;

        case "Transport":
        badge.className = "badge bg-primary";
        break;

        case "Entertainment":
        badge.className = "badge bg-warning text-dark";
        break;

      case "Bills":
        badge.className = "badge bg-danger";
        break;

      case "Other":
       badge.className = "badge bg-secondary";
        break;
}

badge.textContent = element.category;
tdCategory.appendChild(badge);
        
        tdDate.innerHTML=`${element.date}`;
        
        tr.appendChild(tdTitle);
        tr.appendChild(tdAmount);
        tr.appendChild(tdCategory);
        tr.appendChild(tdDate);
        tdActions.appendChild(editBtn);
        tdActions.appendChild(deleteBtn);
        tr.appendChild(tdActions);
        body.appendChild(tr);

    });
    
}

async function getData() {
  const url = "http://localhost:5000/api/expenses";
  setLoading(true);
  try {

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Response status: ${response.status}`);
    }
    allExpenses = await response.json();
    RenderTable(allExpenses);
    RenderSummary(allExpenses);
  } catch (error) {
    showAlert("Could not load expenses. Server is off");
  } finally {
    setLoading(false);
  }
}

function applyFilter() {
    const category = document.getElementById("filterCategory").value;

    let list;

    if (category === "All") {
        list = [...allExpenses];
    } else {
        list = allExpenses.filter(e => e.category === category);
    }

    if (SortedByAmount) {
        list.sort((a, b) => Number(b.amount) - Number(a.amount));
    }

    RenderTable(list);
}

function SortByAmount() {
    SortedByAmount = !SortedByAmount;
    applyFilter();
}


async function AddNewExpense() {
  const title = document.getElementById("title").value.trim();
  const category = document.getElementById("category").value;
  const amount = document.getElementById("amount").value;
  const date = document.getElementById("date").value;
  setLoading(true);
  try {
    const response = await fetch("http://localhost:5000/api/expenses", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, amount, category, date })
    });

  const data = await response.json();

if (!response.ok) {
    throw new Error(data.error || "Could not save the expense.");
}

    document.getElementById("expenseForm").reset();
    showAlert("Expense added.", "success");
    await getData();                                     
  } catch (error) {
    showAlert(error.message);
  }
  finally {
    setLoading(false);
  }
}

async function EditExpense() {
  const title = document.getElementById("titleE").value.trim();
  const category = document.getElementById("categoryE").value;
  const amount = document.getElementById("amountE").value;
  const date = document.getElementById("dateE").value;

  setLoading(true);

  try {
    const response = await fetch(`http://localhost:5000/api/expenses/${editingId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, amount, category, date })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Could not update the expense.");
    }

    bootstrap.Modal.getInstance(
      document.getElementById("exampleModal")
    ).hide();

    showAlert("Expense updated.", "success");

    await getData();

  } catch (error) {
    showAlert(error.message);
  } finally {
    setLoading(false);
  }
}

async function DeleteExpense(id) {
  if (!confirm("Delete this expense?")) return; 
  setLoading(true);  
  try {
    const response = await fetch(`http://localhost:5000/api/expenses/${id}`, {
      method: "DELETE"
    });
    const data = await response.json()
    if (!response.ok) throw new Error(data.error || "Could not delete the expense.");

    showAlert("Expense deleted.", "success");  
    await getData();                                    
  } catch (error) {
    showAlert(error.message);

  }
  finally {
    setLoading(false); 
  }
}

getData();

document.getElementById("expenseForm").addEventListener("submit", (e) => {
  e.preventDefault();
  AddNewExpense();
});

document.getElementById("sv-change").addEventListener("click", EditExpense);
document.getElementById("filterCategory").addEventListener("change", applyFilter);

const toggleButton = document.getElementById("theme-toggle");

toggleButton.addEventListener("click", () => {
  const html = document.documentElement;
  const currentTheme= html.getAttribute("data-bs-theme");
  if(currentTheme == "light")
  {
    html.setAttribute("data-bs-theme","dark");
    toggleButton.innerHTML='<i class="bi bi-sun"></i>';
  }
  else
  {
    html.setAttribute("data-bs-theme","light");
    toggleButton.innerHTML='<i class="bi bi-moon"></i>'
  }

});

const sortBTn=document.getElementById("SortAmount")
sortBTn.addEventListener("click", SortByAmount);

