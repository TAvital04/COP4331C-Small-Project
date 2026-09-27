let userId = 0;
let firstName = "";
let lastName = "";
let currentContacts = [];
let searchTimeout = null;
let deleteContactId = 0;

function switchAuthTab(tab) {
	const isLogin = tab === "login";
	const loginTab = document.getElementById("tabLogin");
	const registerTab = document.getElementById("tabRegister");
	const loginForm = document.getElementById("loginForm");
	const registerForm = document.getElementById("registerForm");
	const authTitle = document.getElementById("authTitle");
	const authSubtitle = document.getElementById("authSubtitle");

	loginTab.classList.toggle("active", isLogin);
	registerTab.classList.toggle("active", !isLogin);
	loginTab.setAttribute("aria-selected", String(isLogin));
	registerTab.setAttribute("aria-selected", String(!isLogin));
	loginForm.classList.toggle("hidden", !isLogin);
	registerForm.classList.toggle("hidden", isLogin);

	authTitle.textContent = isLogin ? "Welcome Back" : "Create Your Account";
	authSubtitle.textContent = isLogin
		? "Manage your personal contact directory effortlessly"
		: "Join ContactSphere and organize your contacts effortlessly";
}

function showToast(message, type = "success") {
	const toast = document.createElement("div");
	toast.className = `toast toast-${type}`;
	toast.textContent = message;
	document.getElementById("toastContainer").appendChild(toast);

	setTimeout(() => toast.remove(), 3000);
}

function doLogin() {
	const login = document.getElementById("loginName").value.trim();
	const password = document.getElementById("loginPassword").value;

	if (!login || !password) {
		showToast("Username and password are required.", "error");
		return;
	}

	const xhr = new XMLHttpRequest();
	xhr.open("POST", "LAMPAPI/Login.php", true);
	xhr.setRequestHeader("Content-Type", "application/json");
	xhr.onreadystatechange = function () {
		if (xhr.readyState !== XMLHttpRequest.DONE) {
			return;
		}

		if (xhr.status !== 200) {
			showToast("Unable to sign in. Please try again.", "error");
			return;
		}

		let response;
		try {
			response = JSON.parse(xhr.responseText);
		} catch (error) {
			showToast("The sign-in response was invalid.", "error");
			return;
		}

		if (!response || Number(response.id) <= 0 || response.error) {
			showToast(response && response.error ? response.error : "Invalid username or password.", "error");
			return;
		}

		userId = Number(response.id);
		firstName = response.firstName || "";
		lastName = response.lastName || "";
		saveCookie();
		showToast(`Welcome, ${firstName} ${lastName}`.trim() + "!", "success");
		showDashboard();
	};
	xhr.onerror = function () {
		showToast("Network error. Please try again.", "error");
	};

	xhr.send(JSON.stringify({ login, password }));
}

function doRegister() {
	const firstNameValue = document.getElementById("regFirstName").value.trim();
	const lastNameValue = document.getElementById("regLastName").value.trim();
	const login = document.getElementById("regLogin").value.trim();
	const password = document.getElementById("regPassword").value;

	if (!firstNameValue || !lastNameValue || !login || !password) {
		showToast("All registration fields are required.", "error");
		return;
	}

	const xhr = new XMLHttpRequest();
	xhr.open("POST", "LAMPAPI/Register.php", true);
	xhr.setRequestHeader("Content-Type", "application/json");
	xhr.onreadystatechange = function () {
		if (xhr.readyState !== XMLHttpRequest.DONE) {
			return;
		}

		if (xhr.status !== 200) {
			showToast("Unable to register. Please try again.", "error");
			return;
		}

		let response;
		try {
			response = JSON.parse(xhr.responseText);
		} catch (error) {
			showToast("The registration response was invalid.", "error");
			return;
		}

		if (!response || Number(response.id) <= 0 || response.error) {
			showToast(response && response.error ? response.error : "Registration failed.", "error");
			return;
		}

		document.getElementById("registerForm").reset();
		document.getElementById("loginName").value = login;
		showToast("Account created successfully.", "success");
		switchAuthTab("login");
	};
	xhr.onerror = function () {
		showToast("Network error. Please try again.", "error");
	};

	xhr.send(JSON.stringify({
		firstName: firstNameValue,
		lastName: lastNameValue,
		login,
		password
	}));
}

function saveCookie() {
	const expires = new Date(Date.now() + 30 * 60 * 1000).toUTCString();
	const cookieOptions = `expires=${expires}; path=/`;

	document.cookie = `firstName=${encodeURIComponent(firstName)}; ${cookieOptions}`;
	document.cookie = `lastName=${encodeURIComponent(lastName)}; ${cookieOptions}`;
	document.cookie = `userId=${encodeURIComponent(userId)}; ${cookieOptions}`;
}

