
// ===============================
// PESAN STATUS
// ===============================

function showMessage(form, message, isError = false) {
    let messageBox = form.querySelector(".auth-message");

    if (!messageBox) {
        messageBox = document.createElement("p");
        messageBox.className = "auth-message";
        messageBox.style.fontSize = "14px";
        messageBox.style.marginTop = "12px";
        form.appendChild(messageBox);
    }

    messageBox.textContent = message;
    messageBox.style.color = isError ? "#D93025" : "#27834A";
}

// ===============================
// REGISTER MAHASISWA
// ===============================

const registerForm = document.querySelector("#registerForm");

if (registerForm) {
    registerForm.addEventListener("submit", async function (event) {
        event.preventDefault();

        const button = registerForm.querySelector("button[type='submit']");

        const fullName = document.querySelector("#fullname").value.trim();
        const email = document.querySelector("#email").value.trim();
        const university = document.querySelector("#university").value.trim();
        const semester = document.querySelector("#semester").value;
        const password = document.querySelector("#password").value;

        if (!fullName || !email || !university || !semester || !password) {
            showMessage(registerForm, "Semua data wajib diisi.", true);
            return;
        }

        if (password.length < 6) {
            showMessage(registerForm, "Password minimal 6 karakter.", true);
            return;
        }

        button.disabled = true;
        button.textContent = "Creating Account...";

        try {
            const { data, error } = await supabaseClient.auth.signUp({
                email: email,
                password: password,
                options: {
                    data: {
                        full_name: fullName,
                        university: university,
                        semester: semester
                    }
                }
            });

            if (error) throw error;

            if (data.session) {
                showMessage(registerForm, "Akun berhasil dibuat! Mengalihkan...");
                window.location.href = "student.html";
            } else {
                showMessage(
                    registerForm,
                    "Pendaftaran berhasil. Silakan periksa email untuk verifikasi sebelum login."
                );
                button.disabled = false;
                button.textContent = "Create Account";
            }

        } catch (error) {
            showMessage(registerForm, error.message, true);
            button.disabled = false;
            button.textContent = "Create Account";
        }
    });
}

// ===============================
// LOGIN MAHASISWA DAN ADMIN
// ===============================

const loginForm = document.querySelector("#loginForm");

if (loginForm) {
    loginForm.addEventListener("submit", async function (event) {
        event.preventDefault();

        const button = loginForm.querySelector("button[type='submit']");

        const email = document.querySelector("#email").value.trim();
        const password = document.querySelector("#password").value;

        if (!email || !password) {
            showMessage(loginForm, "Email dan password wajib diisi.", true);
            return;
        }

        button.disabled = true;
        button.textContent = "Logging in...";

        try {
            const { data, error } =
                await supabaseClient.auth.signInWithPassword({
                    email: email,
                    password: password
                });

            if (error) throw error;

            const { data: profile, error: profileError } =
                await supabaseClient
                    .from("profiles")
                    .select("role")
                    .eq("id", data.user.id)
                    .single();

            if (profileError) throw profileError;

            if (profile.role === "admin") {
                window.location.href = "admin.html";
            } else if (profile.role === "student") {
                window.location.href = "student.html";
            } else {
                throw new Error("Role akun tidak dikenali.");
            }

        } catch (error) {
            showMessage(loginForm, error.message, true);

            await supabaseClient.auth.signOut();

            button.disabled = false;
            button.textContent = "Login";
        }
    });
}
