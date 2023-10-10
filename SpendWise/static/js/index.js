// Some of the important user stuff in the frontend lol
let accountId = '';
let pin = '';
let firstName = '';
let lastName = '';
let balance = '';
let profileImg = '';
let userId = 0;
let activeWallet = '';
let csrfToken = ''

// const csrftoken = document.querySelector('[name=csrfmiddlewaretoken]').value;

const ulContained = document.getElementById('listing-list');
const hiddenTabs = document.querySelector('.tab-listing');
const walletName = document.getElementById('wallet-icon-name');


document.addEventListener('DOMContentLoaded', () => {
	fetch("api/token")
	.then(response => response.json())
	.then(data => {
		// Accessing the CSRF token from the JSON response
		csrfToken = data.csrf_token;
	})
	.catch(error => {
		console.error("Error fetching CSRF token:", error);
	});

	getInfo().then(() => {
		sideUserInfo();
		getWallets();
		catFetch();
	});
});


let catIcons = [];
let catName = [];

//Fetching categories list
async function catFetch() {
	fetch('/api/categories', {
	method: 'GET'
	}).then(response => {
		if (response.ok) {
			return response.json();
		} else {
			throw new Error('Failed to fetch data');
		}
	}).then(data => {
		// Saving the categories and their Icons
		for (let index = 0; index < data.length; index++) {
			catIcons.push(data[index].icon);
			catName.push(data[index].name);
		}
	})
}


const tabs = document.querySelectorAll('.tab-listing li');

// so this has another variable assigned to it but it works as is, so why change it?
// Add a click event listener to each <li> element
tabs.forEach(tab => {
	tab.addEventListener('click', handleTabClick);
});


// Self explanatory, getting the user's info and stuff
function getInfo() {
	return new Promise((resolve, reject) => {
		fetch('/api/current-account', {
			method: 'GET'
		}).then(response => {
			if (response.ok) {
				return response.json();
			} else {
				throw new Error('Failed to fetch data');
			}
		})
			.then(data => {
				// Access and use the data fields
				accountId = data.id;
				pin = data.pin;
				firstName = data.first_name;
				lastName = data.last_name;
				balance = data.balance;
				profileImg = data.profile_img;
				userId = data.user_id;

				// Debugging: Display some of the data in the console
				// console.log(`Account ID: ${accountId}`);
				// console.log(`First Name: ${firstName}`);
				// console.log(`Last Name: ${lastName}`);
				// console.log(`Balance: ${balance}`);
				// console.log(`Profile Img: ${profileImg}`);

				// You can use the data to update the DOM or perform other actions here
				resolve(data);
			}).catch(error => {
				// Reject the Promise with the error
				reject(error);
			});
	});
}


// Rendering user details
function sideUserInfo() {
	const sideScreen = document.getElementById('side-screen-inner');

	let sideTop = document.createElement('div');
	sideTop.classList.add('side-top');
	sideTop.innerHTML = `<div class="side-top">
                            <div class="name-cont">
                                <h3>${firstName}</h3>
                            </div>
                            <div class="img-cont">
                                <div class="img">
                                    <img src="${profileImg}" alt="" srcset="">
                                </div>
                            </div>
                        </div>`

	sideScreen.append(sideTop)

	console.log('Working')
}