function readCookie() {
	const cookies = document.cookie.split(";");
	const cookieValues = {};

	cookies.forEach((cookie) => {
		const separatorIndex = cookie.indexOf("=");
		if (separatorIndex === -1) {
			return;
		}

		const name = cookie.slice(0, separatorIndex).trim();
		const value = cookie.slice(separatorIndex + 1).trim();
		cookieValues[name] = decodeURIComponent(value);
	});

	firstName = cookieValues.firstName || "";
	lastName = cookieValues.lastName || "";
	userId = Number.parseInt(cookieValues.userId, 10) || 0;

	if (userId > 0) {
		showDashboard();
	} else {
		showAuth();
	}
}

function showDashboard() {
	document.getElementById("authSection").classList.add("hidden");
	document.getElementById("dashboardSection").classList.remove("hidden");
	document.getElementById("navUserWidget").classList.remove("hidden");

	const displayName = `${firstName} ${lastName}`.trim() || "User";
	document.getElementById("navUserName").textContent = displayName;
	document.getElementById("userAvatar").textContent = displayName.charAt(0).toUpperCase();
	document.getElementById("dashboardGreeting").textContent = `Welcome, ${displayName}`;

	searchContacts("");
}

function showAuth() {
	document.getElementById("authSection").classList.remove("hidden");
	document.getElementById("dashboardSection").classList.add("hidden");
	document.getElementById("navUserWidget").classList.add("hidden");
}

function doLogout() {
	const expired = "expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/";
	document.cookie = `firstName=; ${expired}`;
	document.cookie = `lastName=; ${expired}`;
	document.cookie = `userId=; ${expired}`;

	userId = 0;
	firstName = "";
	lastName = "";
	showAuth();
}
function handleSearchInput() {
	const searchInput = document.getElementById("searchInput");
	const clearButton = document.getElementById("searchClearBtn");
	const query = searchInput.value.trim();

	clearButton.classList.toggle("hidden", query.length === 0);

	clearTimeout(searchTimeout);

	searchTimeout = setTimeout(() => {
		searchContacts(query);
	}, 250);
}

function clearSearch() {
	const searchInput = document.getElementById("searchInput");
	const clearButton = document.getElementById("searchClearBtn");

	searchInput.value = "";
	clearButton.classList.add("hidden");

	searchContacts("");
}

function searchContacts(query = "") {
	const xhr = new XMLHttpRequest();

	xhr.open("POST", "LAMPAPI/SearchContacts.php", true);
	xhr.setRequestHeader("Content-Type", "application/json");

	xhr.onreadystatechange = function () {
		if (xhr.readyState !== XMLHttpRequest.DONE) {
			return;
		}

		if (xhr.status !== 200) {
			showToast("Unable to load contacts.", "error");
			return;
		}

		let response;

		try {
    		response = JSON.parse(xhr.responseText);
		} catch (error) {
    		showToast("Invalid server response.", "error");
    		return;
		}

		if (response.error) {
			showToast(response.error, "error");
			return;
		}

		currentContacts =
			response.results ||
			response.contacts ||
			(Array.isArray(response) ? response : []);

		renderContacts(currentContacts, query);
	};

	xhr.onerror = function () {
		showToast("Network error. Please try again.", "error");
	};

	xhr.send(JSON.stringify({
		search: query,
		userId: userId
	}));
}

function renderContacts(contacts, query = "") {
	const container = document.getElementById("contactsGrid");

	container.innerHTML = "";

	if (!contacts || contacts.length === 0) {
		container.innerHTML = `
			<div id="empty-state" class="empty-state">
				<h3>No contacts found</h3>
				<p>
					${query
						? "Try another search."
						: "Add your first contact to get started."}
				</p>

				<button
					type="button"
					class="btn btn-primary"
					onclick="${query ? "clearSearch()" : "openContactModal('add')"}">
					${query ? "Clear Search" : "Add Contact"}
				</button>
			</div>
		`;

		return;
	}

	contacts.forEach((contact) => {
		const id =
			contact.id ??
			contact.ID ??
			0;

		const first =
			contact.firstName ??
			contact.FirstName ??
			"";

		const last =
			contact.lastName ??
			contact.LastName ??
			"";

		const phone =
			contact.phone ??
			contact.Phone ??
			"";

		const email =
			contact.email ??
			contact.Email ??
			"";

		const fullName = `${first} ${last}`.trim();

		const initials =
			`${first.charAt(0)}${last.charAt(0)}`.toUpperCase() || "?";

		const card = document.createElement("div");
		card.className = "contact-card";

		card.innerHTML = `
			<div class="contact-avatar">
				${escapeHtml(initials)}
			</div>

			<div class="contact-info">
				<h3>${escapeHtml(fullName || "Unnamed Contact")}</h3>
				<p>${escapeHtml(formatPhone(phone))}</p>
				<p>${escapeHtml(email)}</p>
			</div>

			<div class="contact-actions">
				<button
					type="button"
					class="btn btn-secondary edit-contact">
					Edit
				</button>

				<button
					type="button"
					class="btn btn-danger delete-contact">
					Delete
				</button>
			</div>
		`;

		card.querySelector(".edit-contact").onclick = function () {
			openContactModal("edit", Number(id));
		};

		card.querySelector(".delete-contact").onclick = function () {
			openDeleteModal(Number(id), fullName);
		};

		container.appendChild(card);
	});
}

