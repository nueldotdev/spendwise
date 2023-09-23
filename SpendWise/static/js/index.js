
let accountId = '';
let pin = '';
let firstName = '';
let lastName = '';
let balance = '';
let profileImg = '';
let userId = 0;
let activeWallet = '';

// const csrftoken = document.querySelector('[name=csrfmiddlewaretoken]').value;

const ulContained = document.getElementById('listing-list');
const hiddenTabs = document.querySelector('.tab-listing');
const walletName = document.getElementById('wallet-icon-name');


document.addEventListener('DOMContentLoaded', () => {
	getInfo().then(() => {
		sideUserInfo();
		getWallets();
	});
});


const tabs = document.querySelectorAll('.tab-listing li');

// Add a click event listener to each <li> element
tabs.forEach(tab => {
	tab.addEventListener('click', handleTabClick);
});


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

				// Example: Display some of the data in the console
				console.log(`Account ID: ${accountId}`);
				console.log(`First Name: ${firstName}`);
				console.log(`Last Name: ${lastName}`);
				console.log(`Balance: ${balance}`);
				console.log(`Profile Img: ${profileImg}`);

				// You can use the data to update the DOM or perform other actions here
				resolve(data);
			}).catch(error => {
				// Reject the Promise with the error
				reject(error);
			});
	});
}


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
                                                        <span><i class="fa-solid fa-naira-sign"></i>${wallet.budget}</span>    
                                                    </p>
                                                    <p class="tot-bal">
                                                        <span class="sub-note">Balance</span>
                                                        <span><i class="fa-solid fa-naira-sign"></i>${wallet.balance}</span>
                                                    </p>
                                                </div>
                                            </button>`
					displayCards.appendChild(containWallet)
				});

				let containWallet = document.createElement('div');
				containWallet.classList.add('wallet-box-cont');
				containWallet.innerHTML = `<button class="wallet-box" onclick="buildWallet()">
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
				containWallet.innerHTML = `<button class="wallet-box" onclick="buildWallet()">
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

function getWalletDetails(params, param1) {
	const overviewScreen = document.getElementById('overview-screen');
	const displayCards = document.getElementById('home-main');
	const entryCardSect = document.getElementById('entry-screen');
	const incomeScreen = document.getElementById('income-screen');
	const expenseScreen = document.getElementById('expense-screen');

	let catIcons = [];
	let catName = [];

	fetch('/api/categories', {
		method: 'GET'
	}).then(response => {
		if (response.ok) {
			return response.json();
		} else {
			throw new Error('Failed to fetch data');
		}
	}).then(data => {
		for (let index = 0; index < data.length; index++) {
			catIcons.push(data[index].icon);
			catName.push(data[index].name);
		}
	})

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

		let chartSection = document.createElement('div');
		chartSection.classList.add('chart-section');
		chartSection.innerHTML = `<div class="finances">
                                        <div class="monies">
                                            <section class="out">
                                                <div class="money-div">
                                                    <i class="fa-solid fa-naira-sign"></i>
                                                    <h4>${data.total_expense}</h4>
                                                </div>
                                                <p>Out</p>
                                            </section>
                                            <section class="balance">
                                                <div class="money-div">
                                                    <i class="fa-solid fa-naira-sign"></i>
                                                    <h3>${data.balance}</h3>
                                                </div>
                                                <p>Balance</p>
                                            </section>
                                            <section class="in">
                                                <div class="money-div">
                                                    <i class="fa-solid fa-naira-sign"></i>
                                                    <h4>${data.total_income}</h4>
                                                </div>
                                                <p>In</p>
                                            </section>
                                        </div>
                                        <div class="btn-add-ons">
                                            <button class="expense">
                                                <i class="fa-solid fa-plus"></i>
                                                Add Expense
                                            </button>
                                            <button class="income">
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
                                                    <span class="limit">
                                                        <i class="fa-solid fa-naira-sign"></i>
                                                        ${data.total_expense}
                                                    </span>
                                                    <span class="sub-note">Spent</span>
                                                </p>
                                            </div>
                                        </div>
                                        <div class="budget-spent">
                                            <div class="set-budget">
                                                <p class="limit">
                                                    <span><i class="fa-solid fa-naira-sign"></i></span>
                                                    ${data.budget}
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

	let incomes = [];
	let expenses = [];

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


			let entryCard = document.createElement('div');
			entryCard.classList.add('entry-card');
			entryCard.innerHTML = `<div class="card-details">
                                        <img src="${catIcons[data.category]}" alt="">
                                        <div class="entry-det">
                                            <p>${data.title}</p>
                                            <p class="sub-note">${catName[data.category]} • ${formattedDate}</p>
                                        </div>
                                    </div>
                                    <div class="card-amount">
                                        <p><span>${type}</span><i class="fa-solid fa-naira-sign"></i>${data.amount}</p>
                                    </div>`

			entryCardSect.appendChild(entryCard)
		});
		incomeEx(incomes, incomeScreen, catIcons, catName);
		incomeEx(expenses, expenseScreen, catIcons, catName);
		console.log("Incomes = " + incomes);
		console.log("Expenses = " + expenses);
	})
}

function incomeEx(params, param1, param2, param3) {
	params.forEach(data => {
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

		let entryCard = document.createElement('div');
		entryCard.classList.add('entry-card');
		entryCard.innerHTML = `<div class="card-details">
                                        <img src="${param2[data.category]}" alt="">
                                        <div class="entry-det">
                                            <p>${data.title}</p>
                                            <p class="sub-note">${param3[data.category]} • ${formattedDate}</p>
                                        </div>
                                    </div>
                                    <div class="card-amount">
                                        <p><span>${type}</span><i class="fa-solid fa-naira-sign"></i>${data.amount}</p>
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

// listItems.forEach(item => {
//     item.addEventListener('click', handleTabClick);
// });


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




function progressCircle(param, param1, param2) {
	const fuller = document.querySelector(`${param}`);

	let getPercent = (param2 / param1) * 100

	fuller.style.background = `background: conic-gradient( var(--sw-green) ${getPercent}%, var(--mslight-bg) 0% );`
}