let userId = 0;
let firstName = "";
let lastName = "";

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

document.addEventListener("DOMContentLoaded", readCookie);