function formatPhone(phone) {
	const digits = String(phone).replace(/\D/g, "");

	if (digits.length === 10) {
		return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
	}

	return phone;
}

function escapeHtml(value) {
	return String(value)
		.replace(/&/g, "&amp;")
		.replace(/</g, "&lt;")
		.replace(/>/g, "&gt;")
		.replace(/"/g, "&quot;")
		.replace(/'/g, "&#039;");
}

function openContactModal(mode, contactId = 0) {
	const modal = document.getElementById("contactModal");
	const form = document.getElementById("contactForm");
	const title = document.getElementById("modalTitle");

	form.reset();

	if (mode === "add") {
		title.textContent = "Add Contact";
		document.getElementById("contactId").value = 0;
	} else {
		const contact = currentContacts.find(
			(item) =>
				Number(item.id ?? item.ID) === Number(contactId)
		);

		if (!contact) {
			showToast("Contact not found.", "error");
			return;
		}

		title.textContent = "Edit Contact";

		document.getElementById("contactId").value =
			contact.id ??
			contact.ID ??
			0;

		document.getElementById("contactFirstName").value =
			contact.firstName ??
			contact.FirstName ??
			"";

		document.getElementById("contactLastName").value =
			contact.lastName ??
			contact.LastName ??
			"";

		document.getElementById("contactPhone").value =
			contact.phone ??
			contact.Phone ??
			"";

		document.getElementById("contactEmail").value =
			contact.email ??
			contact.Email ??
			"";
	}

	modal.classList.add("active");
}

function closeContactModal() {
	document.getElementById("contactModal").classList.remove("active");
}

function saveContact() {
	const contactId =
		Number(document.getElementById("contactId").value) || 0;

	const firstNameValue =
		document.getElementById("contactFirstName").value.trim();

	const lastNameValue =
		document.getElementById("contactLastName").value.trim();

	const phone =
		document.getElementById("contactPhone").value.trim();

	const email =
		document.getElementById("contactEmail").value.trim();

	if (!firstNameValue && !lastNameValue) {
		showToast("At least one name is required.", "error");
		return;
	}

	const endpoint =
		contactId > 0
			? "LAMPAPI/EditContact.php"
			: "LAMPAPI/AddContact.php";

	const data = {
		firstName: firstNameValue,
		lastName: lastNameValue,
		phone,
		email,
		userId
	};

	if (contactId > 0) {
		data.contactId = contactId;
	}

	const xhr = new XMLHttpRequest();

	xhr.open("POST", endpoint, true);
	xhr.setRequestHeader("Content-Type", "application/json");

	xhr.onreadystatechange = function () {
		if (xhr.readyState !== XMLHttpRequest.DONE) {
			return;
		}

		if (xhr.status !== 200) {
			showToast("Unable to save contact.", "error");
			return;
		}

		let response;

		try {
			response = JSON.parse(xhr.responseText);
		} catch (error) {
			showToast("Invalid server response.", "error");
			return;
		}

		if (response.error) {
			showToast(response.error, "error");
			return;
		}

		closeContactModal();

		showToast(
			contactId > 0
				? "Contact updated successfully."
				: "Contact added successfully."
		);

		searchContacts(
			document.getElementById("searchInput").value.trim()
		);
	};

	xhr.onerror = function () {
		showToast("Network error. Please try again.", "error");
	};

	xhr.send(JSON.stringify(data));
}

function openDeleteModal(id, name) {
	deleteContactId = Number(id);

	document.getElementById("deleteContactName").textContent =
		name || "this contact";

	document.getElementById("deleteModal").classList.add("active");
}

function closeDeleteModal() {
	deleteContactId = 0;
	document.getElementById("deleteModal").classList.remove("active");
}

function confirmDeleteContact() {
	if (deleteContactId <= 0) {
		return;
	}

	const contactIdToDelete = deleteContactId;

	const xhr = new XMLHttpRequest();

	xhr.open("POST", "LAMPAPI/DeleteContact.php", true);
	xhr.setRequestHeader("Content-Type", "application/json");

	xhr.onreadystatechange = function () {
		if (xhr.readyState !== XMLHttpRequest.DONE) {
			return;
		}

		if (xhr.status !== 200) {
			showToast("Unable to delete contact.", "error");
			return;
		}

		let response;

		try {
			response = JSON.parse(xhr.responseText);
		} catch (error) {
			showToast("Invalid server response.", "error");
			return;
		}

		if (response.error) {
			showToast(response.error, "error");
			return;
		}

		closeDeleteModal();
		showToast("Contact deleted successfully.");

		searchContacts(
			document.getElementById("searchInput").value.trim()
		);
	};

	xhr.onerror = function () {
		showToast("Network error. Please try again.", "error");
	};

	xhr.send(JSON.stringify({
		contactId: contactIdToDelete,
		userId: userId
	}));
}

document.addEventListener("DOMContentLoaded", readCookie);