//This fetches user's wallets and renders them on the screen
function getWallets() {
	const displayCards = document.getElementById('home-main');
	displayCards.innerHTML = ``;

	fetch('/api/wallets', {
		method: 'GET'
	}).then(response => {
		if (response.ok) {
			return response.json();
		} else {
			throw new Error('Failed to fetch data');
		}
	})
		.then(data => {
			// Handle the data
			console.log('Wallet data:', data);
			if (data.length > 0) {
				data.forEach(wallet => {
					const dateObject = new Date(wallet.last_entry);

					// Get the month as a number (0-11)
					const monthNumber = dateObject.getMonth();

					// Map the month number to its name
					const months = [
						"Jan", "Feb", "Mar", "Apr",
						"May", "Jun", "Jul", "Aug",
						"Sept", "Oct", "Nov", "Dec"
					];
					const monthName = months[monthNumber];

					const year = dateObject.getFullYear();
					// const month = String(dateObject.getMonth() + 1).padStart(2, "0"); // Month is zero-based
					const day = String(dateObject.getDate()).padStart(2, "0");

					const formattedDate = `${day}-${monthName}-${year}`;


					let containWallet = document.createElement('div');
					containWallet.classList.add('wallet-box-cont');
					containWallet.innerHTML = `<button class="wallet-box" data-wallet-id="${wallet.id}" onclick="getWalletDetails(${wallet.id}, '${wallet.name}')">
                                                <p class="date-add">${formattedDate}</p>
                                                <h2>${wallet.name}</h2>
                                                <div class="info">
                                                    <p class="budget">
                                                        <span class="sub-note">Budget</span>
                                                        <span><i class="fa-solid fa-naira-sign"></i>${parseFloat(wallet.budget)}</span>    
                                                    </p>
                                                    <p class="tot-bal">
                                                        <span class="sub-note">Balance</span>
                                                        <span><i class="fa-solid fa-naira-sign"></i>${parseFloat(wallet.balance)}</span>
                                                    </p>
                                                </div>
                                            </button>`
					displayCards.appendChild(containWallet)
				});

				let containWallet = document.createElement('div');
				containWallet.classList.add('wallet-box-cont');
				containWallet.innerHTML = `<button class="wallet-box" onclick="getForm('wallet-form')">
                                            <div class="info-empty">
                                                <img src="https://img.icons8.com/color/48/000000/plus--v1.png" alt="Add wallet icon"/>
                                                <p>Add a wallet</p>
                                            </div>
                                        </button>`
				displayCards.appendChild(containWallet)
				// Update your page with the retrieved wallet data
			} else {
				let containWallet = document.createElement('div');
				containWallet.classList.add('wallet-box-cont');
				containWallet.innerHTML = `<button class="wallet-box" onclick="getForm('wallet-form')">
                                            <div class="info-empty">
                                                <img src="https://img.icons8.com/color/48/000000/plus--v1.png" alt="Add wallet icon"/>
                                                <p>Add a wallet</p>
                                            </div>
                                        </button>`
				displayCards.appendChild(containWallet)
			}
		})
		.catch(error => {
			// Handle errors
			console.error('Fetch error:', error);
		});

}


let incomes = [];
let expenses = [];

// Accessing the elements
const overviewScreen = document.getElementById('overview-screen');
const displayCards = document.getElementById('home-main');
const entryCardSect = document.getElementById('entry-screen');
const incomeScreen = document.getElementById('income-screen');
const expenseScreen = document.getElementById('expense-screen');



