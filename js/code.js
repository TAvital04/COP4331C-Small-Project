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