function getWalletDetails(params, param1) {
	//NOTE: (param) => wallet.id
	//NOTE: (param1) => wallet.name

	const getIdentifier = document.querySelectorAll('.identified_wallet');
	const setWalletName = document.querySelectorAll('.named_wallet');
	getIdentifier.forEach(element => {
		element.innerText = params //put wallet id in transaction entry-form
	});
	setWalletName.forEach(element => {
		element.innerText = param1 //put wallet name in transaction entry-form
	});


	overviewScreen.innerHTML = ``;

	fetch(`/api/wallets/${params}`, {
		method: 'GET'
	}).then(response => {
		if (response.ok) {
			return response.json();
		} else {
			throw new Error('Failed to fetch data');
		}
	}).then(data => {
		let getPercent = (data.total_expense / data.budget) * 100
		let displayBal;
		let displayExp;
		let displayInc;

		console.log(`${displayBal} , ${displayExp}, ${displayInc}`)
		if (data.balance > 0) {
			displayBal = parseFloat(data.balance)
		} else {
			displayBal = parseFloat(data.balance)
			displayBal = displayBal.toFixed(2)
		} console.log(`Balance = ${displayBal}`)

		if (data.total_expense > 0) {
			displayExp = parseFloat(data.total_expense)
		} else {
			displayExp = parseFloat(data.total_expense)
			displayExp = displayExp.toFixed(2)
		}console.log(`Expense = ${displayExp}`)

		if (data.total_income > 0) {
			displayInc = parseFloat(data.total_income)
		} else {
			displayInc = parseFloat(data.total_income)
			displayInc = displayInc.toFixed(2)
		}console.log(`Income = ${displayInc}`)


		// HTML for the budget spending progress circle 
		let chartSection = document.createElement('div');
		chartSection.classList.add('chart-section');
		chartSection.innerHTML = `<div class="finances">
                                        <div class="monies">
                                            <section class="out">
                                                <div class="money-div">
                                                    <i class="fa-solid fa-naira-sign"></i>
                                                    <h4 id="total-expense-entered">${displayExp}</h4>
                                                </div>
                                                <p>Out</p>
                                            </section>
                                            <section class="balance">
                                                <div class="money-div">
                                                    <i class="fa-solid fa-naira-sign"></i>
                                                    <h3 id="total-balance">${displayBal}</h3>
                                                </div>
                                                <p>Balance</p>
                                            </section>
                                            <section class="in">
                                                <div class="money-div">
                                                    <i class="fa-solid fa-naira-sign"></i>
                                                    <h4 id="total-income-entered">${displayInc}</h4>
                                                </div>
                                                <p>In</p>
                                            </section>
                                        </div>
                                        <div class="btn-add-ons">
                                            <button class="expense" onClick="getForm('expense-form')">
                                                <i class="fa-solid fa-plus"></i>
                                                Add Expense
                                            </button>
                                            <button class="income" onClick="getForm('income-form')">
                                                <i class="fa-solid fa-plus"></i>
                                                Add Income
                                            </button>
                                        </div>
                                    </div>
                                    <div class="finance-progress">
                                        <h4>Budget</h4>
                                        <div class="circle-progress">
                                            <div class="progress-cont" style="background: conic-gradient( var(--sw-green) ${getPercent}%, var(--mslight-bg) 0% );">
                                                <p class="amount-spent">
                                                    <span class="limit" id="limit-bg-spt">
                                                        <i class="fa-solid fa-naira-sign"></i>
                                                        ${displayExp}
                                                    </span>
                                                    <span class="sub-note">Spent</span>
                                                </p>
                                            </div>
                                        </div>
                                        <div class="budget-spent">
                                            <div class="set-budget">
                                                <p class="limit">
                                                    <span><i class="fa-solid fa-naira-sign"></i></span>
                                                    ${parseFloat(data.budget)}
                                                </p>
                                                <p class="sub-note">Monthly Limit</p>
                                            </div>
                                            <div class="left-budget">
                                                <p class="limit"><span><i class="fa-solid fa-naira-sign"></i></span>${data.budget - data.total_expense}</p>
                                                <p class="sub-note">Remaining</p>
                                            </div>
                                        </div>
                                    </div>`

		overviewScreen.appendChild(chartSection);
		displayCards.classList.remove('active');
		overviewScreen.classList.add('active');
	});

	hiddenTabs.classList.remove('hide')
	walletName.innerText = `${param1}`

	fetch(`/api/wallets/${params}/entries`, {
		method: 'GET'
	}).then(response => {
		if (response.ok) {
			return response.json();
		} else {
			throw new Error('Failed to fetch data');
		}
	}).then(data => {
		for (let index = 0; index < data.length; index++) {
			if (data[index].type == 'Income') {
				incomes.push(data[index])
			} else {
				expenses.push(data[index])
			}

		}

		data.forEach(data => {
			// Formatting the date of the entry correctly 
			const dateObject = new Date(data.entry);

			// Get the month as a number (0-11)
			const monthNumber = dateObject.getMonth();

			// Map the month number to its name
			const months = [
				"Jan", "Feb", "Mar", "Apr",
				"May", "Jun", "Jul", "Aug",
				"Sept", "Oct", "Nov", "Dec"
			];
			const monthName = months[monthNumber];

			const year = dateObject.getFullYear();
			// const month = String(dateObject.getMonth() + 1).padStart(2, "0"); // Month is zero-based
			const day = String(dateObject.getDate()).padStart(2, "0");

			const formattedDate = `${day}-${monthName}-${year}`;
			let type = ''

			if (data.type == 'Income') {
				type = `<i class="fa-solid fa-plus"></i>`
			} else {
				type = `<i class="fa-solid fa-minus"></i>`
			}

			// Creating cards for all entries
			let entryCard = document.createElement('div');
			entryCard.classList.add('entry-card');
			entryCard.innerHTML = `<div class="card-details">
                                        <img src="${catIcons[data.category - 1]}" alt="">
                                        <div class="entry-det">
                                            <p>${data.title}</p>
                                            <p class="sub-note">${catName[data.category - 1]} • ${formattedDate}</p>
                                        </div>
                                    </div>
                                    <div class="card-amount">
                                        <p><span>${type}</span><i class="fa-solid fa-naira-sign"></i>${parseFloat(data.amount)}</p>
                                    </div>`

			entryCardSect.appendChild(entryCard)
		});
		incomeEx(incomes, incomeScreen);
		incomeEx(expenses, expenseScreen);
		console.log("Incomes = " + incomes);
		console.log("Expenses = " + expenses);
	})
}


// Accessing all entry values passed in param[0]
function incomeEx(params, param1) {
	params.forEach(data => {

		// Formatting the date of the entry correctly again!
		const dateObject = new Date(data.entry);

		// Get the month as a number (0-11)
		const monthNumber = dateObject.getMonth();
	
		// Map the month number to its name
		const months = [
			"Jan", "Feb", "Mar", "Apr",
			"May", "Jun", "Jul", "Aug",
			"Sept", "Oct", "Nov", "Dec"
		];
		const monthName = months[monthNumber];

		const year = dateObject.getFullYear();
		// const month = String(dateObject.getMonth() + 1).padStart(2, "0"); // Month is zero-based
		const day = String(dateObject.getDate()).padStart(2, "0");

		const formattedDate = `${day}-${monthName}-${year}`;

		let type = ''

		// Assigning Icons to entry types, minus for an expense and plus for an income
		if (data.type == 'Income') {
			type = `<i class="fa-solid fa-plus"></i>`
		} else {
			type = `<i class="fa-solid fa-minus"></i>`
		}
		
		// Creating the card for the entry
		let entryCard = document.createElement('div');
		entryCard.classList.add('entry-card');
		entryCard.innerHTML = `<div class="card-details">
                                        <img src="${catIcons[data.category - 1]}" alt="">
                                        <div class="entry-det">
                                            <p>${data.title}</p>
                                            <p class="sub-note">${catName[data.category - 1]} • ${formattedDate}</p>
                                        </div>
                                    </div>
                                    <div class="card-amount">
                                        <p><span>${type}</span><i class="fa-solid fa-naira-sign"></i>${parseFloat(data.amount)}</p>
                                    </div>`
		param1.appendChild(entryCard)
		console.log(`${params} Done!`)
	})
}


// Get references to the elements
const listItems = document.querySelectorAll('#listing-list li');
const upButton = document.getElementById('list-up');
const downButton = document.getElementById('list-down');
let movement = 25;
const divs = document.querySelectorAll('.main-contained > div');


// Function to handle clicking on a tab
function handleTabClick(event) {
	const clickedTab = event.target;
	const targetDivId = clickedTab.getAttribute('data-target');
	const targetDiv = document.getElementById(targetDivId);

	// Remove "active" class from all tabs and divs
	listItems.forEach(item => item.classList.remove('active'));
	divs.forEach(div => div.classList.remove('active'));

	// Add "active" class to the clicked tab and its corresponding div
	clickedTab.classList.add('active');
	targetDiv.classList.add('active');
}


// Function to handle moving the "active" class up
function moveActiveUp() {
	const currentActiveIndex = Array.from(listItems).findIndex(li => li.classList.contains('active'));
	if (currentActiveIndex > 0) {
		if (movement > 25) {
			movement = 25;
		} else {
			movement += 25;
		}

		listItems[currentActiveIndex].classList.remove('active');
		listItems[currentActiveIndex - 1].classList.add('active');
		handleTabClick({ target: listItems[currentActiveIndex - 1] });
		ulContained.style.transform = `translateY(${movement}%)`;
	}
}


// Function to handle moving the "active" class down
function moveActiveDown() {
	const currentActiveIndex = Array.from(listItems).findIndex(li => li.classList.contains('active'));
	if (currentActiveIndex < listItems.length - 1) {
		movement -= 25;

		listItems[currentActiveIndex].classList.remove('active');
		listItems[currentActiveIndex + 1].classList.add('active');
		handleTabClick({ target: listItems[currentActiveIndex + 1] });
		ulContained.style.transform = `translateY(${movement}%)`;
	}
}

// Add event listeners to the "Up" and "Down" buttons
// upButton.addEventListener('click', moveActiveUp);
upButton.addEventListener('touchstart', moveActiveUp);
// downButton.addEventListener('click', moveActiveDown);
downButton.addEventListener('touchstart', moveActiveDown);



//This is for the progress shown on the budget spending 
function progressCircle(param, param1, param2) {
	const fuller = document.querySelector(`${param}`);

	let getPercent = (param2 / param1) * 100

	fuller.style.background = `background: conic-gradient( var(--sw-green) ${getPercent}%, var(--mslight-bg) 0% );`
}


// Section for entry forms
const entryForm = document.querySelector('.entry-forms');
const categoryEntries = document.querySelectorAll('.category_select');
const formBackBtns = document.querySelectorAll('.back-arrow-btn');

function getForm(params) {
	const fromToGet = document.getElementById(params);
	fromToGet.style.display = 'flex';
	entryForm.classList.add('active');

	if (params == "wallet-form") {
		
	} else {	
		// Adding categories to the select tag within the forms
		categoryEntries.forEach(elementCategory => {
			for (let index = 0; index < catName.length; index++) {
				const element = catName[index];
				let options = document.createElement('option');
				options.value = element;
				options.innerText = element; 
				elementCategory.append(options)
			}
		});
	}
}


formBackBtns.forEach(btn => {
	btn.addEventListener('click', () => {
		btn.parentElement.style.display = 'none';
		entryForm.classList.remove('active');
	})
});


// Handling the income and expense entries
const expenseForm = document.getElementById('expense-form-main');
const incomeForm = document.getElementById('income-form-main');
const walletForm = document.getElementById('wallet-form-main');


//Expense form on submit
expenseForm.addEventListener('submit', function (e) {
    e.preventDefault(); // Prevent the form from submitting normally
    // const token = document.getElementById('token').innerText;
    // console.log(token)
    
    // Get form data
	const name = document.getElementById('named-ex').innerText;
	const id = document.getElementById('expense-id').innerText;
	const title = document.getElementById('title-ex').value
    const amount = parseFloat(document.getElementById('amount-ex').value) // Make sure it's a number
    const category = document.getElementById('category_income-ex').value



	// const formData = new FormData(this);
	const formData = {
        title: title,
        amount: amount,
        category: category
    };
    

    fetch(`/api/wallets/${id}/expense`, {
        method: 'POST',
        headers: {
            'X-CSRFToken': csrfToken,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
    })
    .then(response => response.json())
    .then(data => {
        // Handle the response from the server
        const resultDiv = document.getElementById('expense-result');
        if (data.message === 'Entry was successful') {
			console.log(data.message)
            resultDiv.innerHTML = '<p>Entry was successful!</p>';
			const loader = document.getElementById('loading-bar');
			loader.classList.add('active')

			// Getting the expense thingy
			const expenseUpdate = document.getElementById("total-expense-entered");
			const balanceUpdate = document.getElementById("total-balance");
			const bgSpent = document.getElementById('limit-bg-spt');

			// Updating the expense thingy
			expenseUpdate.innerText = parseFloat(expenseUpdate.innerText) + amount;
			balanceUpdate.innerText = parseFloat(balanceUpdate.innerText) - amount;
			bgSpent.innerText = parseFloat(bgSpent.innerText) + amount;


			//Forming the date, I am in pain😭
			const today = new Date();

			// Get the day, month, and year
			const day = today.getDate();
			const monthIndex = today.getMonth();
			const year = today.getFullYear();

			// Create an array of month names
			const monthNames = [
			'Jan', 'Feb', 'Mar', 'Apr', 
			'May', 'Jun', 'Jul', 'Aug', 
			'Sept', 'Oct', 'Nov', 'Dec'
			];

			// Get the month name based on the month index
			const monthName = monthNames[monthIndex];

			// Format the date
			const formattedDate = `${day}-${monthName}-${year}`;

			let icon;

			for (let index = 0; index < catName.length; index++) {
				const element = catName[index];
				if (element == category) {
					icon = catIcons[index]
				}
			}


			// Very very repetitive code here, hate to see it but I AM DRAINED
			// Creating cards for all entries
			let entryCard = document.createElement('div');
			entryCard.classList.add('entry-card');
			entryCard.innerHTML = `<div class="card-details">
										<img src="${icon}" alt="">
										<div class="entry-det">
											<p>${title}</p>
											<p class="sub-note">${category} • ${formattedDate}</p>
										</div>
									</div>
									<div class="card-amount">
										<p><span><i class="fa-solid fa-minus"></i></span><i class="fa-solid fa-naira-sign"></i>${amount}</p>
									</div>`
			const firstCont = entryCardSect.firstElementChild
			entryCardSect.insertBefore(entryCard, firstCont)
			const topExpense = expenseScreen.firstElementChild
			expenseScreen.insertBefore(entryCard, topExpense)

			loader.classList.remove('active')
        } else {
			console.log(data.message)
            resultDiv.innerHTML = '<p>Entry failed. Please check your input.</p>';
            // Display an error message to the user
        }
    })
    .catch(error => {
        console.error('Error:', error);
        // Handle errors, e.g., network issues
    });
});


// Income form on submit
incomeForm.addEventListener('submit', function (e) {
    e.preventDefault(); // Prevent the form from submitting normally
    // const token = document.getElementById('token').innerText;
    
    // Get form data
	const name = document.getElementById('named-ex').innerText;
	const id = document.getElementById('expense-id').innerText;

	const title = document.getElementById('title-in').value;
    const amount = parseFloat(document.getElementById('amount-in').value);
	const category = document.getElementById('category_income-in').value;


	const formData = {
        title: title,
        amount: amount, 
        category: category,
    };

    
    fetch(`/api/wallets/${id}/income`, {
        method: 'POST',
        headers: {
            'X-CSRFToken': csrfToken,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
    })
    .then(response => response.json())
    .then(data => {
        // Handle the response from the server
        const resultDiv = document.getElementById('income-result');
        if (data.message === 'Entry was successful') {
            resultDiv.innerHTML = '<p>Entry was successful!</p>';


			// Can't find a way to change the ui to show the updated details
			// So I'll do it manually and find a way later
			const loader = document.getElementById('loading-bar');
			loader.classList.add('active');

			// Getting the income thingy
			const incomeUpdate = document.getElementById("total-income-entered");
			const balanceUpdate = document.getElementById("total-balance");

			// Updating the income thingy
			incomeUpdate.innerText = parseFloat(incomeUpdate.innerText) + amount;
			balanceUpdate.innerText = parseFloat(balanceUpdate.innerText) + amount;

			//Forming the date, I am in pain😭
			const today = new Date();

			// Get the day, month, and year
			const day = today.getDate();
			const monthIndex = today.getMonth();
			const year = today.getFullYear();

			// Create an array of month names
			const monthNames = [
			'Jan', 'Feb', 'Mar', 'Apr', 
			'May', 'Jun', 'Jul', 'Aug', 
			'Sept', 'Oct', 'Nov', 'Dec'
			];

			// Get the month name based on the month index
			const monthName = monthNames[monthIndex];

			// Format the date
			const formattedDate = `${day}-${monthName}-${year}`;

			let icon;

			for (let index = 0; index < catName.length; index++) {
				const element = catName[index];
				if (element == category) {
					icon = catIcons[index]
				}
			}


			// Very very repetitive code here, hate to see it but I AM DRAINED
			// Creating cards for all entries
			let entryCard = document.createElement('div');
			entryCard.classList.add('entry-card');
			entryCard.innerHTML = `<div class="card-details">
										<img src="${icon}" alt="">
										<div class="entry-det">
											<p>${title}</p>
											<p class="sub-note">${category} • ${formattedDate}</p>
										</div>
									</div>
									<div class="card-amount">
										<p><span><i class="fa-solid fa-plus"></i></span><i class="fa-solid fa-naira-sign"></i>${amount}</p>
									</div>`
			const firstCont = entryCardSect.firstElementChild
			entryCardSect.insertBefore(entryCard, firstCont)
			console.log(`${entryCard} added to entries on top of ${firstCont}`)
			const topIncome = incomeScreen.firstElementChild
			incomeScreen.insertBefore(entryCard, topIncome)

			loader.classList.remove('active')
        } else {
            resultDiv.innerHTML = '<p>Entry failed. Please check your input.</p>';
            // Display an error message to the user
        }
    })
    .catch(error => {
        console.error('Error:', error);
        // Handle errors, e.g., network issues
    });
});


walletForm.addEventListener('submit', function (e) {
    e.preventDefault(); // Prevent the form from submitting normally
    // const token = document.getElementById('token').innerText;
    
    // Get form data
	const name = document.getElementById('wallet-name').value;
    const budget = document.getElementById('wallet-budget').value;


	const formData = {
        name: name,
        budget: budget,
    };

    
    fetch(`/api/wallets/create`, {
        method: 'POST',
        headers: {
            'X-CSRFToken': csrfToken,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
    })
    .then(response => response.json())
    .then(data => {
        const resultDiv = document.getElementById('wallet-result');
        if (data.message === 'Wallet Created') {
            resultDiv.innerHTML = '<p>Wallet was Created!</p>';
            window.location.href = '/home';
        } else {
            resultDiv.innerHTML = '<p>Entry failed. Please check your input.</p>';
            // Display an error message to the user
        }
    })
    .catch(error => {
        console.error('Error:', error);
        // Handle errors, e.g., network issues
    });
});